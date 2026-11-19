import { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { categories, dateOffset, type Category, type PaymentMethod, type Subscription, type Transaction } from "../lib/finance";

const paymentMethods: PaymentMethod[] = ["UPI", "Card", "Cash", "Bank transfer"];

function isPaymentMethod(value: string): value is PaymentMethod {
  return paymentMethods.some((paymentMethod) => paymentMethod === value);
}

const iconPaths: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5M5 9v11h14V9M9 20v-6h6v6",
  rewind: "M3 12a9 9 0 1 0 2.64-6.36L3 8m0-5v5h5M12 8v5l3 2",
  radar: "M12 3a9 9 0 1 0 9 9M12 12l6-6M12 7v5h5",
  alternate: "M4 19 10 5l4 14 6-14M3 12h18",
  ghost: "M5 20V10a7 7 0 0 1 14 0v10l-3-2-2 2-2-2-2 2-2-2zM9 10h.01M15 10h.01",
  weather: "M3 14a4 4 0 0 1 4-4h.3a5 5 0 0 1 9.7-1 4 4 0 1 1 1 8H7a4 4 0 0 1-4-3zM8 20h.01M12 20h.01M16 20h.01",
  challenge: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.6 2.8-.2-.1a1.7 1.7 0 0 0-1.8.2l-.2.1h-3.2l-.1-.2a1.7 1.7 0 0 0-1.5-1l-.2-.1-2.8-1.6.1-.2a1.7 1.7 0 0 0-.2-1.8l-.1-.2v-3.2l.2-.1a1.7 1.7 0 0 0 1-1.5l.1-.2 1.6-2.8.2.1a1.7 1.7 0 0 0 1.8-.2l.2-.1h3.2l.1.2a1.7 1.7 0 0 0 1.5 1l.2.1 2.8 1.6-.1.2a1.7 1.7 0 0 0 .2 1.8l.1.2z",
  plus: "M12 5v14M5 12h14",
  close: "m6 6 12 12M18 6 6 18",
  search: "m20 20-4.5-4.5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  trash: "M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3",
  pencil: "m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z",
  download: "M12 3v12m-5-5 5 5 5-5M4 19h16",
  spark: "m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z",
};

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[name] || iconPaths.spark} /></svg>;
}

export function Button({ children, onClick, variant = "primary", type = "button", className = "", disabled = false }: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "quiet" | "outline"; type?: "button" | "submit"; className?: string; disabled?: boolean;
}) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`button button-${variant} ${className}`}>{children}</button>;
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

export function ProgressLine({ value, max, coral = false }: { value: number; max: number; coral?: boolean }) {
  const percent = max > 0 ? Math.max(0, Math.min(100, value / max * 100)) : 0;
  return <div className={`progress-line ${coral ? "progress-coral" : ""}`}><span style={{ width: `${percent}%` }} /></div>;
}

export function Toast() {
  const { notice } = useFinance();
  return notice ? <div className={`toast toast-${notice.tone}`} role="status">{notice.message}</div> : null;
}

export function TransactionDialog({ initial, onClose }: { initial?: Transaction; onClose: () => void }) {
  const { saveTransaction, setNotice } = useFinance();
  const [form, setForm] = useState<{
    description: string;
    amount: string;
    category: Category;
    date: string;
    payment: PaymentMethod;
    type: "expense" | "income";
  }>({
    description: initial?.description || "",
    amount: initial?.amount ? String(initial.amount) : "",
    category: initial?.category || "Food",
    date: initial?.date || dateOffset(0),
    payment: initial?.payment && isPaymentMethod(initial.payment) ? initial.payment : "UPI",
    type: initial?.type || "expense",
  });
  const [error, setError] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.description.trim()) return setError("Give this transaction a short description.");
    if (!Number.isFinite(amount) || amount <= 0) return setError("Enter an amount greater than zero.");
    if (!form.date) return setError("Choose a transaction date.");
    saveTransaction({
      id: initial?.id || `txn-${Date.now()}`,
      description: form.description.trim(),
      amount,
      category: form.category,
      date: form.date,
      payment: form.payment,
      type: form.type,
    });
    setNotice(initial ? "Transaction updated. The ledger has been amended." : "Transaction added to the case file.");
    onClose();
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="txn-title">
      <button className="modal-close icon-button" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
      <Eyebrow>{initial ? "EDIT THE EVIDENCE" : "ADD A CLUE"}</Eyebrow>
      <h2 id="txn-title">{initial ? "Rewrite this moment." : "Where did it go?"}</h2>
      <form className="form-grid" onSubmit={submit}>
        <label className="field field-wide">Description<input autoFocus value={form.description} maxLength={70} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="e.g. midnight noodles" /></label>
        <label className="field">Amount<input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0.00" /></label>
        <label className="field">Type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as "expense" | "income" })}><option value="expense">Expense</option><option value="income">Income</option></select></label>
        <label className="field">Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as Category })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="field">Date<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
        <label className="field field-wide">Paid with<select value={form.payment} onChange={(event) => { if (isPaymentMethod(event.target.value)) setForm({ ...form, payment: event.target.value }); }}>{paymentMethods.map((paymentMethod) => <option key={paymentMethod} value={paymentMethod}>{paymentMethod}</option>)}</select></label>
        {error && <p className="form-error field-wide" role="alert">{error}</p>}
        <div className="field-wide form-actions"><Button variant="outline" onClick={onClose}>Never mind</Button><Button type="submit">{initial ? "Save changes" : "Add transaction"} <Icon name="arrow" /></Button></div>
      </form>
    </section>
  </div>;
}

