import { useMemo, useState } from "react";
import { useFinance } from "./context/FinanceContext";
import {
  categories,
  dateOffset,
  daysBetween,
  formatCurrency,
  monthTransactions,
  monthlySubscriptionAmount,
  totals,
  type Category,
  type Challenge,
  type Transaction,
} from "./lib/finance";
import { Button, Eyebrow, Icon, Panel, ProgressLine, SubscriptionDialog, TransactionDialog, TransactionRow } from "./components/FinanceWidgets";

type PageProps = { onAddTransaction: () => void };

function SectionHeading({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{copy}</p></div>{action}</div>;
}

function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return <div className="mini-bars" aria-label="Recent daily spending chart">{values.map((value, index) => <span key={index} style={{ height: `${Math.max(7, value / max * 100)}%` }} />)}</div>;
}

export function DashboardPage({ onAddTransaction }: PageProps) {
  const { transactions, subscriptions, challenges, preferences } = useFinance();
  const monthly = monthTransactions(transactions);
  const { income, expenses, savings } = totals(monthly);
  const balance = totals(transactions).balance;
  const expenseItems = monthly.filter((item) => item.type === "expense");
  const food = expenseItems.filter((item) => item.category === "Food");
  const largestCategory = categories.map((category) => ({
    category,
    amount: expenseItems.filter((item) => item.category === category).reduce((sum, item) => sum + item.amount, 0),
  })).sort((a, b) => b.amount - a.amount)[0];
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const firstMission = challenges.find((item) => item.active);
  const recurring = subscriptions.filter((item) => item.active).reduce((sum, item) => sum + monthlySubscriptionAmount(item), 0);
  const bars = Array.from({ length: 7 }, (_, index) => expenseItems.filter((item) => daysBetween(item.date, dateOffset(0)) === 6 - index).reduce((sum, item) => sum + item.amount, 0));
  const progress = Math.min(100, preferences.budget ? expenses / preferences.budget * 100 : 0);

  return <div className="page-stack">
    <section className="hero-panel">
      <div className="hero-copy"><Eyebrow>YOUR PERSONAL MONEY MYSTERY · NOVEMBER FILE</Eyebrow><h1>Good to see you,<br /><em>{preferences.name}.</em></h1><p>Your money left a few clues. Shall we follow them?</p>
        <Button onClick={onAddTransaction}><Icon name="plus" /> Log a transaction</Button>
      </div>
      <div className="hero-orbit" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit-core"><span>₹</span></div><i className="orbit-dot dot-a" /><i className="orbit-dot dot-b" /><i className="orbit-dot dot-c" /><span className="orbit-note">money<br />in motion</span></div>
      <div className="hero-stamp"><span>CASE NO.</span><strong>00{new Date().getDate()}</strong><span>OPEN / ACTIVE</span></div>
    </section>

    <div className="stat-grid">
      <Panel className="stat-panel"><Eyebrow>AVAILABLE BALANCE</Eyebrow><strong className="stat-value">{formatCurrency(balance, preferences.currency)}</strong><span className="stat-foot"><i className="status-dot" /> Net across your ledger</span></Panel>
      <Panel className="stat-panel"><Eyebrow>INCOME THIS MONTH</Eyebrow><strong className="stat-value">{formatCurrency(income, preferences.currency)}</strong><span className="stat-foot">The money that came home</span></Panel>
      <Panel className="stat-panel stat-highlight"><Eyebrow>OUT THE DOOR</Eyebrow><strong className="stat-value">{formatCurrency(expenses, preferences.currency)}</strong><span className="stat-foot">Across {expenseItems.length} little plot twists</span></Panel>
      <Panel className="stat-panel"><Eyebrow>KEPT FOR LATER</Eyebrow><strong className={`stat-value ${savings < 0 ? "negative" : ""}`}>{formatCurrency(savings, preferences.currency)}</strong><span className="stat-foot">Income minus expenses this month</span></Panel>
    </div>

    <div className="dashboard-grid">
      <Panel className="budget-panel">
        <div className="panel-title-row"><div><Eyebrow>THE MONTHLY PLOT</Eyebrow><h2>Budget, meet reality.</h2></div><span className="budget-percent">{Math.round(progress)}<small>%</small></span></div>
        <div className="budget-numbers"><strong>{formatCurrency(expenses, preferences.currency)} <span>spent</span></strong><span>of {formatCurrency(preferences.budget, preferences.currency)}</span></div>
        <ProgressLine value={expenses} max={preferences.budget} coral />
        <div className="budget-caption"><span>{Math.max(0, preferences.budget - expenses) > 0 ? `${formatCurrency(Math.max(0, preferences.budget - expenses), preferences.currency)} left in the envelope` : "Budget crossed — time to investigate"}</span><span>{formatCurrency(recurring, preferences.currency)} / mo in subscriptions</span></div>
      </Panel>
      <Panel className="spark-panel">
        <div className="panel-title-row"><div><Eyebrow>SEVEN-DAY TRACE</Eyebrow><h2>Spending rhythm</h2></div><span className="chart-unit">₹ / DAY</span></div>
        <MiniBars values={bars} /><div className="bar-labels"><span>6 days ago</span><span>Today</span></div>
      </Panel>
      <Panel className="transactions-panel">
        <div className="panel-title-row"><div><Eyebrow>FRESH EVIDENCE</Eyebrow><h2>Recent transactions</h2></div><span className="tiny-link">LATEST</span></div>
        {recent.length ? recent.map((item) => <TransactionRow key={item.id} transaction={item} />) : <p className="empty-note">No evidence yet. Add your first transaction.</p>}
      </Panel>
      <Panel className="radar-preview">
        <div className="preview-radar-art"><span className="radar-ring ring-1" /><span className="radar-ring ring-2" /><span className="radar-sweep" /><span className="radar-ping" /></div>
        <div className="preview-copy"><Eyebrow>THE LEAK RADAR</Eyebrow><h2>Small things<br />add up.</h2><p>{food.length > 1 ? `${food.length} food moments found. That's ${formatCurrency(food.reduce((sum, item) => sum + item.amount, 0), preferences.currency)} in this month's trail.` : "A pattern is hiding in the everyday."}</p><a className="text-link" href="/radar">Investigate patterns <Icon name="arrow" size={15} /></a></div>
      </Panel>
      <Panel className="weather-preview">
        <div><Eyebrow>FINANCIAL WEATHER</Eyebrow><h2>Mostly<br /><em>within reach.</em></h2><p>A straight-line estimate, not a promise.</p></div>
        <div className="weather-number"><span>EST. MONTH END</span><strong>{formatCurrency(balance - (expenses / Math.max(1, new Date().getDate()) * (new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate())), preferences.currency)}</strong><span>Based on this month's average daily spend</span></div>
        <a className="text-link" href="/weather">Read the forecast <Icon name="arrow" size={15} /></a>
      </Panel>
      {firstMission && <Panel className="mission-panel"><div className="mission-icon"><Icon name="spark" size={24} /></div><div className="mission-copy"><Eyebrow>ACTIVE SIDE QUEST</Eyebrow><h2>{firstMission.title}</h2><p>{firstMission.detail}</p><ProgressLine value={firstMission.progress} max={firstMission.target} /></div><span className="mission-xp">+{firstMission.xp} XP</span></Panel>}
      {largestCategory && <Panel className="insight-strip"><span className="insight-star">✳</span><div><Eyebrow>ONE THING TO NOTICE</Eyebrow><p><strong>{largestCategory.category}</strong> is your biggest category this month at <strong>{formatCurrency(largestCategory.amount, preferences.currency)}</strong>. Not a judgment. Just a clue.</p></div><a href="/rewind" className="text-link">See the trail <Icon name="arrow" size={15} /></a></Panel>}
    </div>
  </div>;
}

