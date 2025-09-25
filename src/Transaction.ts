import type { ExpenseCategory, IncomeCategory } from "./types";

export class Transaction {
  type: "income" | "expense";
  amount: number;
  category: IncomeCategory | ExpenseCategory;
  balanceStart: number;
  balanceEnd: number;
  note?: string;
  readonly date: Date;

  constructor(
    type: "income" | "expense",
    amount: number,
    category: IncomeCategory | ExpenseCategory,
    note?: string
  ) {
    this.type = type;
    this.amount = amount;
    this.category = category;
    this.balanceStart = 0;
    this.balanceEnd = 0;
    this.note = note || undefined;
    this.date = new Date();
  }
}
