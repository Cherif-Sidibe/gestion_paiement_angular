import { Component, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Wallet } from '@core/models/wallet.model';
import {
  WALLET_API_SERVICE_TOKEN,
  WalletApiServiceInterface,
} from '@core/services/interfaces/wallet-api.interface';
import { PhonePipe } from '@shared/pipes/phone.pipe';
import { XofPipe } from '@shared/pipes/xof.pipe';

@Component({
  selector: 'app-wallet-search',
  standalone: true,
  imports: [ReactiveFormsModule, PhonePipe, XofPipe],
  template: `
    <h1 class="h3 mb-3">Rechercher un wallet</h1>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <form class="row g-2" (ngSubmit)="search()">
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
              class="btn btn-primary"
              [disabled]="loading || phone.invalid"
            >
              @if (loading) {
                <span class="spinner-border spinner-border-sm me-1"></span>
              }
              <i class="bi bi-search"></i> Rechercher
            </button>
          </div>
        </form>
      </div>
    </div>

    @if (wallet) {
      <div class="card shadow-sm">
        <div class="card-body">
          <h2 class="h5 mb-3">Détails du wallet</h2>
          <dl class="row mb-0">
            <dt class="col-sm-3">Code</dt>
            <dd class="col-sm-9">{{ wallet.code }}</dd>

            <dt class="col-sm-3">Téléphone</dt>
            <dd class="col-sm-9">{{ wallet.phoneNumber | phone }}</dd>

            <dt class="col-sm-3">Email</dt>
            <dd class="col-sm-9">{{ wallet.email }}</dd>

            <dt class="col-sm-3">Solde</dt>
            <dd class="col-sm-9 fw-semibold">{{ wallet.balance | xof }}</dd>

            <dt class="col-sm-3">Devise</dt>
            <dd class="col-sm-9">{{ wallet.currency }}</dd>
          </dl>
        </div>
      </div>
    }
  `,
})
export class WalletSearchComponent {
  phone = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  wallet?: Wallet;
  loading = false;

  constructor(
    @Inject(WALLET_API_SERVICE_TOKEN)
    private walletApi: WalletApiServiceInterface,
  ) {}

  search(): void {
    if (this.phone.invalid) {
      return;
    }
    this.loading = true;
    this.wallet = undefined;
    this.walletApi.getWalletByPhone(this.phone.value.trim()).subscribe({
      next: (wallet) => {
        this.wallet = wallet;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
