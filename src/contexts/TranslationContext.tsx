import { translations } from "@/locales";
import type {
  ContextProviderProps,
  Locale,
  TranslateKey,
  TranslationContext,
} from "@/types";
import { createContext, useContext } from "react";
import { useMoneyTracker } from "./MoneyTrackerContext";

const TranslationContext = createContext<TranslationContext | null>(null);

export function TranslationContextProvider({
  children,
}: ContextProviderProps<React.ReactNode>) {
  const { moneyTracker, changeLanguage } = useMoneyTracker();
  const locale = moneyTracker.settings.language;

  function translate(key: TranslateKey) {
    return translations[locale][key];
  }

  function applyTranslation(locale: Locale) {
    changeLanguage(locale);
  }

  return (
    <TranslationContext.Provider
      value={{ locale, translate, applyTranslation }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error("TranslationContext is not provided!");
  }
  return ctx;
}
