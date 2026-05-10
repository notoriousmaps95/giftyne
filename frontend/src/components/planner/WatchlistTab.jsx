import { useState, useEffect, useCallback } from "react";
import { Star, Plus, Trash2, Search, Loader2 } from "lucide-react";
import { Watchlist, analyzeTicker } from "./api";
import { Card, SectionTitle, PrimaryButton, Empty, formatCurrency, formatPct } from "./shared";

const WatchlistTab = ({ currency, fxRate, onListUpdate }) => {
  const [items, setItems] = useState([]);
  const [enriched, setEnriched] = useState({});
  const [input, setInput] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await Watchlist.list();
      setItems(r.items || []);
      onListUpdate?.(r.items || []);
      // Fetch quotes in parallel.
      const map = {};
      await Promise.all((r.items || []).map(async (it) => {
        try { map[it.ticker] = (await analyzeTicker(it.ticker)).quote; } catch { /* ignore */ }
      }));
      setEnriched(map);
    } catch (e) { /* ignore */ } finally { setLoading(false); }
  }, [onListUpdate]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = async () => {
    const t = input.trim().toUpperCase();
    if (!t) return;
    setBusy(true);
    try { await Watchlist.add(t, note); setInput(""); setNote(""); await refresh(); }
    finally { setBusy(false); }
  };

  const remove = async (t) => { await Watchlist.remove(t); await refresh(); };

  return (
    <div className="space-y-6">
      <Card className="md:p-8">
        <SectionTitle icon={Star} title="Your watchlist" hint="Tickers you're tracking." />
        <div className="flex flex-wrap gap-2 max-w-2xl">
          <div className="relative flex-1 min-w-[160px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-giftyne-text/35" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
              placeholder="Add ticker"
              className="w-full pl-9 pr-3 py-2.5 rounded-full border border-giftyne-sand/60 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
            />
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="flex-1 min-w-[160px] px-3 py-2.5 rounded-full border border-giftyne-sand/60 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
          />
          <PrimaryButton onClick={add} disabled={busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </PrimaryButton>
        </div>
      </Card>

      {loading ? (
        <Empty icon={Loader2} title="Loading…" />
      ) : items.length === 0 ? (
        <Empty icon={Star} title="Watchlist is empty" description="Add tickers above and they'll show here with live quotes." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-giftyne-sand/60">
                <th className="text-left font-body text-xs uppercase tracking-wider text-giftyne-text/45 px-4 py-3">Ticker</th>
                <th className="text-left font-body text-xs uppercase tracking-wider text-giftyne-text/45 px-4 py-3">Name</th>
                <th className="text-right font-body text-xs uppercase tracking-wider text-giftyne-text/45 px-4 py-3">Price</th>
                <th className="text-right font-body text-xs uppercase tracking-wider text-giftyne-text/45 px-4 py-3">1d</th>
                <th className="text-right font-body text-xs uppercase tracking-wider text-giftyne-text/45 px-4 py-3">30d</th>
                <th className="text-left font-body text-xs uppercase tracking-wider text-giftyne-text/45 px-4 py-3">Note</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const q = enriched[it.ticker];
                return (
                  <tr key={it.ticker} className="border-b border-giftyne-sand/30 last:border-0">
                    <td className="px-4 py-3 font-heading text-sm font-semibold text-giftyne-text">{it.ticker}</td>
                    <td className="px-4 py-3 font-body text-sm text-giftyne-text/65">{q?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-body text-sm text-right text-giftyne-text">{q ? formatCurrency(q.current_price, currency, fxRate) : "…"}</td>
                    <td className={`px-4 py-3 font-body text-sm text-right ${q ? (q.change_1d_pct >= 0 ? "text-giftyne-sage" : "text-giftyne-terra") : ""}`}>{q ? formatPct(q.change_1d_pct) : ""}</td>
                    <td className={`px-4 py-3 font-body text-sm text-right ${q ? (q.change_30d_pct >= 0 ? "text-giftyne-sage" : "text-giftyne-terra") : ""}`}>{q ? formatPct(q.change_30d_pct) : ""}</td>
                    <td className="px-4 py-3 font-body text-xs text-giftyne-text/55">{it.note}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(it.ticker)} className="text-giftyne-text/50 hover:text-giftyne-terra"><Trash2 size={14} /></button>
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

export default WatchlistTab;
