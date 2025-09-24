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

export type DateAndTime = {
  date: string;
  time: string;
};

export type Summary = {
  balance: number;
  income: number;
  expenses: number;
};

export type Settings = {
  language: "en" | "id";
};
