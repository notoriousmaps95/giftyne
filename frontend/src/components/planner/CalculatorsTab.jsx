import { useMemo, useState } from "react";
import { Calculator, Target, PiggyBank, Receipt } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, SectionTitle, KPI, formatCurrency } from "./shared";

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="font-body text-xs uppercase tracking-wider text-giftyne-text/45 mb-1 block">{label}</span>
    <input
      className="w-full px-3 py-2.5 rounded-xl border border-giftyne-sand/60 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
      {...props}
    />
  </label>
);

const sipCalc = (monthly, annualPct, years) => {
  const n = Math.round(years * 12);
  const r = annualPct / 100 / 12;
  let bal = 0; const schedule = [];
  for (let m = 1; m <= n; m++) {
    bal = (bal + monthly) * (1 + r);
    if (m % 12 === 0) schedule.push({ year: m / 12, balance: Math.round(bal), invested: Math.round(monthly * m) });
  }
  const future = bal;
  const invested = monthly * n;
  return { future, invested, gained: future - invested, schedule };
};

const lumpSumCalc = (amount, annualPct, years) => {
  const r = annualPct / 100;
  const future = amount * Math.pow(1 + r, years);
  const schedule = [];
  for (let y = 1; y <= years; y++) {
    schedule.push({ year: y, balance: Math.round(amount * Math.pow(1 + r, y)), invested: amount });
  }
  return { future, invested: amount, gained: future - amount, schedule };
};

const goalCalc = (target, years, annualPct, current) => {
  const n = Math.round(years * 12);
  const r = annualPct / 100 / 12;
  const fvExisting = current * Math.pow(1 + r, n);
  const needed = Math.max(target - fvExisting, 0);
  const monthly = r === 0 ? needed / n : needed / ((((Math.pow(1 + r, n) - 1) / r)) * (1 + r));
  return { monthly, fvExisting, needed };
};

const taxCalc = ({ purchase, sale, qty, months, region }) => {
  const gain = (sale - purchase) * qty;
  let tax = 0; let label = "";
  if (region === "IN") {
    if (months >= 12) {
      const exempt = 100000;
      tax = Math.max(gain - exempt, 0) * 0.10;
      label = "LTCG (India, equity)";
    } else {
      tax = Math.max(gain, 0) * 0.15;
      label = "STCG (India, equity)";
    }
  } else {
    if (months >= 12) { tax = Math.max(gain, 0) * 0.15; label = "Long-term capital gains (US)"; }
    else { tax = Math.max(gain, 0) * 0.24; label = "Short-term capital gains (US, est.)"; }
  }
  return { gain, tax, net: gain - tax, label };
};

