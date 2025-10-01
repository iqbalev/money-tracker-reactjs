import { useTranslation } from "@/contexts/TranslationContext";
import type { Locale } from "@/types";
import LanguageOptions from "./LanguageOptions";

function LanguageSelect() {
  const { locale, translate, applyTranslation } = useTranslation();

  return (
    <>
      <label htmlFor="language">{translate("select-language")}</label>
      <select
        name="language"
        id="language"
        value={locale}
        onChange={(e) => applyTranslation(e.target.value as Locale)}
      >
        <LanguageOptions />
      </select>
    </>
  );
}

export default LanguageSelect;
