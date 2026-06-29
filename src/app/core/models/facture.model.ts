export type FactureService = 'ISM' | 'WOYAFAL';

export interface Facture {
  id: number;
  reference: string;
  walletCode: string;
  service: string;
  montant: number;
  mois: string;
  payee: boolean;
  datePaiement: string | null;
}

export interface PayRequest {
  phoneNumber: string;
  serviceName: string;
  amount: number;
}

export interface PayFacturesRequest {
  phoneNumber: string;
  serviceName: string;
  factureReferences: string[];
}
