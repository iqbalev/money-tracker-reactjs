import { useMoneyTracker } from "@/contexts/MoneyTrackerContext";
import { useTranslation } from "@/contexts/TranslationContext";
import type { DateAndTime, Transaction, TransactionListProps } from "@/types";
import { formatCurrency, formatDateAndTime } from "@/utils";

function TransactionList({ display }: TransactionListProps) {
  const { moneyTracker } = useMoneyTracker();
  const { translate } = useTranslation();

  let sortedTransactions: Transaction[] = [];

  if (moneyTracker.transactions.length > 0) {
    sortedTransactions = moneyTracker.transactions.sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }

  const transactions =
    display === "all" ? sortedTransactions : sortedTransactions.slice(0, 5);

  return transactions.length > 0 ? (
    transactions.map((tx) => {
      const { date, time } = formatDateAndTime(tx.date, "id-ID") as DateAndTime;

      return (
        <li key={tx.date.getTime()}>
          <div className="transaction date-time">
            <p className="date">{date}</p>
            <p className="time">{time}</p>
          </div>

          <div className="transaction details">
            <p className="category">{translate(tx.category)}</p>
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
    <li>
      {display === "all"
        ? translate("no-transactions")
        : translate("no-recent-transactions")}
    </li>
  );
}

export default TransactionList;
