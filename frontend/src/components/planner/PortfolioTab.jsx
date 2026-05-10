import { useState, useEffect, useCallback } from "react";
import { Briefcase, Plus, Trash2, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { Portfolio } from "./api";
import { Card, SectionTitle, PrimaryButton, KPI, Empty, formatCurrency, formatPct } from "./shared";

const PortfolioTab = ({ currency, fxRate }) => {
  const [data, setData] = useState({ holdings: [], summary: { total_cost: 0, total_value: 0, total_pl: 0, total_pl_pct: 0 } });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ticker: "", quantity: "", avg_cost: "" });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setData(await Portfolio.list()); } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = async () => {
    if (!form.ticker || !form.quantity || !form.avg_cost) return;
    setBusy(true);
    try {
      await Portfolio.add({
        ticker: form.ticker.toUpperCase(),
        quantity: parseFloat(form.quantity),
        avg_cost: parseFloat(form.avg_cost),
      });
      setForm({ ticker: "", quantity: "", avg_cost: "" });
      await refresh();
    } finally { setBusy(false); }
  };

  const remove = async (t) => { await Portfolio.remove(t); await refresh(); };

  const s = data.summary;
  const positive = s.total_pl >= 0;

  return (
    <div className="space-y-6">
      <Card className="md:p-8">
        <SectionTitle icon={Briefcase} title="Portfolio" hint="Track holdings, cost basis and unrealised P&amp;L." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KPI label="Total value" value={formatCurrency(s.total_value, currency, fxRate)} />
          <KPI label="Total cost" value={formatCurrency(s.total_cost, currency, fxRate)} />
          <KPI label="Unrealised P&L" value={formatCurrency(s.total_pl, currency, fxRate)} tone={positive ? "up" : "down"} />
          <KPI label="Return %" value={formatPct(s.total_pl_pct)} tone={positive ? "up" : "down"} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-3xl">
          <input
            value={form.ticker}
            onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
            placeholder="Ticker"
            className="px-3 py-2.5 rounded-full border border-giftyne-sand/60 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
          />
          <input
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="Quantity"
            type="number" step="any"
            className="px-3 py-2.5 rounded-full border border-giftyne-sand/60 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
          />
          <input
            value={form.avg_cost}
            onChange={(e) => setForm({ ...form, avg_cost: e.target.value })}
            placeholder="Avg cost"
            type="number" step="any"
            className="px-3 py-2.5 rounded-full border border-giftyne-sand/60 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
          />
          <PrimaryButton onClick={add} disabled={busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add holding
          </PrimaryButton>
        </div>
      </Card>

      {loading ? (
        <Empty icon={Loader2} title="Loading…" />
      ) : data.holdings.length === 0 ? (
        <Empty icon={Briefcase} title="No holdings yet" description="Add a holding above to start tracking your portfolio." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-giftyne-sand/60">
                <th className="text-left font-body text-xs uppercase tracking-wider text-giftyne-text/45 px-4 py-3">Ticker</th>
                <th className="text-right font-body text-xs uppercase tracking-wider text-giftyne-text/45 px-4 py-3">Qty</th>
                <th className="text-right font-body text-xs uppercase tracking-wider text-giftyne-text/45 px-4 py-3">Avg cost</th>
                <th className="text-right font-body text-xs uppercase tracking-wider text-giftyne-text/45 px-4 py-3">Price</th>
                <th className="text-right font-body text-xs uppercase tracking-wider text-giftyne-text/45 px-4 py-3">Value</th>
                <th className="text-right font-body text-xs uppercase tracking-wider text-giftyne-text/45 px-4 py-3">P&L</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.holdings.map((h) => {
                const positive = h.unrealized_pl >= 0;
                return (
                  <tr key={h.ticker} className="border-b border-giftyne-sand/30 last:border-0">
                    <td className="px-4 py-3 font-heading text-sm font-semibold text-giftyne-text">{h.ticker}</td>
                    <td className="px-4 py-3 font-body text-sm text-right text-giftyne-text">{h.quantity}</td>
                    <td className="px-4 py-3 font-body text-sm text-right text-giftyne-text">{formatCurrency(h.avg_cost, currency, fxRate)}</td>
                    <td className="px-4 py-3 font-body text-sm text-right text-giftyne-text">{formatCurrency(h.current_price, currency, fxRate)}</td>
                    <td className="px-4 py-3 font-body text-sm text-right text-giftyne-text">{formatCurrency(h.market_value, currency, fxRate)}</td>
                    <td className={`px-4 py-3 font-body text-sm text-right ${positive ? "text-giftyne-sage" : "text-giftyne-terra"}`}>
                      <span className="inline-flex items-center gap-1">
                        {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {formatCurrency(h.unrealized_pl, currency, fxRate)} ({formatPct(h.unrealized_pl_pct)})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(h.ticker)} className="text-giftyne-text/50 hover:text-giftyne-terra"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default PortfolioTab;