export function RewindPage({ onAddTransaction }: PageProps) {
  const { transactions, preferences } = useFinance();
  const [period, setPeriod] = useState("month");
  const [category, setCategory] = useState("All categories");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState(dateOffset(-30));
  const [to, setTo] = useState(dateOffset(0));
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [inspecting, setInspecting] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    const now = dateOffset(0);
    return [...transactions].filter((item) => {
      if (item.type !== "expense") return false;
      const age = daysBetween(item.date, now);
      if (period === "week" && (age < 0 || age > 7)) return false;
      if (period === "month" && !monthTransactions([item]).length) return false;
      if (period === "custom" && (item.date < from || item.date > to)) return false;
      if (category !== "All categories" && item.category !== category) return false;
      return `${item.description} ${item.category} ${item.payment}`.toLowerCase().includes(query.toLowerCase());
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, period, category, query, from, to]);

  const total = filtered.reduce((sum, item) => sum + item.amount, 0);
  const grouped = filtered.reduce<Record<string, Transaction[]>>((groups, item) => {
    (groups[item.date] ||= []).push(item);
    return groups;
  }, {});

  return <div className="page-stack">
    <SectionHeading eyebrow="CASE FILE 01 · THE PAPER TRAIL" title="Spending Rewind" copy="Every purchase leaves a trace. Filter the noise, find the story." action={<Button onClick={onAddTransaction}><Icon name="plus" /> Add transaction</Button>} />
    <Panel className="rewind-summary"><div><Eyebrow>VISIBLE IN THIS WINDOW</Eyebrow><strong>{formatCurrency(total, preferences.currency)}</strong><span>{filtered.length} transactions · expenses only</span></div><div className="rewind-filter-controls">
      <div className="segmented">{["week", "month", "custom"].map((item) => <button key={item} className={period === item ? "selected" : ""} onClick={() => setPeriod(item)}>{item === "week" ? "7 days" : item}</button>)}</div>
      <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
      <label className="search-field"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a clue..." /></label>
      {period === "custom" && <div className="date-range"><input aria-label="From date" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /><span>→</span><input aria-label="To date" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></div>}
    </div></Panel>
    <div className="rewind-layout">
      <div className="timeline">
        {Object.keys(grouped).length ? Object.entries(grouped).map(([date, items]) => <section className="timeline-day" key={date}>
          <div className="timeline-marker" /><div className="timeline-date"><span>{new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { weekday: "long" })}</span><strong>{new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</strong><small>{formatCurrency(items.reduce((sum, item) => sum + item.amount, 0), preferences.currency)} that day</small></div>
          <Panel className="timeline-items">{items.map((item) => <div key={item.id} onClick={() => setInspecting(item)} onKeyDown={(event) => { if (event.key === "Enter") setInspecting(item); }} role="button" tabIndex={0} className="inspect-row"><TransactionRow transaction={item} onEdit={setEditing} showDate={false} /></div>)}</Panel>
        </section>) : <Panel className="empty-state"><span className="empty-doodle">?</span><h2>No clues in this window.</h2><p>Try another date range or log a transaction to get the story started.</p><Button onClick={onAddTransaction}><Icon name="plus" /> Add first transaction</Button></Panel>}
      </div>
      <aside className="rewind-aside"><Eyebrow>YOUR TIMELINE</Eyebrow><div className="aside-big-number">{Object.keys(grouped).length}<span> active<br />days</span></div><p>Tap any transaction to inspect the details. Edit or remove a record from its action buttons.</p><div className="aside-rule" /><span className="aside-note">Filters are local to this view. Your ledger stays untouched.</span></aside>
    </div>
    {editing && <TransactionEditor transaction={editing} onClose={() => setEditing(undefined)} />}
    {inspecting && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setInspecting(null); }}><Panel className="detail-modal"><button className="modal-close icon-button" onClick={() => setInspecting(null)} aria-label="Close"><Icon name="close" /></button><Eyebrow>TRANSACTION DETAIL</Eyebrow><h2>{inspecting.description}</h2><strong className="detail-amount">{formatCurrency(inspecting.amount, preferences.currency)}</strong><dl><dt>Category</dt><dd>{inspecting.category}</dd><dt>Date</dt><dd>{new Date(`${inspecting.date}T12:00:00`).toLocaleDateString("en-IN", { dateStyle: "long" })}</dd><dt>Payment</dt><dd>{inspecting.payment}</dd></dl></Panel></div>}
  </div>;
}

