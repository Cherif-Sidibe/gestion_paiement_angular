import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DepositRequest, PaymentMethod } from '@core/models/transaction.model';
import { Wallet } from '@core/models/wallet.model';
import {
  WALLET_API_SERVICE_TOKEN,
  WalletApiServiceInterface,
} from '@core/services/interfaces/wallet-api.interface';
import { ToastService } from '@core/services/toast.service';
import { PhonePipe } from '@shared/pipes/phone.pipe';
import { XofPipe } from '@shared/pipes/xof.pipe';

@Component({
  selector: 'app-agent-deposit',
  standalone: true,
  imports: [ReactiveFormsModule, PhonePipe, XofPipe],
  template: `
    <h1 class="h3 mb-3">Dépôt sur un wallet</h1>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <label class="form-label">Charger un wallet par téléphone (optionnel)</label>
        <form class="row g-2" (ngSubmit)="loadWallet()">
          <div class="col">
            <input
              type="text"
              class="form-control"
              placeholder="+221779998877"
              [formControl]="phone"
            />
          </div>
          <div class="col-auto">
            <button
              type="submit"
              class="btn btn-outline-primary"
              [disabled]="loadingWallet || phone.invalid"
            >
              @if (loadingWallet) {
                <span class="spinner-border spinner-border-sm me-1"></span>
              }
              <i class="bi bi-search"></i> Charger
            </button>
          </div>
        </form>

        @if (wallet) {
          <div class="alert alert-info mt-3 mb-0">
            Wallet <strong>{{ wallet.code }}</strong>
            ({{ wallet.phoneNumber | phone }}) — solde actuel :
            <strong>{{ wallet.balance | xof }}</strong>
          </div>
        }
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="walletId">Identifiant du wallet</label>
              <input
                id="walletId"
                type="text"
                class="form-control"
                formControlName="walletId"
                [class.is-invalid]="isFieldInvalid('walletId')"
              />
              @if (isFieldInvalid('walletId')) {
                <div class="invalid-feedback">L'identifiant du wallet est requis.</div>
              }
            </div>

            <div class="col-md-3">
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

            <div class="col-md-3">
              <label class="form-label" for="paymentMethod">Méthode</label>
              <select
                id="paymentMethod"
                class="form-select"
                formControlName="paymentMethod"
                [class.is-invalid]="isFieldInvalid('paymentMethod')"
              >
                <option value="CREDIT_CARD">Carte de crédit</option>
                <option value="WALLET_TARGET">Wallet</option>
              </select>
              @if (isFieldInvalid('paymentMethod')) {
                <div class="invalid-feedback">La méthode est requise.</div>
              }
            </div>
          </div>

          <div class="d-flex justify-content-end mt-3">
            <button type="submit" class="btn btn-primary" [disabled]="submitting">
              @if (submitting) {
                <span class="spinner-border spinner-border-sm me-1"></span>
              }
              Effectuer le dépôt
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AgentDepositComponent {
  phone = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  wallet?: Wallet;
  loadingWallet = false;

  form: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    @Inject(WALLET_API_SERVICE_TOKEN)
    private walletApi: WalletApiServiceInterface,
  ) {
    this.form = this.fb.group({
      walletId: ['', [Validators.required]],
      amount: [null as number | null, [Validators.required, Validators.min(1)]],
      paymentMethod: ['CREDIT_CARD' as PaymentMethod, [Validators.required]],
    });
  }

  get f() {
    return this.form.controls;
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.f[field];
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  loadWallet(): void {
    if (this.phone.invalid) {
      return;
    }
    this.loadingWallet = true;
    this.walletApi.getWalletByPhone(this.phone.value.trim()).subscribe({
      next: (wallet) => {
        this.wallet = wallet;
        this.form.patchValue({ walletId: wallet.id });
        this.loadingWallet = false;
      },
      error: () => {
        this.loadingWallet = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const walletId: string = this.form.value.walletId;
    const req: DepositRequest = {
      amount: this.form.value.amount,
      paymentMethod: this.form.value.paymentMethod,
    };
    this.walletApi.deposit(walletId, req).subscribe({
      next: () => {
        this.submitting = false;
        this.toast.success('Dépôt effectué avec succès.');
        this.form.patchValue({ amount: null });
        this.refreshBalance();
      },
      error: () => {
        this.submitting = false;
      },
    });
  }

  private refreshBalance(): void {
    if (!this.wallet) {
      return;
    }
    this.walletApi.getWalletByPhone(this.wallet.phoneNumber).subscribe({
      next: (wallet) => (this.wallet = wallet),
    });
  }
}
