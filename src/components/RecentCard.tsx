import { useTranslation } from "@/contexts/TranslationContext";
import TransactionList from "./TransactionList";

function RecentCard() {
  const { translate } = useTranslation();

  return (
    <>
      <h3>{translate("recent-transactions")}</h3>
      <ul className="transactions-list recent">
        <TransactionList display="recent" />
      </ul>
    </>
  );
}

export default RecentCard;
