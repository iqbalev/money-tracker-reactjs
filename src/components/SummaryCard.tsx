import { useMoneyTracker } from "@/contexts/MoneyTrackerContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { formatCurrency } from "@/utils";

function SummaryCard() {
  const { moneyTracker } = useMoneyTracker();
  const { translate } = useTranslation();

  return (
    <>
      <div className="balance">
        <h3>{translate("balance")}</h3>
        <p>{formatCurrency(moneyTracker.summary.balance, "id-ID", "IDR")}</p>
      </div>

      <div className="income">
        <h3>{translate("income")}</h3>
        <p>{formatCurrency(moneyTracker.summary.income, "id-ID", "IDR")}</p>
      </div>

      <div className="expenses">
        <h3>{translate("expenses")}</h3>
        <p>{formatCurrency(moneyTracker.summary.expenses, "id-ID", "IDR")}</p>
      </div>
    </>
  );
}

export default SummaryCard;
