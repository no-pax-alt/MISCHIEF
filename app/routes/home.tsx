import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { BlobCursor } from "../components/BlobCursor";
import { Button, Eyebrow, Icon, Toast, TransactionDialog } from "../components/FinanceWidgets";
import { useFinance } from "../context/FinanceContext";
import {
  AlternatePage,
  ChallengesPage,
  DashboardPage,
  RadarPage,
  RewindPage,
  SettingsPage,
  SubscriptionsPage,
  WeatherPage,
} from "../pages";
import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "MISCHIEF — Your Money Has a Secret Life" },
    { name: "description", content: "Follow the clues. Find your money's secret life." },
  ];
}

const navigation = [
  { path: "/", label: "The overview", icon: "home", group: "YOUR CASE" },
  { path: "/rewind", label: "Spending rewind", icon: "rewind" },
  { path: "/radar", label: "Leak radar", icon: "radar" },
  { path: "/alternate", label: "Alternate reality", icon: "alternate", group: "WHAT IF?" },
  { path: "/subscriptions", label: "Subscription ghosts", icon: "ghost" },
  { path: "/weather", label: "Financial weather" , icon: "weather" },
  { path: "/challenges", label: "Chaos challenges", icon: "challenge", group: "PLAY NICE" },
  { path: "/settings", label: "Settings", icon: "settings" },
];

const pageNames: Record<string, string> = {
  "/": "The overview",
  "/rewind": "Spending rewind",
  "/radar": "Leak radar",
  "/alternate": "Alternate reality",
  "/subscriptions": "Subscription ghosts",
  "/weather": "Financial weather",
  "/challenges": "Chaos challenges",
  "/settings": "Settings",
};

function PageContent({ path, onAddTransaction }: { path: string; onAddTransaction: () => void }) {
  switch (path) {
    case "/rewind": return <RewindPage onAddTransaction={onAddTransaction} />;
    case "/radar": return <RadarPage />;
    case "/alternate": return <AlternatePage />;
    case "/subscriptions": return <SubscriptionsPage />;
    case "/weather": return <WeatherPage />;
    case "/challenges": return <ChallengesPage />;
    case "/settings": return <SettingsPage />;
    default: return <DashboardPage onAddTransaction={onAddTransaction} />;
  }
}

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const { preferences } = useFinance();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [moshing, setMoshing] = useState(false);
  const path = location.pathname === "/" ? "/" : location.pathname.replace(/\/+$/, "");

  useEffect(() => {
    setMoshing(true);
    const timer = window.setTimeout(() => setMoshing(false), 420);
    return () => window.clearTimeout(timer);
  }, [path]);

  function go(pathname: string) {
    if (pathname === path) return;
    setMoshing(true);
    navigate(pathname);
  }

  return <div className={`app-shell theme-${preferences.theme}`}>
    <BlobCursor />
    <aside className="sidebar">
      <Link to="/" className="brand-lockup" aria-label="MISCHIEF overview" onClick={(event) => { event.preventDefault(); go("/"); }}>
        <span className="brand-mark"><i /><i /><i /></span><span className="brand-name">MISCHIEF<small>YOUR MONEY HAS A SECRET LIFE</small></span>
      </Link>
      <div className="sidebar-file"><Eyebrow>FIELD NOTES / 001</Eyebrow><span>THE MONEY<br />MYSTERY</span><i className="file-line" /><small>OPEN CASE <b>✳</b></small></div>
      <nav className="main-nav" aria-label="Main navigation">
        {navigation.map((item, index) => <div key={item.path}>
          {item.group && <div className={`nav-group ${index ? "" : "nav-first"}`}>{item.group}</div>}
          <Link to={item.path} onClick={(event) => { event.preventDefault(); go(item.path); }} className={`nav-item ${path === item.path ? "active" : ""}`} aria-current={path === item.path ? "page" : undefined}>
            <Icon name={item.icon} size={17} /><span>{item.label}</span>{path === item.path && <i className="nav-active-mark" />}
          </Link>
        </div>)}
      </nav>
      <div className="sidebar-bottom"><span className="privacy-mark"><i /> LOCAL-ONLY LEDGER</span><span className="sidebar-version">MISCHIEF / V.01</span></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><span>CASE FILE</span><i>/</i><strong>{pageNames[path] || "The overview"}</strong></div><div className="topbar-actions"><span className="date-stamp"><i /> {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()}</span><Button variant="outline" className="top-add" onClick={() => setDialogOpen(true)}><Icon name="plus" /> Quick add</Button><button className="avatar-button" onClick={() => go("/settings")} aria-label="Open settings">{preferences.name.slice(0, 1).toUpperCase()}</button></div></header>
      <div className={`page-frame ${moshing ? "page-moshing" : ""}`} key={path}><PageContent path={path} onAddTransaction={() => setDialogOpen(true)} /></div>
      <footer className="app-footer"><span>FOLLOW THE CLUES, NOT THE CROWD.</span><span>MADE FOR YOUR EYES ONLY <i>✳</i></span></footer>
    </main>
    <Toast />
    {dialogOpen && <TransactionDialog onClose={() => setDialogOpen(false)} />}
  </div>;
}
