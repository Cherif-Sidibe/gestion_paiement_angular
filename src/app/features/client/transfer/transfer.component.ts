import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SessionStore } from '@core/store/session.store';
import { BalanceStore } from '@core/store/balance.store';
import { TransferRequest } from '@core/models/transaction.model';
import { WALLET_API_SERVICE_TOKEN } from '@core/services/interfaces/wallet-api.interface';
import { ToastService } from '@core/services/toast.service';
import {
  differentPhoneValidator,
  receiverExistsValidator,
} from '@core/validators/transfer.validators';
import { XofPipe } from '@shared/pipes/xof.pipe';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [ReactiveFormsModule, XofPipe],
  template: `
    <h1 class="h3 mb-3">Transfert</h1>

    <div class="row">
      <div class="col-lg-7">
        <div class="card shadow-sm">
          <div class="card-body">
            <p class="text-muted">
              Solde disponible : <strong>{{ balance() | xof }}</strong>
            </p>

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label class="form-label" for="destination">
                  Numéro du destinataire
                </label>
                <input
                  id="destination"
                  type="text"
                  class="form-control"
                  placeholder="+221770000001"
                  formControlName="destination"
                  [class.is-invalid]="isFieldInvalid('destination')"
                />
                @if (f['destination'].pending) {
                  <div class="form-text">
                    <span class="spinner-border spinner-border-sm me-1"></span>
                    Vérification du destinataire…
                  </div>
                }
                @if (isFieldInvalid('destination')) {
                  <div class="invalid-feedback">
                    @if (f['destination'].errors?.['required']) {
                      Le numéro du destinataire est requis.
                    } @else if (f['destination'].errors?.['pattern']) {
                      Format attendu : +221 suivi de 9 chiffres.
                    } @else if (f['destination'].errors?.['samePhone']) {
                      Le destinataire doit être différent de votre numéro.
                    } @else if (f['destination'].errors?.['receiverNotFound']) {
                      Aucun wallet ne correspond à ce numéro.
                    }
                  </div>
                }
              </div>

              <div class="mb-3">
                <label class="form-label" for="amount">Montant</label>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  class="form-control"
                  formControlName="amount"
                  [class.is-invalid]="isFieldInvalid('amount')"
                />
                @if (isFieldInvalid('amount')) {
                  <div class="invalid-feedback">
                    @if (f['amount'].errors?.['required']) {
                      Le montant est requis.
                    } @else if (f['amount'].errors?.['min']) {
                      Le montant doit être supérieur à 0.
                    }
                  </div>
                }
              </div>

              <div class="mb-3">
                <label class="form-label" for="description">
                  Description <span class="text-muted">(optionnel)</span>
                </label>
                <input
                  id="description"
                  type="text"
                  class="form-control"
                  formControlName="description"
                />
              </div>

              <div class="d-flex justify-content-end">
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="submitting || form.pending"
                >
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-1"></span>
                  }
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TransferComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly session = inject(SessionStore);
  private readonly balanceStore = inject(BalanceStore);
  private readonly toast = inject(ToastService);
  private readonly walletApi = inject(WALLET_API_SERVICE_TOKEN);

  readonly balance = this.balanceStore.balance;
  form!: FormGroup;
  submitting = false;

  ngOnInit(): void {
    const phone = this.session.currentPhone();
    this.balanceStore.refresh(phone ?? '');
    this.form = this.fb.group({
      destination: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.pattern(/^\+221[0-9]{9}$/),
          differentPhoneValidator(phone),
        ],
        asyncValidators: [receiverExistsValidator(this.walletApi)],
        updateOn: 'blur',
      }),
      amount: [null as number | null, [Validators.required, Validators.min(1)]],
      description: [''],
    });
  }

  get f() {
    return this.form.controls;
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.f[field];
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }
    const phone = this.session.currentPhone();
    if (!phone) {
      return;
    }
    this.submitting = true;
    const req: TransferRequest = {
      senderPhone: phone,
      receiverPhone: (this.form.value.destination as string).trim(),
      amount: this.form.value.amount,
    };
    this.walletApi.transfer(req).subscribe({
      next: () => {
        this.submitting = false;
        this.toast.success('Transfert effectué avec succès.');
        this.form.reset({ destination: '', amount: null, description: '' });
        this.balanceStore.refresh(phone);
      },
      error: () => {
        this.submitting = false;
      },
    });
  }
}
