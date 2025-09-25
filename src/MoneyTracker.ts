import { db } from "./IndexedDbService";
import type { Transaction } from "./Transaction";
import type { Settings, Summary } from "./types";

export class MoneyTracker {
  private language: "en" | "id";
  private balance: number;
  private income: number;
  private expenses: number;
  private transactions: Transaction[];

  constructor() {
    this.language = "id";
    this.balance = 0;
    this.income = 0;
    this.expenses = 0;
    this.transactions = [];
  }

  async loadState(): Promise<void> {
    const savedData = {
      summary: await db.get<Summary>("summary"),
      transactions: await db.getAll<Transaction>("transactions"),
      settings: await db.get<Settings>("settings"),
    };

    if (savedData.summary) {
      this.balance = savedData.summary.balance;
      this.income = savedData.summary.income;
      this.expenses = savedData.summary.expenses;
    }

    if (savedData.transactions.length) {
      this.transactions = savedData.transactions;
    }

    if (savedData.settings) {
      this.language = savedData.settings.language;
    }
  }

  async saveState<T>(
    storeName: keyof typeof db.STORE_NAMES,
    value: T,
    key?: string
  ) {
    await db.add(storeName, value, key);
  }

  async resetState(): Promise<void> {
    this.language = "id";
    this.balance = 0;
    this.income = 0;
    this.expenses = 0;
    this.transactions = [];

    await db.clear(["summary", "transactions", "settings"]);
  }

  getLanguage(): "en" | "id" {
    return this.language;
  }

  getBalance(): number {
    return this.balance;
  }

  getIncome(): number {
    return this.income;
  }

  getExpenses(): number {
    return this.expenses;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  async setLanguage(locale: "en" | "id") {
    this.language = locale;
    await this.saveState<Settings>("settings", { language: this.language });
  }

  async createTransaction(transaction: Transaction): Promise<void> {
    transaction.balanceStart = this.balance;

    if (transaction.type === "income") {
      this.balance += transaction.amount;
      this.income += transaction.amount;
    } else {
      this.balance -= transaction.amount;
      this.expenses += transaction.amount;
    }

    transaction.balanceEnd = this.balance;
    this.transactions.push(transaction);

    await this.saveState<Summary>("summary", {
      balance: this.balance,
      income: this.income,
      expenses: this.expenses,
    });
    await this.saveState<Transaction>("transactions", transaction);
  }
}
