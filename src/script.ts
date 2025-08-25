class MoneyTracker {
  balance: number;
  history: Transaction[];

  constructor(balance: number = 0) {
    this.balance = balance;
    this.history = [];
  }

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

  getBalance() {
    return MoneyTracker.getCurrency(this.balance);
  }

  updateBalance(transaction: Transaction) {
    if (transaction.type === "income") {
      this.balance = this.balance + transaction.amount;
    } else {
      this.balance = this.balance - transaction.amount;
    }
    transaction.updatedBalance = this.balance;
    this.history.push(transaction);
  }

  getHistory() {
    return this.history.map((t) => {
      return `${t.name} |  (${MoneyTracker.getSymbol(
        t.type
      )} ${MoneyTracker.getCurrency(t.amount)}) ${MoneyTracker.getCurrency(
        t.updatedBalance
      )} | ${MoneyTracker.getDate(t.date)}`;
    });
  }
}

class Transaction {
  id: string;
  type: "income" | "expense";
  updatedBalance: number;
  amount: number;
  name: string;
  date: Date;

  constructor(type: "income" | "expense", amount: number, name: string) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.updatedBalance = 0;
    this.amount = amount;
    this.name = name;
    this.date = new Date();
  }
}

class UserInterface {
  moneyTracker: MoneyTracker;
  balanceSpan: HTMLSpanElement;
  historyUL: HTMLUListElement;

  constructor(moneyTracker: MoneyTracker) {
    this.moneyTracker = moneyTracker;
    this.balanceSpan = document.getElementById("balance") as HTMLSpanElement;
    this.historyUL = document.getElementById("history") as HTMLUListElement;
  }

  updateUI() {
    this.balanceSpan.textContent = this.moneyTracker.getBalance();
    this.historyUL.innerHTML = "";
    this.moneyTracker.getHistory().forEach((li) => {
      const historyLI = document.createElement("li");
      historyLI.textContent = li;
      this.historyUL.appendChild(historyLI);
    });
  }
}

const moneyTracker = new MoneyTracker(811000);
moneyTracker.updateBalance(new Transaction("expense", 98000, "CPU Fan"));
moneyTracker.updateBalance(new Transaction("expense", 473000, "SSD 512 GB"));
moneyTracker.updateBalance(new Transaction("expense", 10000, "Nasi Padang"));
moneyTracker.updateBalance(new Transaction("income", 180000, "Nexus DP"));

const userInterface = new UserInterface(moneyTracker);
userInterface.updateUI();
