export type PaymentMethod = 'CREDIT_CARD' | 'WALLET_TARGET';

export type TransactionType =
  | 'DEPOT'
  | 'RETRAIT'
  | 'TRANSFERT_ENVOYE'
  | 'TRANSFERT_RECU'
  | 'PAIEMENT';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  walletId: string;
  reference?: string;
  paymentMethod?: PaymentMethod;
  counterpartyPhone?: string;
  fees?: number;
  createdAt: string;
}

export interface DepositRequest {
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface WithdrawRequest {
  phoneNumber: string;
  amount: number;
}

export interface TransferRequest {
  sourcePhone: string;
  targetPhone: string;
  amount: number;
}
