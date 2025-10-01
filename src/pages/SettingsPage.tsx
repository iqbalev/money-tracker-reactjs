import LanguageSelect from "@/components/LanguageSelect";
import ResetButton from "@/components/ResetButton";

function SettingsPage() {
  return (
    <>
      <section className="section language">
        <LanguageSelect />
      </section>

      <section className="section settings">
        <ResetButton />
      </section>
    </>
  );
}

export default SettingsPage;
