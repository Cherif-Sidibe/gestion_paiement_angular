import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '@env/environment';
import {
  PageResponse,
  RestResponse,
} from '@core/models/rest-response.model';
import { Wallet, WalletCreateRequest } from '@core/models/wallet.model';
import {
  DepositRequest,
  Transaction,
  TransferRequest,
  WithdrawRequest,
} from '@core/models/transaction.model';
import { SKIP_ERROR_TOAST } from '@core/interceptors/error.interceptor';
import { WalletApiServiceInterface } from './interfaces/wallet-api.interface';

interface BalanceBody {
  code: string;
  phoneNumber: string;
  balance: number;
  currency: string;
}

@Injectable({
  providedIn: 'root',
})
export class WalletApiService implements WalletApiServiceInterface {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiBaseUrl}/api/wallets`;

  listWallets(page: number, size: number): Observable<PageResponse<Wallet>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<Wallet>>(this.BASE, { params });
  }

  createWallet(req: WalletCreateRequest): Observable<Wallet> {
    return this.http
      .post<RestResponse<Wallet>>(this.BASE, req)
      .pipe(map((res) => res.body));
  }

  getWalletByPhone(phone: string): Observable<Wallet> {
    return this.http
      .get<RestResponse<Wallet>>(`${this.BASE}/${this.encodePhone(phone)}`)
      .pipe(map((res) => res.body));
  }

  walletExists(phone: string): Observable<boolean> {
    return this.http
      .get<RestResponse<Wallet>>(`${this.BASE}/${this.encodePhone(phone)}`, {
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      })
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

  getBalance(phone: string): Observable<number> {
    return this.http
      .get<RestResponse<BalanceBody>>(
        `${this.BASE}/${this.encodePhone(phone)}/balance`,
      )
      .pipe(map((res) => res.body?.balance ?? 0));
  }

  getTransactions(phone: string): Observable<Transaction[]> {
    return this.http
      .get<RestResponse<Transaction[]>>(
        `${this.BASE}/${this.encodePhone(phone)}/transactions`,
      )
      .pipe(map((res) => res.body ?? []));
  }

  deposit(walletId: string, req: DepositRequest): Observable<Transaction> {
    return this.http
      .post<RestResponse<Transaction>>(`${this.BASE}/${walletId}/deposit`, req)
      .pipe(map((res) => res.body));
  }

  withdraw(req: WithdrawRequest): Observable<Transaction> {
    return this.http
      .post<RestResponse<Transaction>>(`${this.BASE}/withdraw`, req)
      .pipe(map((res) => res.body));
  }

  transfer(req: TransferRequest): Observable<Transaction> {
    return this.http
      .post<RestResponse<Transaction>>(`${this.BASE}/transfer`, req)
      .pipe(map((res) => res.body));
  }

  private encodePhone(phone: string): string {
    return encodeURIComponent(phone);
  }
}
