export type FiatCurrency = "USD" | "EUR";

export type CryptoCurrency = "WETH" | "WMATIC";

export type PaymentType = "CreditCard" | "ACH" | "Wire" | "Crypto" | "Coinbase";

export type PaymentStatus = "processed" | "processing" | "error";

export type CreditCard = {
  type: "CreditCard";
  cardNumber: string;
  expiryDate: string;
  secureCode: string;
  nameOnCard: string;
};

export type AchAccount = {
  type: "ACH";
  accountId: string;
  publicToken: string;
  // accountName: string;
};

export type BankCountry = {
  lable?: string;
  value?: string;
};

export type WireAccount = {
  type: "Wire";
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  bankCountry: BankCountry;
};

export type CryptoAddress = {
  type: "Crypto";
};

export type CoinbaseAddress = {
  type: "Coinbase";
};

export type PaymentMethod = CreditCard | AchAccount | WireAccount | CryptoAddress | CoinbaseAddress;

export interface PaymentDetails {
  type: PaymentType;
  status: PaymentStatus;
  cardNumber: string;
  referenceNumber: string;
}
