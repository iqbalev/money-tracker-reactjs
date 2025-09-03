class Utils {
  static getCurrency(amount: number): string {
    return amount.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  }

  static getDate(date: Date): string {
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

class Storage {
  static save(name: string, data: object): void {
    localStorage.setItem(name, JSON.stringify(data));
    console.log("Data saved");
  }

  static load(name: string) {
    const data = localStorage.getItem(name);
    if (data) {
      const parsedData = JSON.parse(data);
      console.log(
        `Saved data loaded. ${parsedData.history.length} transactions found!`
      );
      return parsedData;
    } else {
      console.log("No saved data found.");
      return;
    }
  }
}

class MoneyTracker {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  history: Transaction[];

  constructor() {
    const savedData = Storage.load("money-tracker");
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
        // Convert back as a Date because JSON stringify it. And also Utils.getDate() can properly format again.
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

  getHistory(): {
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    note: string;
    date: Date;
    symbol: string;
  }[] {
    return this.history.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      balanceAfter: t.balanceAfter,
      note: t.note,
      date: t.date,
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

    Storage.save("money-tracker", {
      balance: this.balance,
      totalIncome: this.totalIncome,
      totalExpense: this.totalExpense,
      history: this.history,
    });
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
    this.id =
      Date.now().toString() + Math.floor(Math.random() * 1000).toString();
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
  balanceP: HTMLSpanElement;
  totalIncomeP: HTMLSpanElement;
  totalExpensesP: HTMLSpanElement;
  incomeModal: HTMLDialogElement;
  expenseModal: HTMLDialogElement;
  incomeForm: HTMLFormElement;
  expenseForm: HTMLFormElement;
  incomeAmountInput: HTMLInputElement;
  expenseAmountInput: HTMLInputElement;
  incomeNoteInput: HTMLInputElement;
  expenseNoteInput: HTMLInputElement;
  incomeButton: HTMLButtonElement;
  expenseButton: HTMLButtonElement;
  incomeCancelButton: HTMLButtonElement;
  expenseCancelButton: HTMLButtonElement;
  historyUL: HTMLUListElement;

  constructor(moneyTracker: MoneyTracker) {
    this.moneyTracker = moneyTracker;
    this.balanceP = document.getElementById("balance") as HTMLSpanElement;
    this.totalIncomeP = document.getElementById(
      "total-income"
    ) as HTMLSpanElement;
    this.totalExpensesP = document.getElementById(
      "total-expenses"
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
    this.incomeAmountInput = document.getElementById(
      "income-amount"
    ) as HTMLInputElement;
    this.expenseAmountInput = document.getElementById(
      "expense-amount"
    ) as HTMLInputElement;
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
        const incomeAmount = parseInt(this.incomeAmountInput.value);
        const incomeNote = this.incomeNoteInput.value;

        if (!incomeAmount || !incomeNote) return;
        this.moneyTracker.createTransaction(
          new Income(incomeAmount, incomeNote)
        );
      } else {
        const expenseAmount = parseInt(this.expenseAmountInput.value);
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
    this.balanceP.textContent = Utils.getCurrency(
      this.moneyTracker.getBalance()
    );
    this.totalIncomeP.textContent = Utils.getCurrency(
      this.moneyTracker.getTotalIncome()
    );
    this.totalExpensesP.textContent = Utils.getCurrency(
      this.moneyTracker.getTotalExpense()
    );
    this.historyUL.innerHTML = "";

    const history = this.moneyTracker.getHistory();
    if (history.length === 0) {
      const historyLI = document.createElement("li");
      historyLI.textContent = "No transactions found.";
      this.historyUL.appendChild(historyLI);
    } else {
      history.forEach((li) => {
        const historyLI = document.createElement("li");
        historyLI.textContent = `${li.note} | (${li.symbol} ${Utils.getCurrency(
          li.amount
        )}) ${Utils.getCurrency(li.balanceAfter)} | ${Utils.getDate(li.date)}`;
        this.historyUL.appendChild(historyLI);
      });
    }
  }
}

const moneyTracker = new MoneyTracker();
const userInterface = new UserInterface(moneyTracker);
userInterface.renderUI();
