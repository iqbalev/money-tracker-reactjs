class Utils {
  static getCurrency(amount: number) {
    return amount.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  }

  static getDate(date: Date) {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
  }
}

class MoneyTracker {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  history: Transaction[];

  constructor() {
    this.balance = 0;
    this.totalIncome = 0;
    this.totalExpense = 0;
    this.history = [];
  }

  getBalance(): string {
    return Utils.getCurrency(this.balance);
  }

  getTotalIncome(): string {
    return Utils.getCurrency(this.totalIncome);
  }

  getTotalExpense(): string {
    return Utils.getCurrency(this.totalExpense);
  }

  getHistory(): {
    id: string;
    type: string;
    amount: string;
    balanceAfter: string;
    note: string;
    date: string;
    symbol: string;
  }[] {
    return this.history.map((t) => ({
      id: t.id,
      type: t.type,
      amount: Utils.getCurrency(t.amount),
      balanceAfter: Utils.getCurrency(t.balanceAfter),
      note: t.note,
      date: Utils.getDate(t.date),
      symbol: t.symbol,
    }));
  }

  createTransaction(transaction: Transaction): void {
    this.balance = transaction.process(this.balance);
    transaction.balanceAfter = this.balance;
    if (transaction.type === "income") {
      this.totalIncome += transaction.amount;
    } else {
      this.totalExpense += transaction.amount;
    }
    this.history.push(transaction);
  }
}

abstract class Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  note: string;
  date: Date;
  symbol: string;

  abstract process(balance: number): number;

  constructor(amount: number, note: string, type: string, symbol: string) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.amount = amount;
    this.balanceAfter = 0;
    this.note = note;
    this.date = new Date();
    this.symbol = symbol;
  }
}

class Income extends Transaction {
  constructor(amount: number, note: string) {
    super(amount, note, "income", "+");
  }

  process(balance: number): number {
    return balance + this.amount;
  }
}

class Expense extends Transaction {
  constructor(amount: number, note: string) {
    super(amount, note, "expense", "-");
  }

  process(balance: number): number {
    return balance - this.amount;
  }
}

class UserInterface {
  moneyTracker: MoneyTracker;
  balanceSpan: HTMLSpanElement;
  totalIncomeSpan: HTMLSpanElement;
  totalExpenseSpan: HTMLSpanElement;
  incomeModal: HTMLDialogElement;
  expenseModal: HTMLDialogElement;
  incomeForm: HTMLFormElement;
  expenseForm: HTMLFormElement;
  incomeInput: HTMLInputElement;
  expenseInput: HTMLInputElement;
  incomeNoteInput: HTMLInputElement;
  expenseNoteInput: HTMLInputElement;
  incomeButton: HTMLButtonElement;
  expenseButton: HTMLButtonElement;
  incomeCancelButton: HTMLButtonElement;
  expenseCancelButton: HTMLButtonElement;
  historyUL: HTMLUListElement;

  constructor(moneyTracker: MoneyTracker) {
    this.moneyTracker = moneyTracker;
    this.balanceSpan = document.getElementById("balance") as HTMLSpanElement;
    this.totalIncomeSpan = document.getElementById(
      "total-income"
    ) as HTMLSpanElement;
    this.totalExpenseSpan = document.getElementById(
      "total-expense"
    ) as HTMLSpanElement;
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
    this.incomeInput = document.getElementById("income") as HTMLInputElement;
    this.expenseInput = document.getElementById("expense") as HTMLInputElement;
    this.incomeNoteInput = document.getElementById(
      "income-note"
    ) as HTMLInputElement;
    this.expenseNoteInput = document.getElementById(
      "expense-note"
    ) as HTMLInputElement;
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
    this.historyUL = document.getElementById("history") as HTMLUListElement;

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

      if (form.id === "income-form") {
        const incomeAmount = parseInt(this.incomeInput.value);
        const incomeNote = this.incomeNoteInput.value;

        if (!incomeAmount || !incomeNote) return;
        this.moneyTracker.createTransaction(
          new Income(incomeAmount, incomeNote)
        );
      } else {
        const expenseAmount = parseInt(this.expenseInput.value);
        const expenseNote = this.expenseNoteInput.value;

        if (!expenseAmount || !expenseNote) return;
        this.moneyTracker.createTransaction(
          new Expense(expenseAmount, expenseNote)
        );
      }

      this.renderUI();
      form.reset();
      modal.close();

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

  renderUI(): void {
    this.balanceSpan.textContent = this.moneyTracker.getBalance();
    this.totalIncomeSpan.textContent = this.moneyTracker.getTotalIncome();
    this.totalExpenseSpan.textContent = this.moneyTracker.getTotalExpense();
    this.historyUL.innerHTML = "";
    this.moneyTracker.getHistory().forEach((li) => {
      const historyLI = document.createElement("li");
      historyLI.textContent = `${li.note} | (${li.symbol} ${li.amount}) ${li.balanceAfter} | ${li.date}`;
      this.historyUL.appendChild(historyLI);
    });
  }
}

const moneyTracker = new MoneyTracker();
const userInterface = new UserInterface(moneyTracker);
userInterface.renderUI();
