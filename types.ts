export type TransactionType = 'expense' | 'income';
export type Currency = 'USD' | 'VES';

export interface Transaction {
  id: string;
  description: string;
  amount: number; // Stored in USD
  category: string;
  date: string; // ISO String YYYY-MM-DD
  type: TransactionType;
}

export interface ExpenseAnalysis {
  amount: number;
  currency: Currency;
  category: string;
  description: string;
  date: string; // ISO YYYY-MM-DD
  type: TransactionType;
}

export enum AppState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}