const SipCard = ({ currency, fxRate }) => {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const result = useMemo(() => sipCalc(parseFloat(monthly) || 0, parseFloat(rate) || 0, parseFloat(years) || 0), [monthly, rate, years]);

  return (
    <Card>
      <SectionTitle icon={PiggyBank} title="SIP / monthly investment" hint="Disciplined monthly contributions and compound growth." />
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Field label="Monthly amount" type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        <Field label="Annual return %" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        <Field label="Years" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <KPI label="Future value" value={formatCurrency(result.future, currency, fxRate)} tone="up" />
        <KPI label="Invested" value={formatCurrency(result.invested, currency, fxRate)} />
        <KPI label="Wealth gained" value={formatCurrency(result.gained, currency, fxRate)} tone="up" />
      </div>
      <div className="h-56">
        <ResponsiveContainer>
          <AreaChart data={result.schedule}>
            <CartesianGrid stroke="#E6D5B8" strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#2D2A26" }} />
            <YAxis tick={{ fontSize: 11, fill: "#2D2A26" }} tickFormatter={(v) => `${currency === "INR" ? "₹" : "$"}${(v * fxRate / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(v, currency, fxRate)} contentStyle={{ borderRadius: 12, border: "1px solid #E6D5B8" }} />
            <Area type="monotone" dataKey="balance" stroke="#C66C49" fill="#C66C49" fillOpacity={0.18} />
            <Area type="monotone" dataKey="invested" stroke="#7D8F69" fill="#7D8F69" fillOpacity={0.10} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const LumpCard = ({ currency, fxRate }) => {
  const [amt, setAmt] = useState(100000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(10);
  const r = useMemo(() => lumpSumCalc(parseFloat(amt) || 0, parseFloat(rate) || 0, parseFloat(years) || 0), [amt, rate, years]);
  return (
    <Card>
      <SectionTitle icon={Calculator} title="Lump-sum investment" hint="One-time investment growth." />
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Field label="Amount" type="number" value={amt} onChange={(e) => setAmt(e.target.value)} />
        <Field label="Annual return %" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        <Field label="Years" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <KPI label="Future value" value={formatCurrency(r.future, currency, fxRate)} tone="up" />
        <KPI label="Invested" value={formatCurrency(r.invested, currency, fxRate)} />
        <KPI label="Wealth gained" value={formatCurrency(r.gained, currency, fxRate)} tone="up" />
      </div>
    </Card>
  );
};

const GoalCard = ({ currency, fxRate }) => {
  const [target, setTarget] = useState(10000000);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);
  const [current, setCurrent] = useState(0);
  const r = useMemo(() => goalCalc(parseFloat(target) || 0, parseFloat(years) || 0, parseFloat(rate) || 0, parseFloat(current) || 0), [target, years, rate, current]);
  return (
    <Card>
      <SectionTitle icon={Target} title="Goal-based plan" hint="How much should you invest monthly to hit a target?" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Field label="Target amount" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
        <Field label="Years" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
        <Field label="Annual return %" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        <Field label="Current corpus" type="number" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <KPI label="Monthly required" value={formatCurrency(r.monthly, currency, fxRate)} tone="up" />
        <KPI label="FV of current corpus" value={formatCurrency(r.fvExisting, currency, fxRate)} />
        <KPI label="Shortfall to fund" value={formatCurrency(r.needed, currency, fxRate)} />
      </div>
    </Card>
  );
};

const TaxCard = ({ currency, fxRate }) => {
  const [purchase, setPurchase] = useState(1000);
  const [sale, setSale] = useState(1500);
  const [qty, setQty] = useState(100);
  const [months, setMonths] = useState(18);
  const [region, setRegion] = useState("IN");
  const r = useMemo(() => taxCalc({ purchase: +purchase || 0, sale: +sale || 0, qty: +qty || 0, months: +months || 0, region }), [purchase, sale, qty, months, region]);
  return (
    <Card>
      <SectionTitle icon={Receipt} title="Capital gains tax" hint="India (LTCG/STCG, equity) or US estimate." />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <Field label="Purchase price" type="number" value={purchase} onChange={(e) => setPurchase(e.target.value)} />
        <Field label="Sale price" type="number" value={sale} onChange={(e) => setSale(e.target.value)} />
        <Field label="Quantity" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
        <Field label="Holding (months)" type="number" value={months} onChange={(e) => setMonths(e.target.value)} />
        <label className="block">
          <span className="font-body text-xs uppercase tracking-wider text-giftyne-text/45 mb-1 block">Region</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-giftyne-sand/60 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30">
            <option value="IN">India</option>
            <option value="US">United States</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <KPI label="Gross gain" value={formatCurrency(r.gain, currency, fxRate)} />
        <KPI label="Tax" value={formatCurrency(r.tax, currency, fxRate)} sub={r.label} tone="down" />
        <KPI label="Net gain" value={formatCurrency(r.net, currency, fxRate)} tone="up" />
      </div>
    </Card>
  );
};

const CalculatorsTab = ({ currency, fxRate }) => (
  <div className="grid grid-cols-1 gap-6">
    <SipCard currency={currency} fxRate={fxRate} />
    <LumpCard currency={currency} fxRate={fxRate} />
    <GoalCard currency={currency} fxRate={fxRate} />
    <TaxCard currency={currency} fxRate={fxRate} />
  </div>
);

export default CalculatorsTab;
