import { useMoneyTracker } from "@/contexts/MoneyTrackerContext";
import { useTranslation } from "@/contexts/TranslationContext";
import type { ExpenseFormData, IncomeFormData } from "@/types";
import { useState } from "react";
import IncomeCategoryOptions from "./IncomeCategoryOptions";
import ExpenseCategoryOptions from "./ExpenseCategoryOptions";

function Actions() {
  const { moneyTracker, addTransaction } = useMoneyTracker();
  const { translate } = useTranslation();
  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState<"income" | "expense">("income");
  const [incomeFormData, setIncomeFormData] = useState<IncomeFormData>({
    amount: "",
    category: "",
    note: "",
  });
  const [expenseFormData, setExpenseFormData] = useState<ExpenseFormData>({
    amount: "",
    category: "",
    note: "",
  });

  function resetForms() {
    setIncomeFormData({ amount: "", category: "", note: "" });
    setExpenseFormData({ amount: "", category: "", note: "" });
  }

  function resetTab() {
    setTab("income");
  }

  function openModal() {
    setModal(true);
  }

  function closeModal() {
    setModal(false);
    resetForms();
    resetTab();
  }

  function cancel() {
    closeModal();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = tab === "income" ? incomeFormData : expenseFormData;
    const amount = parseInt(formData.amount);

    if (isNaN(amount) || amount < 1 || !formData.category) {
      return;
    }

    if (tab === "expense" && moneyTracker.summary.balance < amount) {
      alert(translate("out-of-balance-alert"));
      return;
    }

    addTransaction({
      type: tab,
      amount,
      category: formData.category,
      note: formData.note,
    });

    closeModal();
  }

  return (
    <>
      <button type="button" onClick={openModal} className="btn plus">
        &#43;
      </button>

      {modal && (
        <div className="modal">
          <div className="tabs">
            <button type="button" onClick={() => setTab("income")}>
              {translate("income")}
            </button>

            <button type="button" onClick={() => setTab("expense")}>
              {translate("expenses")}
            </button>
          </div>

          {tab === "income" && (
            <form onSubmit={(e) => handleSubmit(e)}>
              <div className="form-group">
                <label htmlFor="income-amount">{translate("amount")}</label>
                <input
                  type="number"
                  name="income-amount"
                  id="income-amount"
                  min="1"
                  value={incomeFormData.amount}
                  onChange={(e) =>
                    setIncomeFormData({
                      ...incomeFormData,
                      amount: e.target.value,
                    })
                  }
                  placeholder="1000000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="income-category">{translate("category")}</label>
                <select
                  name="income-category"
                  id="income-category"
                  value={incomeFormData.category}
                  onChange={(e) =>
                    setIncomeFormData({
                      ...incomeFormData,
                      category: e.target.value as IncomeFormData["category"],
                    })
                  }
                  required
                >
                  <IncomeCategoryOptions />
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="income-note">{translate("note")}</label>
                <input
                  type="text"
                  name="income-note"
                  id="income-note"
                  value={incomeFormData.note}
                  onChange={(e) =>
                    setIncomeFormData({
                      ...incomeFormData,
                      note: e.target.value,
                    })
                  }
                  placeholder={translate("note-income-placeholder")}
                />
              </div>

              <div className="input-buttons">
                <button type="submit">{translate("save")}</button>
                <button type="button" onClick={cancel}>
                  {translate("cancel")}
                </button>
              </div>
            </form>
          )}

          {tab === "expense" && (
            <form onSubmit={(e) => handleSubmit(e)}>
              <div className="form-group">
                <label htmlFor="expense-amount">{translate("amount")}</label>
                <input
                  type="number"
                  name="expense-amount"
                  id="expense-amount"
                  min="1"
                  value={expenseFormData.amount}
                  onChange={(e) =>
                    setExpenseFormData({
                      ...expenseFormData,
                      amount: e.target.value,
                    })
                  }
                  placeholder="50000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="expense-category">
                  {translate("category")}
                </label>

                <select
                  name="expense-category"
                  id="expense-category"
                  value={expenseFormData.category}
                  onChange={(e) =>
                    setExpenseFormData({
                      ...expenseFormData,
                      category: e.target.value as ExpenseFormData["category"],
                    })
                  }
                  required
                >
                  <ExpenseCategoryOptions />
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="expense-note">{translate("note")}</label>
                <input
                  type="text"
                  name="expense-note"
                  id="expense-note"
                  value={expenseFormData.note}
                  onChange={(e) =>
                    setExpenseFormData({
                      ...expenseFormData,
                      note: e.target.value,
                    })
                  }
                  placeholder={translate("note-expense-placeholder")}
                />
              </div>

              <div className="input-buttons">
                <button type="submit">{translate("save")}</button>
                <button type="button" onClick={cancel}>
                  {translate("cancel")}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default Actions;
