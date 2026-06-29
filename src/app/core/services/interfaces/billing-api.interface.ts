import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Facture,
  PayFacturesRequest,
  PayRequest,
} from '@core/models/facture.model';
import { Transaction } from '@core/models/transaction.model';

export interface BillingApiServiceInterface {
  getCurrentFactures(walletCode: string, unite?: string): Observable<Facture[]>;
  getFacturesByPeriode(
    walletCode: string,
    debut: string,
    fin: string,
  ): Observable<Facture[]>;
  pay(req: PayRequest): Observable<Transaction>;
  payFactures(req: PayFacturesRequest): Observable<Transaction>;
}

export const BILLING_API_SERVICE_TOKEN =
  new InjectionToken<BillingApiServiceInterface>('BillingApiServiceInterface');
