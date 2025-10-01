import Actions from "@/components/Actions";
import SummaryCard from "@/components/SummaryCard";

function DashboardPage() {
  return (
    <>
      <section className="section summary">
        <SummaryCard />
      </section>

      <section className="section actions">
        <Actions />
      </section>
    </>
  );
}

export default DashboardPage;