function TransactionEditor({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) {
  return <TransactionDialog initial={transaction} onClose={onClose} />;
}

export function RadarPage() {
  const { transactions, preferences } = useFinance();
  const thisMonth = monthTransactions(transactions).filter((item) => item.type === "expense");
  const byDescription = Object.values(thisMonth.reduce<Record<string, Transaction[]>>((groups, item) => {
    const key = item.description.toLowerCase().trim();
    (groups[key] ||= []).push(item);
    return groups;
  }, {})).map((items) => ({
    label: items[0].description,
    count: items.length,
    total: items.reduce((sum, item) => sum + item.amount, 0),
    average: items.reduce((sum, item) => sum + item.amount, 0) / items.length,
    category: items[0].category,
  })).sort((a, b) => b.total - a.total);
  const repeats = byDescription.filter((item) => item.count > 1);
  const categoryTotals = categories.map((category) => ({ category, total: thisMonth.filter((item) => item.category === category).reduce((sum, item) => sum + item.amount, 0) })).filter((item) => item.total > 0).sort((a, b) => b.total - a.total);
  const max = Math.max(1, ...categoryTotals.map((item) => item.total));
  return <div className="page-stack">
    <SectionHeading eyebrow="CASE FILE 02 · PATTERN RECOGNITION" title="Money Leak Radar" copy="No predictions. Just arithmetic and the patterns your own ledger leaves behind." />
    <section className="radar-hero"><div className="radar-large"><span className="radar-ring ring-1" /><span className="radar-ring ring-2" /><span className="radar-ring ring-3" /><span className="radar-sweep" /><span className="radar-ping" /><span className="radar-cross">+</span></div><div className="radar-hero-copy"><Eyebrow>THIS MONTH · {thisMonth.length} EXPENSES REVIEWED</Eyebrow><h2>The little leaks<br />have a rhythm.</h2><p>Repeated descriptions and category totals are calculated from your expense entries for this calendar month.</p><div className="radar-legend"><span><i className="legend-dot coral-dot" /> repeat purchase</span><span><i className="legend-dot cream-dot" /> category concentration</span></div></div><div className="radar-scan-tag">SCANNING<br />YOUR LEDGER</div></section>
    <div className="radar-summary-grid"><Panel><Eyebrow>REPEATED DESCRIPTIONS</Eyebrow><strong className="radar-stat">{repeats.length}</strong><span className="stat-foot">Items with more than one matching description</span></Panel><Panel><Eyebrow>SMALL PURCHASES ≤ ₹300</Eyebrow><strong className="radar-stat">{formatCurrency(thisMonth.filter((item) => item.amount <= 300).reduce((sum, item) => sum + item.amount, 0), preferences.currency)}</strong><span className="stat-foot">{thisMonth.filter((item) => item.amount <= 300).length} moments under ₹300</span></Panel><Panel><Eyebrow>TOP CATEGORY</Eyebrow><strong className="radar-stat">{categoryTotals[0]?.category || "—"}</strong><span className="stat-foot">{categoryTotals[0] ? formatCurrency(categoryTotals[0].total, preferences.currency) : "Add expenses to find a pattern"}</span></Panel></div>
    <div className="radar-content-grid"><Panel className="leak-list"><div className="panel-title-row"><div><Eyebrow>REPEATED PURCHASES</Eyebrow><h2>Could this be a habit?</h2></div><span className="calculation-label">RULE-BASED · THIS MONTH</span></div>
      {repeats.length ? repeats.map((item) => <article className="leak-item" key={item.label}><span className="leak-index">0{repeats.indexOf(item) + 1}</span><div className="leak-detail"><strong>{item.label}</strong><span>{formatCurrency(item.average, preferences.currency)} × {item.count} times · {item.category}</span><p>If you skipped one in every four, that could free up {formatCurrency(Math.round(item.total * .25), preferences.currency)} this month.</p></div><strong className="leak-total">{formatCurrency(item.total, preferences.currency)}</strong></article>) : <p className="empty-note">No repeated descriptions in this month's data yet. Patterns need a few repeats.</p>}
    </Panel><Panel className="category-panel"><Eyebrow>CATEGORY FREQUENCY</Eyebrow><h2>Where it wanders</h2>{categoryTotals.length ? categoryTotals.map((item) => <div className="category-frequency" key={item.category}><div><span>{item.category}</span><strong>{formatCurrency(item.total, preferences.currency)}</strong></div><ProgressLine value={item.total} max={max} coral={categoryTotals[0]?.category === item.category} /></div>) : <p className="empty-note">No expense data this month.</p>}<p className="method-note">Bars compare total recorded spending by category. No external data or forecasts involved.</p></Panel></div>
  </div>;
}

export function AlternatePage() {
  const { transactions, subscriptions, preferences } = useFinance();
  const [scenario, setScenario] = useState("food");
  const [amount, setAmount] = useState(30);
  const monthly = monthTransactions(transactions).filter((item) => item.type === "expense");
  const foodSpend = monthly.filter((item) => item.category === "Food").reduce((sum, item) => sum + item.amount, 0);
  const shoppingSpend = monthly.filter((item) => item.category === "Shopping").reduce((sum, item) => sum + item.amount, 0);
  const subscriptionSpend = subscriptions.filter((item) => item.active).reduce((sum, item) => sum + monthlySubscriptionAmount(item), 0);
  const dailyFood = foodSpend / Math.max(1, new Date().getDate());
  const savings = scenario === "food" ? dailyFood * amount : scenario === "daily" ? amount * 30 : scenario === "shopping" ? shoppingSpend * amount / 100 : subscriptionSpend * amount / 100;
  const scenarioCopy = {
    food: { label: "Skip food delivery", base: dailyFood, unit: "days", hint: "Based on your Food category's daily average this month." },
    daily: { label: "Save a little daily", base: 1, unit: "₹ per day", hint: "A simple daily amount multiplied by 30 days." },
    shopping: { label: "Turn down shopping", base: shoppingSpend, unit: "percent", hint: "Applied to your Shopping category this month." },
    subs: { label: "Trim subscriptions", base: subscriptionSpend, unit: "percent", hint: "Applied to active subscriptions' monthly equivalent." },
  }[scenario]!;
  const slider = scenario === "food" ? { min: 0, max: 30, value: amount } : scenario === "daily" ? { min: 10, max: 500, value: amount } : { min: 0, max: 100, value: amount };
  return <div className="page-stack">
    <SectionHeading eyebrow="CASE FILE 03 · PARALLEL UNIVERSES" title="Alternate Reality" copy="A small change, an alternate ending. Drag a slider and see what the maths says." />
    <div className="alternate-layout"><Panel className="scenario-panel"><Eyebrow>CHOOSE A WHAT-IF</Eyebrow><h2>Change one thing.</h2><div className="scenario-options">{[
      ["food", "Skip food delivery", "A few fewer orders."], ["daily", "Save every day", "Little by little counts."], ["shopping", "Reduce shopping", "Less scroll, more saved."], ["subs", "Trim subscriptions", "Quiet a couple of ghosts."],
    ].map(([id, title, desc]) => <button key={id} onClick={() => { setScenario(id); setAmount(id === "food" ? 30 : id === "daily" ? 100 : 20); }} className={`scenario-option ${scenario === id ? "active" : ""}`}><span className="scenario-radio" /><span><strong>{title}</strong><small>{desc}</small></span><Icon name="arrow" size={16} /></button>)}</div></Panel>
    <Panel className="simulator-panel"><div className="simulator-top"><Eyebrow>SLIDE INTO ANOTHER TIMELINE</Eyebrow><span className="simulation-pill">LIVE SIMULATION</span></div><h2>{scenarioCopy.label}</h2><p>{scenarioCopy.hint}</p><div className="slider-value">{scenario === "food" ? `${amount} days` : scenario === "daily" ? `${formatCurrency(amount, preferences.currency)} / day` : `${amount}%`}</div><input className="range-slider" aria-label={`Adjust ${scenarioCopy.label}`} type="range" min={slider.min} max={slider.max} value={slider.value} onChange={(event) => setAmount(Number(event.target.value))} /><div className="range-ends"><span>{scenario === "daily" ? "₹10" : "0"}</span><span>{scenario === "food" ? "30 days" : scenario === "daily" ? "₹500" : "100%"}</span></div>
      <div className="simulation-results"><div><span>IN ONE MONTH</span><strong>{formatCurrency(savings, preferences.currency)}</strong><small>estimated savings</small></div><span className="result-arrow">× 12</span><div><span>IN ONE YEAR</span><strong>{formatCurrency(savings * 12, preferences.currency)}</strong><small>if the pattern holds</small></div></div>
      <div className="before-after"><span>NOW</span><div className="before-track"><i style={{ width: `${Math.min(100, Math.max(4, savings / Math.max(1, monthly.reduce((sum, item) => sum + item.amount, 0)) * 100))}%` }} /></div><span>OTHER YOU</span></div>
    </Panel></div>
    <p className="disclaimer"><Icon name="spark" size={15} /> Estimates use your current month-to-date transactions and the slider values. Real life may differ. This is a calculator, not a prediction.</p>
  </div>;
}

export function SubscriptionsPage() {
  const { subscriptions, updateSubscription, setNotice, preferences } = useFinance();
  const [adding, setAdding] = useState(false);
  const active = subscriptions.filter((item) => item.active);
  const monthly = active.reduce((sum, item) => sum + monthlySubscriptionAmount(item), 0);
  const soon = active.filter((item) => daysBetween(dateOffset(0), item.nextDate) >= 0 && daysBetween(dateOffset(0), item.nextDate) <= 7);
  return <div className="page-stack">
    <SectionHeading eyebrow="CASE FILE 04 · RECURRING MYSTERIES" title="Subscription Ghosts" copy="The quiet charges that come back like clockwork. We track them; we don't cancel them for you." action={<Button onClick={() => setAdding(true)}><Icon name="plus" /> Add a ghost</Button>} />
    <div className="subscription-stats"><Panel><Eyebrow>MONTHLY HAUNTING</Eyebrow><strong>{formatCurrency(monthly, preferences.currency)}</strong><span>Active recurring equivalent</span></Panel><Panel><Eyebrow>YEARLY HAUNTING</Eyebrow><strong>{formatCurrency(monthly * 12, preferences.currency)}</strong><span>At today's subscription list</span></Panel><Panel className="sub-alert"><Eyebrow>ON THE RADAR</Eyebrow><strong>{soon.length} <small>coming up</small></strong><span>{soon.length ? `${soon.map((item) => item.name).join(", ")} due within 7 days` : "No active payments due this week"}</span></Panel></div>
    <Panel className="subscription-list"><div className="panel-title-row"><div><Eyebrow>THE GHOST REGISTRY</Eyebrow><h2>Recurring characters</h2></div><span className="calculation-label">LOCAL TRACKER · NOT LINKED TO PROVIDERS</span></div>
      {subscriptions.length ? subscriptions.map((item) => {
        const days = daysBetween(dateOffset(0), item.nextDate);
        const unreviewed = daysBetween(item.reviewedAt, dateOffset(0)) > 60;
        return <article className={`subscription-row ${!item.active ? "subscription-inactive" : ""}`} key={item.id}>
          <span className={`ghost-avatar ${item.unwanted ? "ghost-unwanted" : ""}`}><Icon name="ghost" size={20} /></span><div className="subscription-info"><strong>{item.name}{item.unwanted && <em className="unwanted-tag">UNWANTED?</em>}</strong><span>{item.category} · {item.frequency} · {item.active ? days < 0 ? "Date needs updating" : days === 0 ? "Due today" : `Next payment in ${days} days` : "Marked cancelled"}</span></div><strong className="subscription-amount">{formatCurrency(item.amount, preferences.currency)}<small> / {item.frequency === "yearly" ? "yr" : item.frequency === "weekly" ? "wk" : "mo"}</small></strong>{unreviewed && item.active && <span className="review-badge">REVIEW ME</span>}
          <div className="subscription-actions"><button className="text-button" onClick={() => { updateSubscription(item.id, { unwanted: !item.unwanted, reviewedAt: dateOffset(0) }); setNotice(item.unwanted ? "Marked as wanted and reviewed." : "Marked as unwanted. Remember to cancel with the provider if you choose."); }}>{item.unwanted ? "Keep?" : "Unwanted?"}</button><button className="text-button" onClick={() => { updateSubscription(item.id, { active: !item.active, reviewedAt: dateOffset(0) }); setNotice(item.active ? "Marked as cancelled in your tracker. No provider was contacted." : "Subscription marked active."); }}>{item.active ? "Mark cancelled" : "Reactivate"}</button></div>
        </article>;
      }) : <div className="empty-state"><span className="empty-doodle">0</span><h2>No ghosts. Yet.</h2><p>Add recurring payments to keep them in view.</p></div>}
    </Panel><p className="disclaimer"><Icon name="spark" size={15} /> Subscription status is only a note in MISCHIEF. It never contacts or cancels an external service.</p>
    {adding && <SubscriptionDialog onClose={() => setAdding(false)} />}
  </div>;
}

export function WeatherPage() {
  const { transactions, preferences } = useFinance();
  const thisMonth = monthTransactions(transactions);
  const expense = thisMonth.filter((item) => item.type === "expense");
  const income = thisMonth.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const spent = expense.reduce((sum, item) => sum + item.amount, 0);
  const day = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daily = spent / Math.max(day, 1);
  const estimate = income - spent - daily * (daysInMonth - day);
  const remaining = preferences.budget - spent;
  const weather = remaining < 0 ? "A little stormy" : remaining < preferences.budget * .25 ? "Clouds on the horizon" : "Clear with room to roam";
  const bars = Array.from({ length: Math.min(14, day) }, (_, index) => expense.filter((item) => daysBetween(item.date, dateOffset(0)) === day - 1 - index).reduce((sum, item) => sum + item.amount, 0)).reverse();
  return <div className="page-stack">
    <SectionHeading eyebrow="CASE FILE 05 · THE NEAR FUTURE" title="Financial Weather" copy="A forecast drawn from your recorded spending pace. An estimate, never a guarantee." />
    <section className="weather-hero"><div className="weather-sky"><div className="weather-sun" /><div className="weather-cloud cloud-one" /><div className="weather-cloud cloud-two" /><span className="weather-axis axis-one" /><span className="weather-axis axis-two" /><span className="sky-label">MONTH-TO-DATE TRACE</span></div><div className="weather-report"><Eyebrow>YOUR OUTLOOK</Eyebrow><h2>{weather.split(" ").slice(0, 2).join(" ")}<br /><em>{weather.split(" ").slice(2).join(" ")}</em></h2><p>Projected month-end balance</p><strong>{formatCurrency(estimate, preferences.currency)}</strong><span>Current month income minus recorded spending and a straight-line estimate for remaining days.</span></div></section>
    <div className="weather-stats"><Panel><Eyebrow>AVAILABLE BALANCE</Eyebrow><strong>{formatCurrency(totals(transactions).balance, preferences.currency)}</strong><span>All recorded income − expenses</span></Panel><Panel><Eyebrow>AVERAGE DAILY SPEND</Eyebrow><strong>{formatCurrency(daily, preferences.currency)}</strong><span>{day} days into this calendar month</span></Panel><Panel><Eyebrow>EST. REMAINING BUDGET</Eyebrow><strong className={remaining < 0 ? "negative" : ""}>{formatCurrency(remaining, preferences.currency)}</strong><span>Budget less this month's recorded expenses</span></Panel></div>
    <Panel className="trend-panel"><div className="panel-title-row"><div><Eyebrow>SPENDING TREND</Eyebrow><h2>Daily recorded outflow</h2></div><span className="calculation-label">LAST {bars.length} DAYS</span></div><MiniBars values={bars} /><div className="bar-labels"><span>{bars.length} days ago</span><span>Today</span></div><p className="method-note">Days without logged expenses appear as zero. The estimate assumes future daily spending matches the month-to-date average.</p></Panel>
    <p className="disclaimer"><Icon name="spark" size={15} /> Estimates use only data saved in this browser. Unrecorded transactions and future changes are not included.</p>
  </div>;
}

export function ChallengesPage() {
  const { challenges, completed, xp, updateChallenge, finishChallenge, saveChallenge, setNotice } = useFinance();
  const [custom, setCustom] = useState("");
  const [target, setTarget] = useState("1");
  const level = Math.floor(xp / 300) + 1;
  function addCustom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!custom.trim() || Number(target) <= 0) return setNotice("Add a challenge name and a target above zero.", "error");
    saveChallenge({ id: `challenge-${Date.now()}`, title: custom.trim(), detail: "Your custom mini-mission. Mark progress as you go.", target: Number(target), progress: 0, xp: 100, active: true });
    setCustom(""); setTarget("1"); setNotice("New challenge unlocked.");
  }
  return <div className="page-stack chaos-page">
    <section className="chaos-hero"><div><Eyebrow>CASE FILE 06 · PLAY WITH THE PLOT</Eyebrow><h1>Make saving<br />a little <em>chaotic.</em></h1><p>Small quests. Real money. No boss level required.</p></div><div className="xp-totem"><span>YOUR CHAOS LEVEL</span><strong>{String(level).padStart(2, "0")}</strong><i>LVL</i><div className="xp-track"><span style={{ width: `${xp % 300 / 3}%` }} /></div><small>{xp % 300} / 300 XP to next level</small></div><span className="chaos-doodle doodle-star">✳</span><span className="chaos-doodle doodle-circle" /></section>
    <div className="challenge-columns"><section><div className="panel-title-row challenge-title"><div><Eyebrow>YOUR ACTIVE MISSIONS</Eyebrow><h2>Current mischief</h2></div><span className="mission-count">{challenges.length} OPEN</span></div>
      {challenges.length ? <div className="challenge-list">{challenges.map((challenge, index) => <ChallengeCard challenge={challenge} index={index} key={challenge.id} onProgress={(amount) => {
        const next = Math.min(challenge.target, challenge.progress + amount);
        if (next >= challenge.target) { finishChallenge(challenge); setNotice(`Mission complete! +${challenge.xp} XP. Lovely work.`); }
        else updateChallenge(challenge.id, { progress: next });
      }} />)}</div> : <Panel className="empty-state"><span className="empty-doodle">✓</span><h2>All caught up.</h2><p>Create a new mini-mission or celebrate what you've finished.</p></Panel>}
    </section><aside className="challenge-aside"><Panel className="custom-challenge"><Eyebrow>MAKE YOUR OWN RULES</Eyebrow><h2>Invent a side quest.</h2><form onSubmit={addCustom}><label className="field">Mission name<input value={custom} onChange={(event) => setCustom(event.target.value)} maxLength={54} placeholder="e.g. Bring lunch from home" /></label><label className="field">Progress target<input type="number" min="1" value={target} onChange={(event) => setTarget(event.target.value)} /></label><Button type="submit"><Icon name="plus" /> Create challenge</Button></form></Panel><Panel className="achievement-panel"><Eyebrow>THE HALL OF DONE</Eyebrow><h2>Little victories.</h2>{completed.length ? completed.map((item, index) => <div className="achievement-item" key={`${item}-${index}`}><span className="badge-seal"><Icon name="spark" size={17} /></span><span><strong>{item}</strong><small>Completed · XP earned</small></span><span className="badge-check">✓</span></div>) : <p className="empty-note">Your first badge is waiting on the other side of a challenge.</p>}</Panel></aside></div>
  </div>;
}

function ChallengeCard({ challenge, index, onProgress }: { challenge: Challenge; index: number; onProgress: (amount: number) => void }) {
  const percent = Math.min(100, challenge.progress / challenge.target * 100);
  return <Panel className={`challenge-card challenge-color-${index % 4}`}><div className="challenge-card-head"><span className="challenge-number">0{index + 1}</span><span className="challenge-xp">+{challenge.xp} XP</span></div><h3>{challenge.title}</h3><p>{challenge.detail}</p><div className="challenge-progress"><ProgressLine value={challenge.progress} max={challenge.target} /><span>{Math.round(percent)}%</span></div><div className="challenge-card-bottom"><span>{challenge.progress} / {challenge.target} progress</span><Button variant="outline" onClick={() => onProgress(1)}>{challenge.progress + 1 >= challenge.target ? "Complete it" : "Add progress"} <Icon name="arrow" size={15} /></Button></div></Panel>;
}

export function SettingsPage() {
  const { preferences, updatePreferences, reset, exportData, transactions, subscriptions, challenges, setNotice } = useFinance();
  const [name, setName] = useState(preferences.name);
  const [budget, setBudget] = useState(String(preferences.budget));
  function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !Number.isFinite(Number(budget)) || Number(budget) <= 0) return setNotice("Enter a name and a monthly budget greater than zero.", "error");
    updatePreferences({ name: name.trim(), budget: Number(budget) });
    setNotice("Preferences saved. The ledger has been updated.");
  }
  return <div className="page-stack">
    <SectionHeading eyebrow="CASE FILE 07 · YOUR CONTROL ROOM" title="Settings" copy="Your data stays in this browser. Tune the experience or take your records with you." />
    <div className="settings-layout"><div className="settings-main">
      <Panel className="settings-panel"><Eyebrow>THE PERSON BEHIND THE NUMBERS</Eyebrow><h2>Make it yours.</h2><form onSubmit={saveSettings} className="settings-form"><label className="field">Display name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} /></label><label className="field">Currency<select value={preferences.currency} onChange={(event) => updatePreferences({ currency: event.target.value })}><option value="INR">Indian Rupee · INR ₹</option><option value="USD">US Dollar · USD $</option><option value="EUR">Euro · EUR €</option><option value="GBP">British Pound · GBP £</option></select></label><label className="field">Monthly budget<input type="number" min="1" step="100" value={budget} onChange={(event) => setBudget(event.target.value)} /></label><Button type="submit">Save preferences <Icon name="arrow" /></Button></form></Panel>
      <Panel className="settings-panel theme-panel"><Eyebrow>THE ATMOSPHERE</Eyebrow><h2>Pick your light.</h2><div className="theme-choices"><button onClick={() => updatePreferences({ theme: "midnight" })} className={`theme-choice theme-midnight ${preferences.theme === "midnight" ? "active" : ""}`}><span /><strong>Midnight</strong><small>Navy · Cream · Coral</small>{preferences.theme === "midnight" && <i>SELECTED</i>}</button><button onClick={() => updatePreferences({ theme: "cream" })} className={`theme-choice theme-cream ${preferences.theme === "cream" ? "active" : ""}`}><span /><strong>Paper trail</strong><small>Cream · Navy · Coral</small>{preferences.theme === "cream" && <i>SELECTED</i>}</button></div></Panel>
    </div><aside className="settings-aside"><Panel className="data-panel"><Eyebrow>YOUR LOCAL CASE FILE</Eyebrow><h2>Data footprint</h2><div className="data-count"><strong>{transactions.length}</strong><span>transactions</span></div><div className="data-count"><strong>{subscriptions.length}</strong><span>subscriptions</span></div><div className="data-count"><strong>{challenges.length}</strong><span>open challenges</span></div><div className="aside-rule" /><p>Saved in your browser's local storage. No bank connections. No servers. No surprises.</p></Panel><Panel className="data-actions"><Eyebrow>TAKE IT OR RESET IT</Eyebrow><h2>Data management.</h2><Button variant="outline" onClick={exportData}><Icon name="download" /> Export JSON</Button><Button variant="outline" onClick={() => { if (window.confirm("Restore the original sample ledger? This replaces your current transactions and settings.")) reset(false); }}><Icon name="spark" /> Reset sample data</Button><Button variant="quiet" onClick={() => { if (window.confirm("Clear all transactions, subscriptions, and challenges from this browser? This cannot be undone.")) reset(true); }}><Icon name="trash" /> Clear my data</Button></Panel></aside></div>
    <p className="disclaimer"><Icon name="spark" size={15} /> MISCHIEF is a local tracking tool, not a bank or financial adviser. Your exported file contains your ledger — keep it somewhere safe.</p>
  </div>;
}
