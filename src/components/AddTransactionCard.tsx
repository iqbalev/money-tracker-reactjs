import { useMoneyTracker } from "@/contexts/MoneyTrackerContext";
import { useTranslation } from "@/contexts/TranslationContext";
import type { ExpenseFormData, IncomeFormData } from "@/types";
import { useState } from "react";
import Button from "./Button";
import { AddIcon } from "./Icons";
import IncomeCategoryOptions from "./IncomeCategoryOptions";
import ExpenseCategoryOptions from "./ExpenseCategoryOptions";

function AddTransactionCard() {
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

  function closeModal() {
    setModal(false);
    resetForms();
    resetTab();
  }

  function handleCancel() {
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
      <Button
        className="add"
        label={<AddIcon />}
        onClick={() => setModal(true)}
      />
      {modal && (
        <div className="modal">
          <div className="tabs">
            <Button
              className="tab"
              label={translate("income")}
              onClick={() => setTab("income")}
            />

            <Button
              className="tab"
              label={translate("expenses")}
              onClick={() => setTab("expense")}
            />
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
                <Button
                  className="save"
                  label={translate("save")}
                  type="submit"
                />

                <Button
                  className="cancel"
                  label={translate("cancel")}
                  onClick={handleCancel}
                />
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
                <Button
                  className="save"
                  label={translate("save")}
                  type="submit"
                />

                <Button
                  className="cancel"
                  label={translate("cancel")}
                  onClick={handleCancel}
                />
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default AddTransactionCard;
