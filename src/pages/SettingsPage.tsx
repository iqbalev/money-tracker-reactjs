import Button from "@/components/Button";
import LanguageSelect from "@/components/LanguageSelect";
import { useMoneyTracker } from "@/contexts/MoneyTrackerContext";
import { useTranslation } from "@/contexts/TranslationContext";

function SettingsPage() {
  const { reset } = useMoneyTracker();
  const { translate } = useTranslation();

  function handleReset() {
    const isConfirmed = confirm(translate("reset-confirm"));
    if (!isConfirmed) return;
    reset();
  }

  return (
    <>
      <section className="section language">
        <LanguageSelect />
      </section>

      <section className="section settings">
        <Button
          className="reset"
          label={translate("reset")}
          onClick={handleReset}
        />
      </section>
    </>
  );
}

export default SettingsPage;
