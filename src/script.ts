class Formatter {
  static getCurrency(amount: number) {
    return amount.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  }

  static getSymbol(type: string) {
    if (type === "income") {
      return "+";
    } else {
      return "-";
    }
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
  history: Transaction[];

  constructor(balance: number = 0) {
    this.balance = balance;
    this.history = [];
  }

  getBalance() {
    return Formatter.getCurrency(this.balance);
  }

  createTransaction(transaction: Transaction) {
    if (transaction.type === "income") {
      this.balance = this.balance + transaction.amount;
    } else {
      this.balance = this.balance - transaction.amount;
    }

    transaction.updatedBalance = this.balance;
    this.history.push(transaction);
  }

  getHistory() {
    return this.history.map((t) => ({
      note: t.note,
      symbol: Formatter.getSymbol(t.type),
      amount: Formatter.getCurrency(t.amount),
      balance: Formatter.getCurrency(t.updatedBalance),
      date: Formatter.getDate(t.date),
    }));
  }
}

class Transaction {
  id: string;
  type: "income" | "expense";
  updatedBalance: number;
  amount: number;
  note: string;
  date: Date;

  constructor(type: "income" | "expense", amount: number, note: string) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.updatedBalance = 0;
    this.amount = amount;
    this.note = note;
    this.date = new Date();
  }
}

class UserInterface {
  moneyTracker: MoneyTracker;
  balanceSpan: HTMLSpanElement;
  incomeForm: HTMLFormElement;
  expenseForm: HTMLFormElement;
  incomeInput: HTMLInputElement;
  expenseInput: HTMLInputElement;
  incomeNoteInput: HTMLInputElement;
  expenseNoteInput: HTMLInputElement;
  historyUL: HTMLUListElement;

  constructor(moneyTracker: MoneyTracker) {
    this.moneyTracker = moneyTracker;
    this.balanceSpan = document.getElementById("balance") as HTMLSpanElement;
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
    this.historyUL = document.getElementById("history") as HTMLUListElement;
    this.handleIncomeForm();
    this.handleExpenseForm();
  }

  handleIncomeForm() {
    this.incomeForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const incomeAmount = parseInt(this.incomeInput.value);
      const incomeNote = this.incomeNoteInput.value;

      if (!incomeAmount || !incomeNote) return;

      this.moneyTracker.createTransaction(
        new Transaction("income", incomeAmount, incomeNote)
      );
      this.renderUI();
      this.incomeForm.reset();
    });
  }

  handleExpenseForm() {
    this.expenseForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const expenseAmount = parseInt(this.expenseInput.value);
      const expenseNote = this.expenseNoteInput.value;

      if (!expenseAmount || !expenseNote) return;

      this.moneyTracker.createTransaction(
        new Transaction("expense", expenseAmount, expenseNote)
      );
      this.renderUI();
      this.expenseForm.reset();
    });
  }

  renderUI() {
    this.balanceSpan.textContent = this.moneyTracker.getBalance();
    this.historyUL.innerHTML = "";
    this.moneyTracker.getHistory().forEach((li) => {
      const historyLI = document.createElement("li");
      historyLI.textContent = `${li.note} | (${li.symbol} ${li.amount}) ${li.balance} | ${li.date}`;
      this.historyUL.appendChild(historyLI);
    });
  }
}

const moneyTracker = new MoneyTracker();
const userInterface = new UserInterface(moneyTracker);
userInterface.renderUI();
