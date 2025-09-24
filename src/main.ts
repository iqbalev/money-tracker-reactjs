import {
  formatCurrency,
  formatDateAndTime,
  translate,
} from "./modules/helpers";
import type { translations } from "./modules/translations";
import type {
  DateAndTime,
  ExpenseCategory,
  IncomeCategory,
  Settings,
  Summary,
} from "./types";

class IndexedDbService {
  DB_NAME = "money-tracker" as const;
  DB_VERSION = 1 as const;
  STORE_NAMES = {
    summary: "summary",
    transactions: "transactions",
    settings: "settings",
  } as const;

  async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.STORE_NAMES.summary);
        db.createObjectStore(this.STORE_NAMES.transactions, {
          keyPath: "id",
          autoIncrement: true,
        });
        db.createObjectStore(this.STORE_NAMES.settings);
      };

      request.onsuccess = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async add<T>(
    storeName: keyof typeof this.STORE_NAMES,
    value: T,
    key?: string
  ): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAMES[storeName], "readwrite");
      const store = tx.objectStore(this.STORE_NAMES[storeName]);

      if (storeName === "transactions") {
        store.add(value);
      } else {
        store.put(value, key || this.STORE_NAMES[storeName]);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async get<T>(
    storeName: keyof typeof this.STORE_NAMES,
    key?: string
  ): Promise<T> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.get(key || this.STORE_NAMES[storeName]);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: keyof typeof this.STORE_NAMES): Promise<T[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeNames: (keyof typeof this.STORE_NAMES)[]): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeNames, "readwrite");

      for (const name of storeNames) {
        tx.objectStore(name).clear();
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

const db = new IndexedDbService();

class MoneyTracker {
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

class Transaction {
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

class UserInterface {
  private moneyTracker: MoneyTracker;
  private balanceP = document.getElementById("balance") as HTMLParagraphElement;
  private incomeP = document.getElementById("income") as HTMLParagraphElement;
  private expensesP = document.getElementById(
    "expenses"
  ) as HTMLParagraphElement;
  private incomeModal = document.getElementById(
    "income-modal"
  ) as HTMLDialogElement;
  private expenseModal = document.getElementById(
    "expense-modal"
  ) as HTMLDialogElement;
  private incomeForm = document.getElementById(
    "income-form"
  ) as HTMLFormElement;
  private expenseForm = document.getElementById(
    "expense-form"
  ) as HTMLFormElement;
  private incomeAmountInput = document.getElementById(
    "income-amount"
  ) as HTMLInputElement;
  private expenseAmountInput = document.getElementById(
    "expense-amount"
  ) as HTMLInputElement;
  private languageSelect = document.getElementById(
    "language"
  ) as HTMLSelectElement;
  private incomeCategorySelect = document.getElementById(
    "income-category"
  ) as HTMLSelectElement;
  private expenseCategorySelect = document.getElementById(
    "expense-category"
  ) as HTMLSelectElement;
  private incomeNoteInput = document.getElementById(
    "income-note"
  ) as HTMLInputElement;
  private expenseNoteInput = document.getElementById(
    "expense-note"
  ) as HTMLInputElement;
  private resetButton = document.getElementById(
    "reset-btn"
  ) as HTMLButtonElement;
  private incomeButton = document.getElementById(
    "income-btn"
  ) as HTMLButtonElement;
  private expenseButton = document.getElementById(
    "expense-btn"
  ) as HTMLButtonElement;
  private incomeCancelButton = document.getElementById(
    "income-cancel-btn"
  ) as HTMLButtonElement;
  private expenseCancelButton = document.getElementById(
    "expense-cancel-btn"
  ) as HTMLButtonElement;
  private transactionsUl = document.getElementById(
    "transactions"
  ) as HTMLUListElement;

  constructor(moneyTracker: MoneyTracker) {
    this.moneyTracker = moneyTracker;
    this.bindEvents();
  }

  bindEvents(): void {
    this.handleLanguageChange(this.languageSelect);
    this.handleModalOpen(this.incomeButton, this.incomeModal);
    this.handleModalOpen(this.expenseButton, this.expenseModal);
    this.handleModalCancel(
      this.incomeCancelButton,
      this.incomeForm,
      this.incomeModal
    );
    this.handleModalCancel(
      this.expenseCancelButton,
      this.expenseForm,
      this.expenseModal
    );
    this.handleFormSubmit(this.incomeForm, this.incomeModal);
    this.handleFormSubmit(this.expenseForm, this.expenseModal);
    this.handleReset(this.resetButton);
  }

  handleLanguageChange(select: HTMLSelectElement) {
    select.addEventListener("change", () => {
      const language = this.languageSelect.value as "en" | "id";
      this.moneyTracker.setLanguage(language);
      this.renderUI();
    });
  }

  handleModalOpen(button: HTMLButtonElement, modal: HTMLDialogElement): void {
    button.addEventListener("click", () => {
      modal.showModal();
    });
  }

  handleModalCancel(
    button: HTMLButtonElement,
    form: HTMLFormElement,
    modal: HTMLDialogElement
  ): void {
    button.addEventListener("click", () => {
      form.reset();
      modal.close();
    });
  }

  handleFormSubmit(form: HTMLFormElement, modal: HTMLDialogElement): void {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      let transaction: Transaction;

      if (form.id === "income-form") {
        const incomeAmount = parseInt(this.incomeAmountInput.value);
        const incomeCategory = this.incomeCategorySelect
          .value as IncomeCategory;
        const incomeNote = this.incomeNoteInput.value.trim() || undefined;

        if (isNaN(incomeAmount) || incomeAmount <= 0) return;
        transaction = new Transaction(
          "income",
          incomeAmount,
          incomeCategory,
          incomeNote
        );
      } else {
        const expenseAmount = parseInt(this.expenseAmountInput.value);
        const expenseCategory = this.expenseCategorySelect
          .value as ExpenseCategory;
        const expenseNote = this.expenseNoteInput.value.trim() || undefined;

        if (isNaN(expenseAmount) || expenseAmount <= 0) return;
        if (expenseAmount > this.moneyTracker.getBalance()) {
          const confirmation = confirm(
            translate(this.moneyTracker.getLanguage(), "out-of-balance-confirm")
          );
          if (!confirmation) return;
        }
        transaction = new Transaction(
          "expense",
          expenseAmount,
          expenseCategory,
          expenseNote
        );
      }

      this.moneyTracker.createTransaction(transaction);

      modal.close();
      form.reset();
      this.renderUI();
    });
  }

  handleReset(button: HTMLButtonElement): void {
    button.addEventListener("click", () => {
      const confirmation = confirm(
        translate(this.moneyTracker.getLanguage(), "reset-confirm")
      );
      if (!confirmation) return;

      this.moneyTracker.resetState();
      this.renderUI();
    });
  }

  renderNoTransactionList(): void {
    const transactionLi = document.createElement("li");
    transactionLi.textContent = translate(
      this.moneyTracker.getLanguage(),
      "no-transactions"
    );
    this.transactionsUl.appendChild(transactionLi);
  }

  renderTransactionList(): void {
    this.moneyTracker.getTransactions().forEach((tx) => {
      const transactionLi = document.createElement("li") as HTMLLIElement;
      const firstDiv = document.createElement("div") as HTMLDivElement;
      const secondDiv = document.createElement("div") as HTMLDivElement;
      const thirdDiv = document.createElement("div") as HTMLDivElement;
      const dateP = document.createElement("p") as HTMLParagraphElement;
      const timeP = document.createElement("p") as HTMLParagraphElement;
      const categoryP = document.createElement("p") as HTMLParagraphElement;
      const noteP = document.createElement("p") as HTMLParagraphElement;
      const amountP = document.createElement("p") as HTMLParagraphElement;
      const balanceEndP = document.createElement("p") as HTMLParagraphElement;

      dateP.classList.add("date");
      timeP.classList.add("time");
      categoryP.classList.add("category");
      noteP.classList.add("note");
      if (tx.type === "income") {
        amountP.classList.add("amount", "income");
      } else {
        amountP.classList.add("amount", "expense");
      }
      balanceEndP.classList.add("balance-end");

      const formattedDateAndTime = formatDateAndTime(
        tx.date,
        "id-ID"
      ) as DateAndTime;

      dateP.textContent = `${formattedDateAndTime.date}`;
      timeP.textContent = `${formattedDateAndTime.time}`;
      categoryP.textContent = translate(
        this.moneyTracker.getLanguage(),
        tx.category
      );
      if (tx.note) {
        noteP.textContent = tx.note;
      }
      amountP.textContent = formatCurrency(tx.amount, "id-ID", "IDR");
      balanceEndP.textContent = formatCurrency(tx.balanceEnd, "id-ID", "IDR");

      firstDiv.append(dateP, timeP);
      secondDiv.append(categoryP);
      if (tx.note) {
        secondDiv.append(noteP);
      }
      thirdDiv.append(amountP, balanceEndP);
      transactionLi.append(firstDiv, secondDiv, thirdDiv);
      this.transactionsUl.appendChild(transactionLi);
    });
  }

  renderSummary(): void {
    const balance = this.moneyTracker.getBalance();
    this.balanceP.classList.add("balance");

    if (balance < 0) {
      this.balanceP.classList.add("minus");
      this.balanceP.classList.remove("plus");
    } else if (balance > 0) {
      this.balanceP.classList.add("plus");
      this.balanceP.classList.remove("minus");
    } else {
      this.balanceP.classList.remove("plus", "minus");
    }

    this.balanceP.textContent = formatCurrency(balance, "id-ID", "IDR");
    this.incomeP.textContent = formatCurrency(
      this.moneyTracker.getIncome(),
      "id-ID",
      "IDR"
    );
    this.expensesP.textContent = formatCurrency(
      this.moneyTracker.getExpenses(),
      "id-ID",
      "IDR"
    );
  }

  renderTransactions(): void {
    this.transactionsUl.innerHTML = "";
    if (this.moneyTracker.getTransactions().length === 0) {
      this.renderNoTransactionList();
    } else {
      this.renderTransactionList();
    }
  }

  renderTranslations(): void {
    const language = this.moneyTracker.getLanguage();
    const i18n = document.querySelectorAll<HTMLElement>("[data-i18n]");
    i18n.forEach((e) => {
      e.textContent = translate(
        language,
        e.dataset.i18n as keyof (typeof translations)["en"]
      );
    });

    this.languageSelect.value = language;
    this.incomeNoteInput.placeholder = translate(
      language,
      "note-income-placeholder"
    );
    this.expenseNoteInput.placeholder = translate(
      language,
      "note-expense-placeholder"
    );
  }

  renderUI(): void {
    this.renderSummary();
    this.renderTransactions();
    this.renderTranslations();
  }
}

const moneyTracker: MoneyTracker = new MoneyTracker();
moneyTracker
  .loadState()
  .then(() => {
    const userInterface: UserInterface = new UserInterface(moneyTracker);
    userInterface.renderUI();
  })
  .catch((e) => console.error("Failed to load data:", e));
