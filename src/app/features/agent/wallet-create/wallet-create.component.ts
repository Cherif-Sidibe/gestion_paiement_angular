import { Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { WalletCreateRequest } from '@core/models/wallet.model';
import {
  WALLET_API_SERVICE_TOKEN,
  WalletApiServiceInterface,
} from '@core/services/interfaces/wallet-api.interface';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-wallet-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="card shadow-sm">
      <div class="card-body">
        <h2 class="h5 mb-3">
          <i class="bi bi-plus-circle"></i> Créer un wallet
        </h2>

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
              <label class="form-label" for="email">Email</label>
              <input
                id="email"
                type="email"
                class="form-control"
                placeholder="client@exemple.com"
                formControlName="email"
                [class.is-invalid]="isFieldInvalid('email')"
              />
              @if (isFieldInvalid('email')) {
                <div class="invalid-feedback">
                  @if (f['email'].errors?.['required']) {
                    L'email est requis.
                  } @else if (f['email'].errors?.['email']) {
                    L'email n'est pas valide.
                  }
                </div>
              }
            </div>

            <div class="col-md-4">
              <label class="form-label" for="code">Code</label>
              <input
                id="code"
                type="text"
                class="form-control"
                placeholder="WALLET-001"
                formControlName="code"
                [class.is-invalid]="isFieldInvalid('code')"
              />
              @if (isFieldInvalid('code')) {
                <div class="invalid-feedback">Le code est requis.</div>
              }
            </div>

            <div class="col-md-4">
              <label class="form-label" for="initialBalance">Solde initial</label>
              <input
                id="initialBalance"
                type="number"
                min="0"
                class="form-control"
                formControlName="initialBalance"
                [class.is-invalid]="isFieldInvalid('initialBalance')"
              />
              @if (isFieldInvalid('initialBalance')) {
                <div class="invalid-feedback">
                  @if (f['initialBalance'].errors?.['required']) {
                    Le solde initial est requis.
                  } @else if (f['initialBalance'].errors?.['min']) {
                    Le solde doit être positif ou nul.
                  }
                </div>
              }
            </div>

            <div class="col-md-4">
              <label class="form-label" for="currency">Devise</label>
              <input
                id="currency"
                type="text"
                class="form-control"
                formControlName="currency"
                [class.is-invalid]="isFieldInvalid('currency')"
              />
              @if (isFieldInvalid('currency')) {
                <div class="invalid-feedback">La devise est requise.</div>
              }
            </div>
          </div>

          <div class="d-flex justify-content-end mt-3">
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="submitting"
            >
              @if (submitting) {
                <span class="spinner-border spinner-border-sm me-1"></span>
              }
              Créer le wallet
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class WalletCreateComponent {
  @Output() created = new EventEmitter<void>();

  form: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    @Inject(WALLET_API_SERVICE_TOKEN)
    private walletApi: WalletApiServiceInterface,
  ) {
    this.form = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+221[0-9]{9}$/)]],
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required]],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      currency: ['XOF', [Validators.required]],
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
    const req: WalletCreateRequest = this.form.value;
    this.walletApi.createWallet(req).subscribe({
      next: () => {
        this.submitting = false;
        this.toast.success('Wallet créé avec succès.');
        this.form.reset({ initialBalance: 0, currency: 'XOF' });
        this.created.emit();
      },
      error: () => {
        this.submitting = false;
      },
    });
  }
}
