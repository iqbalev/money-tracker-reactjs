import {
  formatCurrency,
  formatDateAndTime,
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
  translate,
  type DateAndTime,
} from "./modules/helpers";
import type { translations } from "./modules/translations";

type ExpenseCategory =
  | "bills"
  | "charity"
  | "debt"
  | "entertainment"
  | "food"
  | "health"
  | "shopping"
  | "transport"
  | "other";

type IncomeCategory =
  | "allowance"
  | "business"
  | "freelance"
  | "gift"
  | "investment"
  | "pension"
  | "royalty"
  | "salary"
  | "other";

class MoneyTracker {
  private language: "en" | "id";
  private balance: number;
  private income: number;
  private expenses: number;
  private transactions: Transaction[];

  constructor() {
    const savedData = loadFromLocalStorage("money-tracker");
    if (!savedData) {
      this.language = "id";
      this.balance = 0;
      this.income = 0;
      this.expenses = 0;
      this.transactions = [];
    } else {
      this.language = savedData.language;
      this.balance = savedData.balance;
      this.income = savedData.income;
      this.expenses = savedData.expenses;
      this.transactions = savedData.transactions.map((tx: Transaction) => ({
        ...tx,
        // Convert back as a Date because JSON stringify it. Also formatDate() can properly format again.
        date: new Date(tx.date),
      }));
    }
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
    return this.transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      balanceStart: tx.balanceStart,
      balanceEnd: tx.balanceEnd,
      note: tx.note,
      date: tx.date,
    }));
  }

  setLanguage(locale: "en" | "id") {
    this.language = locale;
    this.saveState();
  }

  createTransaction(transaction: Transaction): void {
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
    this.saveState();
  }

  saveState(): void {
    saveToLocalStorage("money-tracker", {
      language: this.language,
      balance: this.balance,
      income: this.income,
      expenses: this.expenses,
      transactions: this.transactions,
    });
  }

  resetState(): void {
    this.language = "en";
    this.balance = 0;
    this.income = 0;
    this.expenses = 0;
    this.transactions = [];

    removeFromLocalStorage("money-tracker");
  }
}

class Transaction {
  readonly id: string;
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
    this.id =
      Date.now().toString() + Math.floor(Math.random() * 1000).toString();
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
  private languageForm = document.getElementById(
    "language-form"
  ) as HTMLFormElement;
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
      // TODO: Add form submit when backend added.
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

      console.table(this.moneyTracker.getTransactions());
    });
  }

  handleReset(button: HTMLButtonElement): void {
    button.addEventListener("click", () => {
      const confirmation = confirm(
        translate(this.moneyTracker.getLanguage(), "reset-confirm")
      );
      if (!confirmation) return;

      removeFromLocalStorage("money-tracker");
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
const userInterface: UserInterface = new UserInterface(moneyTracker);
userInterface.renderUI();
