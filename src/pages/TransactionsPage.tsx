import TransactionList from "@/components/TransactionList";

function TransactionsPage() {
  return (
    <section className="section transactions">
      <ul className="transactions-list all">
        <TransactionList display="all" />
      </ul>
    </section>
  );
}

export default TransactionsPage;
