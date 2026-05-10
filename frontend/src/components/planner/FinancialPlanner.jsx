import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Activity, GitCompare, Star, Briefcase,
  Calculator, ShieldAlert, Bell, Globe2,
} from "lucide-react";
import { motion } from "framer-motion";
import { fetchFx, Watchlist } from "./api";

import AnalyzeTab from "./AnalyzeTab";
import CompareTab from "./CompareTab";
import WatchlistTab from "./WatchlistTab";
import PortfolioTab from "./PortfolioTab";
import CalculatorsTab from "./CalculatorsTab";
import RiskProfileTab from "./RiskProfileTab";
import AlertsTab from "./AlertsTab";

const TABS = [
  { id: "analyze",    label: "Analyse",   icon: Activity },
  { id: "compare",    label: "Compare",   icon: GitCompare },
  { id: "watchlist",  label: "Watchlist", icon: Star },
  { id: "portfolio",  label: "Portfolio", icon: Briefcase },
  { id: "calculator", label: "Calculators", icon: Calculator },
  { id: "risk",       label: "Risk profile", icon: ShieldAlert },
  { id: "alerts",     label: "Alerts",    icon: Bell },
];

const FinancialPlanner = () => {
  const [active, setActive] = useState("analyze");
  const [currency, setCurrency] = useState("USD");
  const [fxRate, setFxRate] = useState(1);
  const [watched, setWatched] = useState([]);

  // Load FX whenever currency changes (USD <-> INR, base USD).
  useEffect(() => {
    if (currency === "USD") { setFxRate(1); return; }
    fetchFx("USD", currency).then((r) => setFxRate(r.rate)).catch(() => setFxRate(1));
  }, [currency]);

  const refreshWatched = useCallback(async () => {
    try {
      const r = await Watchlist.list();
      setWatched((r.items || []).map((i) => i.ticker));
    } catch { /* mongo not up; ignore */ }
  }, []);

  useEffect(() => { refreshWatched(); }, [refreshWatched]);

  const toggleWatch = useCallback(async (t) => {
    try {
      if (watched.includes(t)) await Watchlist.remove(t);
      else await Watchlist.add(t);
      await refreshWatched();
    } catch { /* ignore */ }
  }, [watched, refreshWatched]);

  return (
    <div className="min-h-screen bg-giftyne-bg" data-testid="financial-planner">
      {/* Header */}
      <header className="border-b border-giftyne-sand/60 bg-giftyne-bg/95 backdrop-blur-md sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 font-body text-sm font-medium text-giftyne-text/60 hover:text-giftyne-terra">
            <ArrowLeft size={16} /> Giftyne
          </Link>
          <div className="text-center">
            <span className="font-accent text-sm text-giftyne-terra">your money matters</span>
            <h1 className="font-heading text-2xl font-bold text-giftyne-text leading-none">Financial Planner</h1>
          </div>
          <div className="flex items-center gap-2">
            <Globe2 size={14} className="text-giftyne-text/45" />
            <div className="inline-flex bg-white border border-giftyne-sand/60 rounded-full p-0.5 text-xs">
              {["USD", "INR"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1 rounded-full font-body font-semibold transition-colors ${
                    currency === c ? "bg-giftyne-terra text-white" : "text-giftyne-text/60 hover:text-giftyne-terra"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab strip */}
        <div className="border-t border-giftyne-sand/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                data-testid={`tab-${t.id}`}
                className={`relative inline-flex items-center gap-2 px-4 py-3 font-body text-sm font-medium whitespace-nowrap transition-colors ${
                  active === t.id ? "text-giftyne-terra" : "text-giftyne-text/55 hover:text-giftyne-text"
                }`}
              >
                <t.icon size={14} /> {t.label}
                {active === t.id && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute left-3 right-3 -bottom-px h-[2px] bg-giftyne-terra rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {active === "analyze" && <AnalyzeTab currency={currency} fxRate={fxRate} onWatch={toggleWatch} watched={watched} />}
        {active === "compare" && <CompareTab currency={currency} fxRate={fxRate} />}
        {active === "watchlist" && <WatchlistTab currency={currency} fxRate={fxRate} onListUpdate={(items) => setWatched(items.map((i) => i.ticker))} />}
        {active === "portfolio" && <PortfolioTab currency={currency} fxRate={fxRate} />}
        {active === "calculator" && <CalculatorsTab currency={currency} fxRate={fxRate} />}
        {active === "risk" && <RiskProfileTab />}
        {active === "alerts" && <AlertsTab />}
      </main>
    </div>
  );
};

export default FinancialPlanner;
