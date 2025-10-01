import type { translations } from "@/locales";

export type TransactionType = "income" | "expense";

export type IncomeCategory =
  | "allowance"
  | "business"
  | "freelance"
  | "gift"
  | "investment"
  | "pension"
  | "royalty"
  | "salary"
  | "other";

export type ExpenseCategory =
  | "bills"
  | "charity"
  | "debt"
  | "entertainment"
  | "food"
  | "health"
  | "shopping"
  | "transport"
  | "other";

export type Locale = "en-US" | "id-ID";

export type Summary = {
  balance: number;
  income: number;
  expenses: number;
};

export type Transaction = {
  type: TransactionType;
  amount: number;
  category: IncomeCategory | ExpenseCategory;
  balanceStart: number;
  balanceEnd: number;
  note?: string;
  date: Date;
};

export type Settings = {
  language: Locale;
};

export type MoneyTracker = {
  summary: Summary;
  transactions: Transaction[];
  settings: Settings;
};

export type DateAndTime = {
  date: string;
  time: string;
};

export type Currency = "USD" | "IDR";

export type AddTransactionInput = {
  type: TransactionType;
  amount: number;
  category: IncomeCategory | ExpenseCategory;
  note?: string;
};

export type MoneyTrackerContext = {
  moneyTracker: MoneyTracker;
  addTransaction: (tx: AddTransactionInput) => void;
  changeLanguage: (locale: Locale) => void;
  reset: () => void;
  errors: AppErrors;
};

export type TranslateKey = keyof (typeof translations)["en-US"];

export type TranslationContext = {
  locale: string;
  applyTranslation: (locale: Locale) => void;
  translate: (key: TranslateKey) => string;
};

export type ContextProviderProps<T> = {
  children: T;
};

export type AppErrors = {
  save?: Error | null;
  load?: Error | null;
  reset?: Error | null;
};

export type IncomeFormData = {
  amount: string;
  category: "" | IncomeCategory;
  note: string;
};

export type ExpenseFormData = {
  amount: string;
  category: "" | ExpenseCategory;
  note: string;
};
