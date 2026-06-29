import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { WithdrawRequest } from '@core/models/transaction.model';
import {
  WALLET_API_SERVICE_TOKEN,
  WalletApiServiceInterface,
} from '@core/services/interfaces/wallet-api.interface';
import { ToastService } from '@core/services/toast.service';
import { XofPipe } from '@shared/pipes/xof.pipe';

@Component({
  selector: 'app-agent-withdraw',
  standalone: true,
  imports: [ReactiveFormsModule, XofPipe],
  template: `
    <h1 class="h3 mb-3">Retrait d'un wallet</h1>

    <div class="card shadow-sm">
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="phoneNumber">Téléphone</label>
              <input
                id="phoneNumber"
                type="text"
                class="form-control"
                placeholder="+221779998877"
                formControlName="phoneNumber"
                [class.is-invalid]="isFieldInvalid('phoneNumber')"
              />
              @if (isFieldInvalid('phoneNumber')) {
                <div class="invalid-feedback">
                  @if (f['phoneNumber'].errors?.['required']) {
                    Le téléphone est requis.
                  } @else if (f['phoneNumber'].errors?.['pattern']) {
                    Format attendu : +221 suivi de 9 chiffres.
                  }
                </div>
              }
            </div>

            <div class="col-md-6">
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
          </div>

          <div class="d-flex justify-content-end mt-3">
            <button type="submit" class="btn btn-primary" [disabled]="submitting">
              @if (submitting) {
                <span class="spinner-border spinner-border-sm me-1"></span>
              }
              Effectuer le retrait
            </button>
          </div>
        </form>

        @if (lastFees != null) {
          <div class="alert alert-success mt-3 mb-0">
            Retrait effectué — frais appliqués : <strong>{{ lastFees | xof }}</strong>
          </div>
        }
      </div>
    </div>
  `,
})
export class AgentWithdrawComponent {
  form: FormGroup;
  submitting = false;
  lastFees: number | null = null;

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    @Inject(WALLET_API_SERVICE_TOKEN)
    private walletApi: WalletApiServiceInterface,
  ) {
    this.form = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+221[0-9]{9}$/)]],
      amount: [null as number | null, [Validators.required, Validators.min(1)]],
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.lastFees = null;
    const req: WithdrawRequest = this.form.value;
    this.walletApi.withdraw(req).subscribe({
      next: (transaction) => {
        this.submitting = false;
        this.lastFees = transaction?.fees ?? null;
        this.toast.success('Retrait effectué avec succès.');
        this.form.patchValue({ amount: null });
      },
      error: () => {
        this.submitting = false;
      },
    });
  }
}
