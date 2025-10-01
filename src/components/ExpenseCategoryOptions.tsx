import { useTranslation } from "@/contexts/TranslationContext";
import type { ExpenseCategory } from "@/types";

function ExpenseCategoryOptions() {
  const { translate } = useTranslation();

  const expenseCategories: ExpenseCategory[] = [
    "bills",
    "charity",
    "debt",
    "entertainment",
    "food",
    "health",
    "shopping",
    "transport",
    "other",
  ];

  return (
    <>
      <option value="" disabled>
        {translate("select-category")}
      </option>

      {expenseCategories.map((category) => (
        <option key={category} value={category}>
          {translate(category)}
        </option>
      ))}
    </>
  );
}

export default ExpenseCategoryOptions;
