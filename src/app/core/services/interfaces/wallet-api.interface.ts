import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '@core/models/rest-response.model';
import { Wallet, WalletCreateRequest } from '@core/models/wallet.model';
import {
  DepositRequest,
  Transaction,
  TransferRequest,
  WithdrawRequest,
} from '@core/models/transaction.model';

export interface WalletApiServiceInterface {
  listWallets(page: number, size: number): Observable<PageResponse<Wallet>>;
  createWallet(req: WalletCreateRequest): Observable<Wallet>;
  getWalletByPhone(phone: string): Observable<Wallet>;
  walletExists(phone: string): Observable<boolean>;
  getBalance(phone: string): Observable<number>;
  getTransactions(phone: string): Observable<Transaction[]>;
  deposit(walletId: string, req: DepositRequest): Observable<Transaction>;
  withdraw(req: WithdrawRequest): Observable<Transaction>;
  transfer(req: TransferRequest): Observable<Transaction>;
}

export const WALLET_API_SERVICE_TOKEN =
  new InjectionToken<WalletApiServiceInterface>('WalletApiServiceInterface');
