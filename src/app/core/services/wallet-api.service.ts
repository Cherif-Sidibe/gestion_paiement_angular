import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import {
  PageResponse,
  RestResponse,
} from '@core/models/rest-response.model';
import { Wallet, WalletCreateRequest } from '@core/models/wallet.model';
import {
  DepositRequest,
  Transaction,
  WithdrawRequest,
} from '@core/models/transaction.model';
import { WalletApiServiceInterface } from './interfaces/wallet-api.interface';

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
      .get<RestResponse<Wallet>>(`${this.BASE}/phone/${this.encodePhone(phone)}`)
      .pipe(map((res) => res.body));
  }

  getBalance(phone: string): Observable<number> {
    return this.http
      .get<RestResponse<number>>(
        `${this.BASE}/phone/${this.encodePhone(phone)}/balance`,
      )
      .pipe(map((res) => res.body));
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

  private encodePhone(phone: string): string {
    return encodeURIComponent(phone);
  }
}
