import { indexedDb } from "@/services/IndexedDbService";
import type {
  AddTransactionInput,
  AppErrors,
  ContextProviderProps,
  Locale,
  MoneyTracker,
  MoneyTrackerContext,
  Settings,
  Summary,
  Transaction,
} from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

const MoneyTrackerContext = createContext<MoneyTrackerContext | null>(null);

export function MoneyTrackerProvider({
  children,
}: ContextProviderProps<React.ReactNode>) {
  const [moneyTracker, setMoneyTracker] = useState<MoneyTracker>({
    summary: {
      balance: 0,
      income: 0,
      expenses: 0,
    },
    transactions: [],
    settings: { language: "en-US" },
  });
  const [errors, setErrors] = useState<AppErrors>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [summary, transactions, settings] = await Promise.all([
          indexedDb.get<Summary>("summary"),
          indexedDb.getAll<Transaction>("transactions"),
          indexedDb.get<Settings>("settings"),
        ]);

        setMoneyTracker({
          summary: summary ?? { balance: 0, income: 0, expenses: 0 },
          transactions: transactions ?? [],
          settings: settings ?? { language: "id-ID" },
        });
      } catch (error) {
        console.error("Failed to load data!", error);
        setErrors((prev) => ({ ...prev, load: error as Error }));
      } finally {
        setIsReady(true);
      }
    }

    load();
  }, []);

  async function addTransaction(tx: AddTransactionInput) {
    const balanceStart = moneyTracker.summary.balance;
    const balanceEnd =
      tx.type === "income"
        ? balanceStart + tx.amount
        : balanceStart - tx.amount;

    const transaction: Transaction = {
      ...tx,
      date: new Date(),
      balanceStart,
      balanceEnd,
    };

    const summary: Summary = {
      balance: balanceEnd,
      income:
        tx.type === "income"
          ? moneyTracker.summary.income + tx.amount
          : moneyTracker.summary.income,
      expenses:
        tx.type === "expense"
          ? moneyTracker.summary.expenses + tx.amount
          : moneyTracker.summary.expenses,
    };

    const updatedMoneyTracker: MoneyTracker = {
      ...moneyTracker,
      summary,
      transactions: [...moneyTracker.transactions, transaction],
    };

    setMoneyTracker(updatedMoneyTracker);

    try {
      await Promise.all([
        indexedDb.add<Summary>("summary", summary),
        indexedDb.add<Transaction>("transactions", transaction),
      ]);
    } catch (error) {
      console.error("Failed to save data!", error);
      setErrors((prev) => ({ ...prev, save: error as Error }));
    }
  }

  async function changeLanguage(locale: Locale) {
    setMoneyTracker((prev) => ({
      ...prev,
      settings: {
        language: locale,
      },
    }));

    try {
      await indexedDb.add<Settings>("settings", { language: locale });
    } catch (error) {
      console.error("Failed to save data!", error);
      setErrors((prev) => ({ ...prev, save: error as Error }));
    }
  }

  async function reset() {
    setMoneyTracker({
      summary: { balance: 0, income: 0, expenses: 0 },
      transactions: [],
      settings: { language: "id-ID" },
    });

    try {
      await indexedDb.clear(["summary", "transactions", "settings"]);
    } catch (error) {
      console.error("Failed to reset data!", error);
      setErrors((prev) => ({ ...prev, reset: error as Error }));
    }
  }

  if (!isReady) return;

  return (
    <MoneyTrackerContext.Provider
      value={{
        moneyTracker,
        addTransaction,
        changeLanguage,
        reset,
        errors,
      }}
    >
      {children}
    </MoneyTrackerContext.Provider>
  );
}

export function useMoneyTracker() {
  const ctx = useContext(MoneyTrackerContext);
  if (!ctx) {
    throw new Error("MoneyTrackerContext is not provided!");
  }
  return ctx;
}
