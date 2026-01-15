export type TransactionType = 'expense' | 'income';
export type Currency = 'USD' | 'VES';
export type RateType = 'bcv' | 'euro' | 'usdt' | null;
export interface RateData {
  bcv: number;
  euro: number;
  usdt: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number; // Stored in USD
  category: string;
  date: string; // ISO String YYYY-MM-DD
  type: TransactionType;
  originalAmount?: number;
  originalCurrency?: Currency;
  rateType?: RateType; // Type of exchange rate used
  rateValue?: number; // Actual rate value at time of transaction
}

export interface ExpenseAnalysis {
  amount: number;
  currency: Currency;
  category: string;
  description: string;
  date: string; // ISO YYYY-MM-DD
  type: TransactionType;
  rate_type?: RateType; // Rate type detected from voice command
  is_invalid?: boolean; // Flag if command is not a financial transaction
}

export enum AppState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  TYPING = 'TYPING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}