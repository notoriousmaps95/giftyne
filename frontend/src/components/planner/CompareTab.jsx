import { useState } from "react";
import { GitCompare, Plus, X, Loader2, Search } from "lucide-react";
import { analyzeTicker } from "./api";
import { Card, SectionTitle, PrimaryButton, formatCurrency, formatPct, Empty } from "./shared";

const CompareTab = ({ currency, fxRate }) => {
  const [tickers, setTickers] = useState(["AAPL", "MSFT"]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const addTicker = () => {
    const t = input.trim().toUpperCase();
    if (!t || tickers.includes(t) || tickers.length >= 4) return;
    setTickers([...tickers, t]);
    setInput("");
  };

  const removeTicker = (t) => {
    setTickers(tickers.filter((x) => x !== t));
    setResults((r) => { const c = { ...r }; delete c[t]; return c; });
  };

  const compare = async () => {
    setLoading(true);
    try {
      const out = {};
      await Promise.all(tickers.map(async (t) => {
        try { out[t] = await analyzeTicker(t); } catch { out[t] = null; }
      }));
      setResults(out);
    } finally { setLoading(false); }
  };

  const rows = [
    { key: "price", label: "Current price", get: (r) => formatCurrency(r.quote.current_price, currency, fxRate) },
    { key: "1d", label: "1d change", get: (r) => formatPct(r.quote.change_1d_pct), tone: (r) => r.quote.change_1d_pct >= 0 ? "up" : "down" },
    { key: "30d", label: "30d change", get: (r) => formatPct(r.quote.change_30d_pct), tone: (r) => r.quote.change_30d_pct >= 0 ? "up" : "down" },
    { key: "90d", label: "90d change", get: (r) => formatPct(r.quote.change_90d_pct), tone: (r) => r.quote.change_90d_pct >= 0 ? "up" : "down" },
    { key: "mc", label: "Market cap", get: (r) => formatCurrency(r.financials.market_cap, currency, fxRate) },
    { key: "pe", label: "P/E ratio", get: (r) => r.financials.pe_ratio?.toFixed(2) ?? "—" },
    { key: "growth", label: "Revenue growth", get: (r) => formatPct(r.financials.revenue_growth_yoy * 100) },
    { key: "margin", label: "Profit margin", get: (r) => formatPct(r.financials.profit_margin * 100) },
    { key: "de", label: "Debt / Equity", get: (r) => r.balance_sheet.debt_to_equity?.toFixed(2) ?? "—" },
    { key: "rsi", label: "RSI (14)", get: (r) => r.technicals.rsi_14 ?? "—" },
    { key: "trend", label: "Trend", get: (r) => r.technicals.trend.toUpperCase() },
    { key: "short", label: "Short verdict", get: (r) => r.recommendation.short_term.verdict },
    { key: "long", label: "Long verdict", get: (r) => r.recommendation.long_term.verdict },
    { key: "risk", label: "Risk", get: (r) => r.recommendation.risk_level },
  ];

  return (
    <div className="space-y-6">
      <Card className="md:p-8">
        <SectionTitle icon={GitCompare} title="Compare stocks" hint="Add up to 4 tickers and run a side-by-side comparison." />
        <div className="flex flex-wrap gap-2 mb-3">
          {tickers.map((t) => (
            <span key={t} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-giftyne-muted border border-giftyne-sand/60 font-body text-sm text-giftyne-text">
              {t}
              <button onClick={() => removeTicker(t)} className="text-giftyne-text/50 hover:text-giftyne-terra"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-giftyne-text/35" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTicker())}
              placeholder="Add ticker"
              className="w-full pl-9 pr-3 py-2.5 rounded-full border border-giftyne-sand/60 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
            />
          </div>
          <button onClick={addTicker} disabled={tickers.length >= 4} className="px-4 rounded-full border border-giftyne-sand/60 bg-white text-giftyne-text/70 hover:border-giftyne-terra/40 transition-colors disabled:opacity-50">
            <Plus size={16} />
          </button>
          <PrimaryButton onClick={compare} disabled={loading || tickers.length < 2}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <GitCompare size={14} />}
            Compare
          </PrimaryButton>
        </div>
      </Card>

      {Object.keys(results).length === 0 ? (
        <Empty icon={GitCompare} title="No comparison yet" description="Pick at least 2 tickers and hit Compare." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-giftyne-sand/60">
                <th className="text-left font-body text-xs uppercase tracking-wider text-giftyne-text/45 px-4 py-3">Metric</th>
                {tickers.map((t) => (
                  <th key={t} className="text-left font-heading text-base font-semibold text-giftyne-text px-4 py-3">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-giftyne-sand/30 last:border-0">
                  <td className="px-4 py-3 font-body text-xs uppercase tracking-wider text-giftyne-text/55">{row.label}</td>
                  {tickers.map((t) => {
                    const r = results[t];
                    if (!r) return <td key={t} className="px-4 py-3 font-body text-sm text-giftyne-text/35">—</td>;
                    const tone = row.tone ? row.tone(r) : "default";
                    return (
                      <td key={t} className={`px-4 py-3 font-body text-sm ${tone === "up" ? "text-giftyne-sage" : tone === "down" ? "text-giftyne-terra" : "text-giftyne-text"}`}>
                        {row.get(r)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default CompareTab;
