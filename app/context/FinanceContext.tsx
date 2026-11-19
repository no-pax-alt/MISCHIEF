import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createSampleData,
  loadFinanceData,
  persistFinanceData,
  type Challenge,
  type FinanceData,
  type Subscription,
  type Transaction,
} from "../lib/finance";

type FinanceContextValue = FinanceData & {
  hydrated: boolean;
  notice: { message: string; tone: "success" | "error" } | null;
  setNotice: (message: string, tone?: "success" | "error") => void;
  saveTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  saveSubscription: (subscription: Subscription) => void;
  updateSubscription: (id: string, update: Partial<Subscription>) => void;
  saveChallenge: (challenge: Challenge) => void;
  updateChallenge: (id: string, update: Partial<Challenge>) => void;
  updatePreferences: (update: Partial<FinanceData["preferences"]>) => void;
  finishChallenge: (challenge: Challenge) => void;
  reset: (empty?: boolean) => void;
  exportData: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FinanceData>(() => createSampleData());
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNoticeState] = useState<FinanceContextValue["notice"]>(null);

  useEffect(() => {
    setData(loadFinanceData());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      persistFinanceData(data);
    } catch (error) {
      setNoticeState({ message: error instanceof Error ? error.message : "Could not save your changes.", tone: "error" });
    }
  }, [data, hydrated]);

  const setNotice = useCallback((message: string, tone: "success" | "error" = "success") => {
    setNoticeState({ message, tone });
    window.setTimeout(() => setNoticeState(null), 3600);
  }, []);

  const value = useMemo<FinanceContextValue>(() => ({
    ...data,
    hydrated,
    notice,
    setNotice,
    saveTransaction: (transaction) => setData((current) => ({
      ...current,
      transactions: [transaction, ...current.transactions.filter((item) => item.id !== transaction.id)],
    })),
    deleteTransaction: (id) => setData((current) => ({
      ...current,
      transactions: current.transactions.filter((item) => item.id !== id),
    })),
    saveSubscription: (subscription) => setData((current) => ({
      ...current,
      subscriptions: [subscription, ...current.subscriptions.filter((item) => item.id !== subscription.id)],
    })),
    updateSubscription: (id, update) => setData((current) => ({
      ...current,
      subscriptions: current.subscriptions.map((item) => item.id === id ? { ...item, ...update } : item),
    })),
    saveChallenge: (challenge) => setData((current) => ({
      ...current,
      challenges: [challenge, ...current.challenges],
    })),
    updateChallenge: (id, update) => setData((current) => ({
      ...current,
      challenges: current.challenges.map((item) => item.id === id ? { ...item, ...update } : item),
    })),
    updatePreferences: (update) => setData((current) => ({
      ...current,
      preferences: { ...current.preferences, ...update },
    })),
    finishChallenge: (challenge) => setData((current) => ({
      ...current,
      challenges: current.challenges.filter((item) => item.id !== challenge.id),
      completed: [challenge.title, ...current.completed],
      xp: current.xp + challenge.xp,
    })),
    reset: (empty = false) => {
      setData(empty ? { ...createSampleData(), transactions: [], subscriptions: [], challenges: [] } : createSampleData());
      setNotice(empty ? "Your local ledger is clear." : "Sample data restored. Fresh start, same plot.");
    },
    exportData: () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "mischief-financial-data.json";
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice("Your data export is ready.");
    },
  }), [data, hydrated, notice, setNotice]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used inside FinanceProvider");
  return context;
}
