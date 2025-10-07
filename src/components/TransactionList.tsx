import { useMoneyTracker } from "@/contexts/MoneyTrackerContext";
import { useTranslation } from "@/contexts/TranslationContext";
import type { DateAndTime } from "@/types";
import { formatCurrency, formatDateAndTime } from "@/utils";

function TransactionList() {
  const { moneyTracker } = useMoneyTracker();
  const { translate } = useTranslation();

  return moneyTracker.transactions.length > 0 ? (
    moneyTracker.transactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map((tx) => {
        const { date, time } = formatDateAndTime(
          tx.date,
          "id-ID"
        ) as DateAndTime;

        return (
          <li key={tx.date.getTime()}>
            <div className="transaction left">
              <p className="date">{date}</p>
              <p className="time">{time}</p>
            </div>

            <div className="transaction right">
              <p className="category">{tx.category}</p>
              <p
                className={`amount ${
                  tx.type === "income" ? "income" : "expense"
                }`}
              >
                {formatCurrency(tx.amount, "id-ID", "IDR")}
              </p>
              {tx.note ? <p className="note">{tx.note}</p> : null}
            </div>
          </li>
        );
      })
  ) : (
    <li>{translate("no-transactions")}</li>
  );
}

export default TransactionList;
