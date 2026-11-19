export const categories = [
  "Food",
  "Shopping",
  "Transport",
  "Entertainment",
  "Education",
  "Bills",
  "Health",
  "Other",
] as const;

export type Category = (typeof categories)[number];
export type Frequency = "weekly" | "monthly" | "yearly";
export type PaymentMethod = "UPI" | "Card" | "Cash" | "Bank transfer";

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  category: Category;
  date: string;
  payment: string;
  type: "expense" | "income";
};

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  nextDate: string;
  category: Category;
  active: boolean;
  unwanted: boolean;
  reviewedAt: string;
};

export type Challenge = {
  id: string;
  title: string;
  detail: string;
  target: number;
  progress: number;
  xp: number;
  active: boolean;
};

export type Preferences = {
  name: string;
  currency: string;
  budget: number;
  theme: "midnight" | "cream";
};

export type FinanceData = {
  transactions: Transaction[];
  subscriptions: Subscription[];
  challenges: Challenge[];
  preferences: Preferences;
  completed: string[];
  xp: number;
};

const STORAGE_KEY = "mischief.finance.v1";

export const dateOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export function createSampleData(): FinanceData {
  const entries: [number, string, number, Category, number, PaymentMethod][] = [
    [-1, "Late-night dosa", 180, "Food", 0, "UPI"],
    [-2, "Metro card top-up", 300, "Transport", 0, "UPI"],
    [-3, "Monthly stipend", 28000, "Other", 1, "Bank transfer"],
    [-3, "Cold brew, again", 140, "Food", 0, "Card"],
    [-4, "Streaming subscription", 299, "Entertainment", 0, "Card"],
    [-5, "Notebook & pens", 245, "Education", 0, "UPI"],
    [-6, "Lunch with Asha", 320, "Food", 0, "UPI"],
    [-7, "Auto home", 210, "Transport", 0, "Cash"],
    [-8, "Tiny treat", 95, "Food", 0, "UPI"],
    [-9, "T-shirt", 899, "Shopping", 0, "Card"],
    [-10, "Cold brew, again", 140, "Food", 0, "Card"],
    [-11, "Phone bill", 499, "Bills", 0, "UPI"],
    [-12, "Movie night", 450, "Entertainment", 0, "Card"],
    [-13, "Metro card top-up", 300, "Transport", 0, "UPI"],
    [-14, "Coffee & a croissant", 220, "Food", 0, "UPI"],
    [-16, "Freelance project", 8500, "Other", 1, "Bank transfer"],
    [-17, "Cold brew, again", 140, "Food", 0, "Card"],
    [-18, "Groceries", 1280, "Food", 0, "UPI"],
    [-20, "Cab in the rain", 360, "Transport", 0, "UPI"],
    [-22, "Pharmacy", 275, "Health", 0, "UPI"],
    [-24, "Cold brew, again", 140, "Food", 0, "Card"],
    [-26, "Dinner delivery", 420, "Food", 0, "UPI"],
    [-28, "Electricity bill", 1150, "Bills", 0, "UPI"],
  ];

  return {
    transactions: entries.map(([offset, description, amount, category, income, payment], index) => ({
      id: `sample-${index + 1}`,
      description,
      amount,
      category,
      date: dateOffset(offset),
      payment,
      type: income ? "income" : "expense",
    })),
    subscriptions: [
      { id: "sub-1", name: "StreamFlix", amount: 299, frequency: "monthly", nextDate: dateOffset(3), category: "Entertainment", active: true, unwanted: false, reviewedAt: dateOffset(-75) },
      { id: "sub-2", name: "Cloud storage", amount: 149, frequency: "monthly", nextDate: dateOffset(8), category: "Other", active: true, unwanted: false, reviewedAt: dateOffset(-18) },
      { id: "sub-3", name: "Music Box", amount: 99, frequency: "monthly", nextDate: dateOffset(11), category: "Entertainment", active: true, unwanted: true, reviewedAt: dateOffset(-105) },
    ],
    challenges: [
      { id: "no-spend", title: "No-spend day", detail: "One glorious day of leaving your wallet alone.", target: 1, progress: 0, xp: 80, active: true },
      { id: "save-500", title: "Save ₹500 this week", detail: "Move a little money into your future self fund.", target: 500, progress: 200, xp: 140, active: true },
      { id: "coffee-free", title: "Coffee-free week", detail: "Seven days. Your kettle believes in you.", target: 7, progress: 2, xp: 180, active: true },
      { id: "impulse", title: "48-hour impulse pause", detail: "Wait two days before buying the want.", target: 2, progress: 1, xp: 120, active: true },
    ],
    preferences: { name: "Panchami", currency: "INR", budget: 24000, theme: "midnight" },
    completed: [],
    xp: 240,
  };
}

function isFinanceData(value: unknown): value is FinanceData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<FinanceData>;
  return Array.isArray(data.transactions) && Array.isArray(data.subscriptions) &&
    Array.isArray(data.challenges) && !!data.preferences && Array.isArray(data.completed) &&
    typeof data.xp === "number";
}

export function loadFinanceData(): FinanceData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createSampleData();
    const parsed: unknown = JSON.parse(saved);
    return isFinanceData(parsed) ? parsed : createSampleData();
  } catch {
    return createSampleData();
  }
}

export function persistFinanceData(data: FinanceData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    throw new Error("Your browser could not save this update. Check available storage and try again.");
  }
}

export function monthTransactions(transactions: Transaction[], date = new Date()) {
  const month = date.getMonth();
  const year = date.getFullYear();
  return transactions.filter((item) => {
    const transactionDate = new Date(`${item.date}T12:00:00`);
    return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
  });
}

export function totals(transactions: Transaction[]) {
  const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  return { income, expenses, savings: income - expenses, balance: income - expenses };
}

export function monthlySubscriptionAmount(subscription: Subscription) {
  if (!subscription.active) return 0;
  if (subscription.frequency === "weekly") return subscription.amount * 52 / 12;
  if (subscription.frequency === "yearly") return subscription.amount / 12;
  return subscription.amount;
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function daysBetween(first: string, second: string) {
  const start = new Date(`${first}T12:00:00`).getTime();
  const end = new Date(`${second}T12:00:00`).getTime();
  return Math.round((end - start) / 86400000);
}
