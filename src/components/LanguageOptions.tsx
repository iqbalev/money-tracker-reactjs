import { useTranslation } from "@/contexts/TranslationContext";

function LanguageOptions() {
  const { translate } = useTranslation();

  return (
    <>
      <option value="id-ID">{translate("bahasa-indonesia")}</option>
      <option value="en-US">{translate("english")}</option>
    </>
  );
}

export default LanguageOptions;
