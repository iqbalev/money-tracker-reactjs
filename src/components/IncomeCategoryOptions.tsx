import { useTranslation } from "@/contexts/TranslationContext";
import type { IncomeCategory } from "@/types";

function IncomeCategoryOptions() {
  const { translate } = useTranslation();

  const incomeCategories: IncomeCategory[] = [
    "allowance",
    "business",
    "freelance",
    "gift",
    "investment",
    "pension",
    "royalty",
    "salary",
    "other",
  ];

  return (
    <>
      <option value="" disabled>
        {translate("select-category")}
      </option>

      {incomeCategories.map((category) => (
        <option key={category} value={category}>
          {translate(category)}
        </option>
      ))}
    </>
  );
}

export default IncomeCategoryOptions;
