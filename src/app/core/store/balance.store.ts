import { Injectable, inject, signal } from '@angular/core';
import { WALLET_API_SERVICE_TOKEN } from '@core/services/interfaces/wallet-api.interface';

@Injectable({
  providedIn: 'root',
})
export class BalanceStore {
  private readonly walletApi = inject(WALLET_API_SERVICE_TOKEN);

  private readonly _balance = signal<number>(0);
  readonly balance = this._balance.asReadonly();

  refresh(phone: string): void {
    this.walletApi
      .getBalance(phone)
      .subscribe((balance) => this._balance.set(balance));
  }
}
