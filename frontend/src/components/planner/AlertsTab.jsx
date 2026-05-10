import { useState, useEffect, useCallback } from "react";
import { Bell, Plus, Trash2, RefreshCw, Loader2, CheckCircle2, Clock } from "lucide-react";
import { Alerts } from "./api";
import { Card, SectionTitle, PrimaryButton, Empty } from "./shared";

const AlertsTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ ticker: "", condition: "above", price: "" });
  const [lastCheck, setLastCheck] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setItems((await Alerts.list()).items || []); } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = async () => {
    if (!form.ticker || !form.price) return;
    setBusy(true);
    try {
      await Alerts.add({ ticker: form.ticker.toUpperCase(), condition: form.condition, price: parseFloat(form.price) });
      setForm({ ticker: "", condition: "above", price: "" });
      await refresh();
    } finally { setBusy(false); }
  };

  const remove = async (id) => { await Alerts.remove(id); await refresh(); };

  const checkNow = async () => {
    setBusy(true);
    try {
      const r = await Alerts.check();
      setLastCheck(r);
      await refresh();
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <Card className="md:p-8">
        <SectionTitle
          icon={Bell}
          title="Price alerts"
          hint="Get a flag when a stock crosses a threshold."
          action={
            <button onClick={checkNow} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-giftyne-sand/60 text-sm font-body text-giftyne-text/70 hover:border-giftyne-terra/40">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Check now
            </button>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-3xl">
          <input
            value={form.ticker}
            onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
            placeholder="Ticker"
            className="px-3 py-2.5 rounded-full border border-giftyne-sand/60 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
          />
          <select
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            className="px-3 py-2.5 rounded-full border border-giftyne-sand/60 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
          >
            <option value="above">Goes above</option>
            <option value="below">Goes below</option>
          </select>
          <input
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Price"
            type="number" step="any"
            className="px-3 py-2.5 rounded-full border border-giftyne-sand/60 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
          />
          <PrimaryButton onClick={add} disabled={busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add alert
          </PrimaryButton>
        </div>

        {lastCheck && (
          <p className="mt-4 font-body text-xs text-giftyne-text/55">
            Checked {lastCheck.checked} alert(s){lastCheck.triggered.length ? ` — ${lastCheck.triggered.length} triggered.` : "."}
          </p>
        )}
      </Card>

      {loading ? (
        <Empty icon={Loader2} title="Loading…" />
      ) : items.length === 0 ? (
        <Empty icon={Bell} title="No alerts yet" description="Add one above to be notified when a price crosses your threshold." />
      ) : (
        <Card>
          <ul className="divide-y divide-giftyne-sand/40">
            {items.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {a.triggered ? <CheckCircle2 size={16} className="text-giftyne-sage" /> : <Clock size={16} className="text-giftyne-text/40" />}
                  <div>
                    <p className="font-heading text-sm font-semibold text-giftyne-text">
                      {a.ticker} {a.condition} {a.price}
                    </p>
                    <p className="font-body text-xs text-giftyne-text/45">
                      {a.triggered ? `Triggered at ${a.triggered_price}` : "Pending"} · created {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button onClick={() => remove(a.id)} className="text-giftyne-text/40 hover:text-giftyne-terra"><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default AlertsTab;
