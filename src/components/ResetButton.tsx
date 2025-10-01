import { useMoneyTracker } from "@/contexts/MoneyTrackerContext";
import { useTranslation } from "@/contexts/TranslationContext";

function ResetButton() {
  const { reset } = useMoneyTracker();
  const { translate } = useTranslation();

  function handleOnClick() {
    const confirmation = confirm(translate("reset-confirm"));
    if (!confirmation) return;
    reset();
  }

  return (
    <button type="button" onClick={handleOnClick} className="btn reset">
      {translate("reset")}
    </button>
  );
}

export default ResetButton;
