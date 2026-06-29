import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { RestResponse } from '@core/models/rest-response.model';
import {
  Facture,
  PayFacturesRequest,
  PayRequest,
} from '@core/models/facture.model';
import { Transaction } from '@core/models/transaction.model';
import { BillingApiServiceInterface } from './interfaces/billing-api.interface';

@Injectable({
  providedIn: 'root',
})
export class BillingApiService implements BillingApiServiceInterface {
  private readonly http = inject(HttpClient);
  private readonly FACTURES = `${environment.apiBaseUrl}/api/external/factures`;
  private readonly WALLETS = `${environment.apiBaseUrl}/api/wallets`;

  getCurrentFactures(walletCode: string, unite?: string): Observable<Facture[]> {
    let params = new HttpParams();
    if (unite) {
      params = params.set('unite', unite);
    }
    return this.http
      .get<RestResponse<Facture[]>>(`${this.FACTURES}/${walletCode}/current`, {
        params,
      })
      .pipe(map((res) => res.body ?? []));
  }

  getFacturesByPeriode(
    walletCode: string,
    debut: string,
    fin: string,
  ): Observable<Facture[]> {
    const params = new HttpParams().set('debut', debut).set('fin', fin);
    return this.http
      .get<RestResponse<Facture[]>>(`${this.FACTURES}/${walletCode}/periode`, {
        params,
      })
      .pipe(map((res) => res.body ?? []));
  }

  pay(req: PayRequest): Observable<Transaction> {
    return this.http
      .post<RestResponse<Transaction>>(`${this.WALLETS}/pay`, req)
      .pipe(map((res) => res.body));
  }

  payFactures(req: PayFacturesRequest): Observable<Transaction> {
    return this.http
      .post<RestResponse<Transaction>>(`${this.WALLETS}/pay-factures`, req)
      .pipe(map((res) => res.body));
  }
}
