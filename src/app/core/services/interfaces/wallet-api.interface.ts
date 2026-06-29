import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '@core/models/rest-response.model';
import { Wallet, WalletCreateRequest } from '@core/models/wallet.model';
import {
  DepositRequest,
  Transaction,
  WithdrawRequest,
} from '@core/models/transaction.model';

export interface WalletApiServiceInterface {
  listWallets(page: number, size: number): Observable<PageResponse<Wallet>>;
  createWallet(req: WalletCreateRequest): Observable<Wallet>;
  getWalletByPhone(phone: string): Observable<Wallet>;
  getBalance(phone: string): Observable<number>;
  deposit(walletId: string, req: DepositRequest): Observable<Transaction>;
  withdraw(req: WithdrawRequest): Observable<Transaction>;
}

export const WALLET_API_SERVICE_TOKEN =
  new InjectionToken<WalletApiServiceInterface>('WalletApiServiceInterface');
