import {
  loadFromLocalStorage,
  saveToLocalStorage,
  removeFromLocalStorage,
  formatCurrency,
  formatDate,
  capitalizeFirstWord,
  type DateComponents,
} from "./modules/helper";

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
  private balance: number;
  private totalIncome: number;
  private totalExpense: number;
  private history: Transaction[];

  constructor() {
    const savedData = loadFromLocalStorage("money-tracker");
    if (!savedData) {
      this.balance = 0;
      this.totalIncome = 0;
      this.totalExpense = 0;
      this.history = [];
    } else {
      this.balance = savedData.balance;
      this.totalIncome = savedData.totalIncome;
      this.totalExpense = savedData.totalExpense;
      this.history = savedData.history.map((t: Transaction) => ({
        ...t,
        // Convert back as a Date because JSON stringify it. Also formatDate() can properly format again.
        date: new Date(t.date),
      }));
    }
  }

  getBalance(): number {
    return this.balance;
  }

  getTotalIncome(): number {
    return this.totalIncome;
  }

  getTotalExpense(): number {
    return this.totalExpense;
  }

  getHistory(): Transaction[] {
    return this.history.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      category: t.category,
      balanceStart: t.balanceStart,
      balanceEnd: t.balanceEnd,
      note: t.note,
      date: t.date,
    }));
  }

  createTransaction(transaction: Transaction): void {
    transaction.balanceStart = this.balance;

    if (transaction.type === "income") {
      this.balance += transaction.amount;
      this.totalIncome += transaction.amount;
    } else {
      this.balance -= transaction.amount;
      this.totalExpense += transaction.amount;
    }

    transaction.balanceEnd = this.balance;
    this.history.push(transaction);

    saveToLocalStorage("money-tracker", {
      balance: this.balance,
      totalIncome: this.totalIncome,
      totalExpense: this.totalExpense,
      history: this.history,
    });
  }

  resetTransaction(): void {
    this.balance = 0;
    this.totalIncome = 0;
    this.totalExpense = 0;
    this.history = [];

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
  moneyTracker: MoneyTracker;
  balanceP: HTMLParagraphElement;
  totalIncomeP: HTMLParagraphElement;
  totalExpensesP: HTMLParagraphElement;
  incomeModal: HTMLDialogElement;
  expenseModal: HTMLDialogElement;
  incomeForm: HTMLFormElement;
  expenseForm: HTMLFormElement;
  incomeAmountInput: HTMLInputElement;
  expenseAmountInput: HTMLInputElement;
  incomeCategorySelect: HTMLSelectElement;
  expenseCategorySelect: HTMLSelectElement;
  incomeNoteInput: HTMLInputElement;
  expenseNoteInput: HTMLInputElement;
  resetButton: HTMLButtonElement;
  incomeButton: HTMLButtonElement;
  expenseButton: HTMLButtonElement;
  incomeCancelButton: HTMLButtonElement;
  expenseCancelButton: HTMLButtonElement;
  historyUl: HTMLUListElement;

  constructor(moneyTracker: MoneyTracker) {
    this.moneyTracker = moneyTracker;
    this.balanceP = document.getElementById("balance") as HTMLParagraphElement;
    this.totalIncomeP = document.getElementById(
      "total-income"
    ) as HTMLParagraphElement;
    this.totalExpensesP = document.getElementById(
      "total-expenses"
    ) as HTMLParagraphElement;
    this.incomeModal = document.getElementById(
      "income-modal"
    ) as HTMLDialogElement;
    this.expenseModal = document.getElementById(
      "expense-modal"
    ) as HTMLDialogElement;
    this.incomeForm = document.getElementById("income-form") as HTMLFormElement;
    this.expenseForm = document.getElementById(
      "expense-form"
    ) as HTMLFormElement;
    this.incomeAmountInput = document.getElementById(
      "income-amount"
    ) as HTMLInputElement;
    this.expenseAmountInput = document.getElementById(
      "expense-amount"
    ) as HTMLInputElement;
    this.incomeCategorySelect = document.getElementById(
      "income-category"
    ) as HTMLSelectElement;
    this.expenseCategorySelect = document.getElementById(
      "expense-category"
    ) as HTMLSelectElement;
    this.incomeNoteInput = document.getElementById(
      "income-note"
    ) as HTMLInputElement;
    this.expenseNoteInput = document.getElementById(
      "expense-note"
    ) as HTMLInputElement;
    this.resetButton = document.getElementById(
      "reset-btn"
    ) as HTMLButtonElement;
    this.incomeButton = document.getElementById(
      "income-btn"
    ) as HTMLButtonElement;
    this.expenseButton = document.getElementById(
      "expense-btn"
    ) as HTMLButtonElement;
    this.incomeCancelButton = document.getElementById(
      "income-cancel-btn"
    ) as HTMLButtonElement;
    this.expenseCancelButton = document.getElementById(
      "expense-cancel-btn"
    ) as HTMLButtonElement;
    this.historyUl = document.getElementById("history") as HTMLUListElement;

    this.handleReset(this.resetButton);
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
            "You're short of balance. Do you still want to continue?"
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

      console.table(this.moneyTracker.getHistory());
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

  handleReset(button: HTMLButtonElement): void {
    button.addEventListener("click", () => {
      const confirmation = confirm("Do you want to reset?");
      if (!confirmation) return;

      removeFromLocalStorage("money-tracker");
      this.moneyTracker.resetTransaction();
      this.renderUI();
    });
  }

  renderSummary(): void {
    this.balanceP.textContent = formatCurrency(this.moneyTracker.getBalance());
    this.totalIncomeP.textContent = formatCurrency(
      this.moneyTracker.getTotalIncome()
    );
    this.totalExpensesP.textContent = formatCurrency(
      this.moneyTracker.getTotalExpense()
    );
  }

  renderHistory(): void {
    this.historyUl.innerHTML = "";
    const history = this.moneyTracker.getHistory();

    if (history.length === 0) {
      const historyLi = document.createElement("li");
      historyLi.textContent = "No transactions found.";
      this.historyUl.appendChild(historyLi);
    } else {
      history.forEach((li) => {
        const dateComponents = formatDate(
          li.date,
          "id-ID",
          "components"
        ) as DateComponents;

        const historyLi = document.createElement("li") as HTMLLIElement;
        const firstDiv = document.createElement("div") as HTMLDivElement;
        const secondDiv = document.createElement("div") as HTMLDivElement;
        const thirdDiv = document.createElement("div") as HTMLDivElement;
        const ddmmyyP = document.createElement("p") as HTMLParagraphElement;
        const hhmmP = document.createElement("p") as HTMLParagraphElement;
        const categoryP = document.createElement("p") as HTMLParagraphElement;
        const noteP = document.createElement("p") as HTMLParagraphElement;
        const amountP = document.createElement("p") as HTMLParagraphElement;
        const balanceEndP = document.createElement("p") as HTMLParagraphElement;

        ddmmyyP.classList.add("date", "ddmmyy");
        hhmmP.classList.add("date", "hhmm");
        categoryP.classList.add("category");
        noteP.classList.add("note");
        if (li.type === "income") {
          amountP.classList.add("amount", "income");
        } else {
          amountP.classList.add("amount", "expense");
        }
        balanceEndP.classList.add("balance-end");

        ddmmyyP.textContent = `${dateComponents.day} ${dateComponents.month} ${dateComponents.year}`;
        hhmmP.textContent = `${dateComponents.hour}.${dateComponents.minute}`;
        categoryP.textContent = capitalizeFirstWord(li.category);
        if (li.note) {
          noteP.textContent = li.note;
        }
        amountP.textContent = formatCurrency(li.amount);
        balanceEndP.textContent = formatCurrency(li.balanceEnd);

        firstDiv.append(ddmmyyP, hhmmP);
        secondDiv.append(categoryP);
        if (li.note) {
          secondDiv.append(noteP);
        }
        thirdDiv.append(amountP, balanceEndP);
        historyLi.append(firstDiv, secondDiv, thirdDiv);
        this.historyUl.appendChild(historyLi);
      });
    }
  }

  renderUI(): void {
    this.renderSummary();
    this.renderHistory();
  }
}

const moneyTracker: MoneyTracker = new MoneyTracker();
const userInterface: UserInterface = new UserInterface(moneyTracker);
userInterface.renderUI();
