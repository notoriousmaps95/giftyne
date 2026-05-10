import { useState } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { scoreRiskProfile } from "./api";
import { Card, SectionTitle, PrimaryButton, KPI } from "./shared";

const QUESTIONS = [
  { key: "age", label: "Your age", type: "number", min: 12, max: 100, default: 32 },
  { key: "horizon_years", label: "Investment horizon (years)", type: "number", min: 0, max: 60, default: 10 },
  { key: "income_stability", label: "Income stability", type: "select", options: [
    ["stable", "Stable salary"], ["variable", "Variable / freelance"], ["unstable", "Unstable / between jobs"]
  ], default: "stable" },
  { key: "loss_tolerance", label: "Comfort with short-term losses", type: "select", options: [
    ["low", "Low — protect capital"], ["medium", "Medium — moderate swings"], ["high", "High — chase growth"]
  ], default: "medium" },
  { key: "investing_experience", label: "Investing experience", type: "select", options: [
    ["none", "None"], ["some", "Some"], ["experienced", "Experienced"]
  ], default: "some" },
  { key: "goal", label: "Primary goal", type: "select", options: [
    ["preservation", "Capital preservation"], ["balanced", "Balanced"], ["growth", "Growth"], ["aggressive_growth", "Aggressive growth"]
  ], default: "growth" },
];

const COLORS = ["#C66C49", "#7D8F69", "#E6D5B8", "#2D2A26"];

const RiskProfileTab = () => {
  const [answers, setAnswers] = useState(() => Object.fromEntries(QUESTIONS.map((q) => [q.key, q.default])));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const payload = { ...answers, age: +answers.age, horizon_years: +answers.horizon_years };
      setResult(await scoreRiskProfile(payload));
    } finally { setLoading(false); }
  };

  const data = result ? Object.entries(result.allocation).map(([k, v]) => ({ name: k, value: v })) : [];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="md:p-8">
        <SectionTitle icon={ShieldAlert} title="Risk profile" hint="Six quick questions to suggest an asset allocation." />
        <form onSubmit={submit} className="space-y-3">
          {QUESTIONS.map((q) => (
            <label key={q.key} className="block">
              <span className="font-body text-xs uppercase tracking-wider text-giftyne-text/45 mb-1 block">{q.label}</span>
              {q.type === "number" ? (
                <input
                  type="number" min={q.min} max={q.max} value={answers[q.key]}
                  onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-giftyne-sand/60 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
                />
              ) : (
                <select
                  value={answers[q.key]}
                  onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-giftyne-sand/60 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
                >
                  {q.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              )}
            </label>
          ))}
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
            Score my profile
          </PrimaryButton>
        </form>
      </Card>

      <Card className="md:p-8">
        <SectionTitle icon={ShieldAlert} title="Suggested allocation" hint={result ? `Profile: ${result.profile} (score ${result.score})` : "Submit the form to see your recommendation."} />
        {!result ? (
          <p className="font-body text-sm text-giftyne-text/55">Once you score your profile, we&apos;ll show a suggested mix of equity, debt, gold and cash.</p>
        ) : (
          <div className="space-y-5">
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label={(e) => `${e.name} ${e.value}%`}>
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(result.allocation).map(([k, v]) => (
                <KPI key={k} label={k} value={`${v}%`} />
              ))}
            </div>
            <p className="font-body text-sm text-giftyne-text/65 leading-relaxed">{result.guidance}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RiskProfileTab;