export function SubscriptionDialog({ onClose }: { onClose: () => void }) {
  const { saveSubscription, setNotice } = useFinance();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<Subscription["frequency"]>("monthly");
  const [nextDate, setNextDate] = useState(dateOffset(7));
  const [category, setCategory] = useState<Category>("Entertainment");
  const [error, setError] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || Number(amount) <= 0 || !Number.isFinite(Number(amount)) || !nextDate) return setError("Add a name, a valid amount, and a payment date.");
    saveSubscription({ id: `sub-${Date.now()}`, name: name.trim(), amount: Number(amount), frequency, nextDate, category, active: true, unwanted: false, reviewedAt: dateOffset(0) });
    setNotice(`${name.trim()} added to the ghost registry.`);
    onClose();
  }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="sub-title">
      <button className="modal-close icon-button" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
      <Eyebrow>SUBSCRIPTION REGISTRY</Eyebrow><h2 id="sub-title">Name the ghost.</h2>
      <form className="form-grid" onSubmit={submit}>
        <label className="field field-wide">Subscription name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Music Box" /></label>
        <label className="field">Amount<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></label>
        <label className="field">Billing<select value={frequency} onChange={(event) => setFrequency(event.target.value as Subscription["frequency"])}><option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="yearly">Yearly</option></select></label>
        <label className="field">Next payment<input type="date" value={nextDate} onChange={(event) => setNextDate(event.target.value)} /></label>
        <label className="field">Category<select value={category} onChange={(event) => setCategory(event.target.value as Category)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        {error && <p className="form-error field-wide" role="alert">{error}</p>}
        <div className="field-wide form-actions"><Button variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Track subscription <Icon name="arrow" /></Button></div>
      </form>
    </section>
  </div>;
}

export function TransactionRow({ transaction, onEdit, showDate = true }: { transaction: Transaction; onEdit?: (transaction: Transaction) => void; showDate?: boolean }) {
  const { deleteTransaction, setNotice } = useFinance();
  const date = new Date(`${transaction.date}T12:00:00`);
  return <div className="transaction-row">
    <span className={`category-mark mark-${transaction.category.toLowerCase()}`}>{transaction.category.slice(0, 1)}</span>
    <div className="transaction-main"><strong>{transaction.description}</strong><span>{transaction.category} · {transaction.payment}{showDate ? ` · ${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}</span></div>
    <strong className={`transaction-amount ${transaction.type === "income" ? "amount-positive" : ""}`}>{transaction.type === "income" ? "+" : "−"}₹{transaction.amount.toLocaleString("en-IN")}</strong>
    {onEdit && <div className="row-actions"><button className="icon-button" aria-label={`Edit ${transaction.description}`} onClick={() => onEdit(transaction)}><Icon name="pencil" size={16} /></button><button className="icon-button" aria-label={`Delete ${transaction.description}`} onClick={() => { if (window.confirm(`Delete “${transaction.description}” from your ledger?`)) { deleteTransaction(transaction.id); setNotice("Transaction removed from the ledger."); } }}><Icon name="trash" size={16} /></button></div>}
  </div>;
}
