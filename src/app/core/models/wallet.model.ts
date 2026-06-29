export interface Wallet {
  id: string;
  code: string;
  phoneNumber: string;
  email: string;
  currency: string;
  balance: number;
  createdAt: string;
}

export interface WalletCreateRequest {
  phoneNumber: string;
  email: string;
  initialBalance: number;
  code: string;
  currency: string;
}
