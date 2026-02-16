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
  createdAt?: string; // Precision timestamp
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

export interface FinancialHealthAnswer {
  questionId: string;
  answer: string | number;
}

export interface FinancialHealthTest {
  completed: boolean;
  answers: FinancialHealthAnswer[];
  score?: number;
  completedAt?: string;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  day: number; // 1-31
  type: TransactionType;
  category?: string;
}

export interface SavingsMission {
  id: string;
  code?: string;
  title: string;
  description: string;
  tip: string;
  targetAmount?: number;
  currentProgress: number;
  targetProgress: number; // 0-100
  status: 'locked' | 'active' | 'completed';
  type: 'days' | 'amount' | 'habit';
  icon: string;
}

export interface UserSettings {
  theme?: 'light' | 'dark';
}

export interface UserData {
  transactions: Transaction[];
  savingsMissions: SavingsMission[];
  recurringTransactions: RecurringTransaction[] | undefined;
  settings?: UserSettings;
}