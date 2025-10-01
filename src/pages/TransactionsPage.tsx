import TransactionList from "@/components/TransactionList";

function TransactionsPage() {
  return (
    <section className="section transactions">
      <ul className="transactions-list">
        <TransactionList />
      </ul>
    </section>
  );
}

export default TransactionsPage;
