import AddTransactionCard from "@/components/AddTransactionCard";
import RecentCard from "@/components/RecentCard";
import SummaryCard from "@/components/SummaryCard";

function DashboardPage() {
  return (
    <>
      <section className="section summary">
        <SummaryCard />
      </section>

      <section className="section recent">
        <RecentCard />
      </section>

      <section className="section actions">
        <AddTransactionCard />
      </section>
    </>
  );
}

export default DashboardPage;
