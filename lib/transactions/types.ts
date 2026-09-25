export type TransactionType = "income" | "expense";

export interface TransactionItem {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  transactionDate: string; // ISO date format YYYY-MM-DD
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  userEmail: string;
  userId: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: TransactionItem[];
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  transactionDate: string;
  description?: string;
}

export interface ActionResult<T = unknown> {
  ok: boolean;
  message: string;
  data?: T;
  fieldErrors?: Record<string, string>;
}
