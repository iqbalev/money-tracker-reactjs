import type { translations } from "./locales";
import type { MoneyTracker } from "./MoneyTracker";
import { Transaction } from "./Transaction";
import type { DateAndTime, ExpenseCategory, IncomeCategory } from "./types";
import { formatCurrency, formatDateAndTime, translate } from "./utils";

export class UserInterface {
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
