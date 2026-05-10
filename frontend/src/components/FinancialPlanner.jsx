import { useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Wallet,
  ShieldAlert,
  Target,
  Clock3,
  ArrowLeft,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Link } from "react-router-dom";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

const POPULAR = ["AAPL", "MSFT", "NVDA", "GOOGL", "TSLA", "AMZN", "INFY", "RELIANCE"];

const formatCurrency = (n, currency = "USD") => {
  if (n === null || n === undefined) return "—";
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
};

const formatPct = (n, digits = 2) => {
  if (n === null || n === undefined) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
};

const verdictStyles = {
  Buy: "bg-giftyne-sage/15 text-giftyne-sage border-giftyne-sage/30",
  Accumulate: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Hold: "bg-amber-50 text-amber-700 border-amber-200",
  Reduce: "bg-orange-50 text-orange-700 border-orange-200",
  Sell: "bg-red-50 text-red-700 border-red-200",
};

const KPI = ({ label, value, sub, tone = "default" }) => (
  <div className="rounded-2xl bg-white border border-giftyne-sand/60 p-4">
    <p className="font-body text-[11px] uppercase tracking-wider text-giftyne-text/40 mb-1">{label}</p>
    <p
      className={`font-heading text-xl font-semibold ${
        tone === "up" ? "text-giftyne-sage" : tone === "down" ? "text-giftyne-terra" : "text-giftyne-text"
      }`}
    >
      {value}
    </p>
    {sub && <p className="font-body text-[11px] text-giftyne-text/50 mt-0.5">{sub}</p>}
  </div>
);

const SectionTitle = ({ icon: Icon, title, hint }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="w-9 h-9 rounded-xl bg-giftyne-terra/10 text-giftyne-terra flex items-center justify-center">
      <Icon size={18} />
    </span>
    <div>
      <h3 className="font-heading text-xl font-semibold text-giftyne-text leading-none">{title}</h3>
      {hint && <p className="font-body text-xs text-giftyne-text/50 mt-1">{hint}</p>}
    </div>
  </div>
);

const HorizonCard = ({ plan, label, accent }) => {
  const verdictClass = verdictStyles[plan.verdict] || verdictStyles.Hold;
  const isPositive = plan.expected_return_pct >= 0;
  return (
    <div className="rounded-3xl border border-giftyne-sand/70 bg-white p-6 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="font-accent text-base text-giftyne-terra">{label}</span>
          <h4 className="font-heading text-2xl font-bold text-giftyne-text leading-tight">{plan.horizon}</h4>
        </div>
        <span className={`px-3 py-1 rounded-full border font-body text-xs font-semibold ${verdictClass}`}>
          {plan.verdict}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-giftyne-muted/60 rounded-2xl p-3">
          <p className="font-body text-[10px] uppercase tracking-wider text-giftyne-text/45">Entry zone</p>
          <p className="font-heading text-sm font-semibold text-giftyne-text">
            {plan.entry_zone[0]} – {plan.entry_zone[1]}
          </p>
        </div>
        <div className="bg-giftyne-muted/60 rounded-2xl p-3">
          <p className="font-body text-[10px] uppercase tracking-wider text-giftyne-text/45">Target</p>
          <p className="font-heading text-sm font-semibold text-giftyne-sage">{plan.target_price}</p>
        </div>
        <div className="bg-giftyne-muted/60 rounded-2xl p-3">
          <p className="font-body text-[10px] uppercase tracking-wider text-giftyne-text/45">Stop loss</p>
          <p className="font-heading text-sm font-semibold text-giftyne-terra">{plan.stop_loss}</p>
        </div>
        <div className="bg-giftyne-muted/60 rounded-2xl p-3">
          <p className="font-body text-[10px] uppercase tracking-wider text-giftyne-text/45">Expected return</p>
          <p
            className={`font-heading text-sm font-semibold ${
              isPositive ? "text-giftyne-sage" : "text-giftyne-terra"
            }`}
          >
            {formatPct(plan.expected_return_pct)}
          </p>
        </div>
      </div>

      <div className="flex-1">
        <p className="font-body text-[11px] uppercase tracking-wider text-giftyne-text/45 mb-2">Why</p>
        <ul className="space-y-2">
          {plan.rationale.map((reason, i) => (
            <li key={i} className="font-body text-sm text-giftyne-text/75 leading-relaxed flex gap-2">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${accent}`} />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 pt-4 border-t border-giftyne-sand/60 flex items-center justify-between">
        <span className="font-body text-xs text-giftyne-text/55">Suggested portfolio allocation</span>
        <span className="font-heading text-base font-semibold text-giftyne-text">
          {plan.suggested_allocation_pct}%
        </span>
      </div>
    </div>
  );
};

const FinancialPlanner = () => {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runAnalysis = useCallback(async (sym) => {
    const symbol = (sym || "").trim().toUpperCase();
    if (!symbol) {
      setError("Enter a stock ticker, e.g. AAPL.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/financial/analyze/${encodeURIComponent(symbol)}`);
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Could not fetch analysis. Try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    runAnalysis(ticker);
  };

  const tech = data?.technicals;
  const fin = data?.financials;
  const bal = data?.balance_sheet;

  return (
    <div data-testid="financial-planner" className="min-h-screen bg-giftyne-bg">
      {/* Header */}
      <header className="border-b border-giftyne-sand/60 bg-giftyne-bg/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            to="/"
            data-testid="planner-home-link"
            className="inline-flex items-center gap-2 font-body text-sm font-medium text-giftyne-text/60 hover:text-giftyne-terra transition-colors"
          >
            <ArrowLeft size={16} /> Giftyne
          </Link>
          <div className="text-center">
            <span className="font-accent text-sm text-giftyne-terra">your money matters</span>
            <h1 className="font-heading text-2xl font-bold text-giftyne-text leading-none">
              Financial Planner
            </h1>
          </div>
          <div className="w-[80px]" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero / Search */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-giftyne-sand/60 rounded-3xl p-6 md:p-10 shadow-[0_4px_20px_-2px_rgba(198,108,73,0.08)]"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-giftyne-sage/10 border border-giftyne-sage/20 mb-4">
                <Sparkles size={14} className="text-giftyne-sage" />
                <span className="font-body text-xs font-medium text-giftyne-sage">AI-powered analysis</span>
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-giftyne-text mb-3 leading-tight">
                Analyse a stock and get a{" "}
                <span className="text-giftyne-terra italic">tailored investment plan</span>.
              </h2>
              <p className="font-body text-sm text-giftyne-text/60 leading-relaxed">
                Enter any ticker symbol — we&apos;ll run the trend, technicals, financials and balance sheet,
                then build a short‑term and long‑term plan with entry, target and stop‑loss.
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              data-testid="planner-form"
              className="bg-giftyne-muted/60 rounded-2xl p-5 border border-giftyne-sand/60"
            >
              <label className="font-body text-xs uppercase tracking-wider text-giftyne-text/45 mb-2 block">
                Ticker symbol
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-giftyne-text/35"
                  />
                  <input
                    data-testid="planner-ticker-input"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    placeholder="e.g. AAPL, MSFT, RELIANCE"
                    className="w-full pl-9 pr-3 py-3 rounded-full border border-giftyne-sand/60 bg-white font-body text-sm text-giftyne-text placeholder:text-giftyne-text/35 focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
                  />
                </div>
                <button
                  data-testid="planner-analyze-btn"
                  type="submit"
                  disabled={loading}
                  className="bg-giftyne-terra text-white font-body font-semibold text-sm px-6 py-3 rounded-full hover:bg-giftyne-terra/90 disabled:opacity-60 transition-all inline-flex items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
                  Analyse
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {POPULAR.map((t) => (
                  <button
                    key={t}
                    type="button"
                    data-testid={`planner-quick-${t}`}
                    onClick={() => {
                      setTicker(t);
                      runAnalysis(t);
                    }}
                    className="text-[11px] font-body font-medium px-2.5 py-1 rounded-full border border-giftyne-sand/70 text-giftyne-text/65 hover:border-giftyne-terra/40 hover:text-giftyne-terra transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
              {error && (
                <p data-testid="planner-error" className="mt-3 font-body text-xs text-giftyne-terra">
                  {error}
                </p>
              )}
            </form>
          </div>
        </motion.section>

        {/* Results */}
        <AnimatePresence mode="wait">
          {data && (
            <motion.div
              key={data.quote.ticker}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mt-10 space-y-10"
            >
              {/* Quote header */}
              <section
                data-testid="planner-quote"
                className="bg-white border border-giftyne-sand/60 rounded-3xl p-6 md:p-8"
              >
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                  <div>
                    <span className="font-body text-xs uppercase tracking-wider text-giftyne-text/45">
                      {data.quote.sector}
                    </span>
                    <h3 className="font-heading text-3xl md:text-4xl font-bold text-giftyne-text leading-tight">
                      {data.quote.name}
                    </h3>
                    <p className="font-body text-sm text-giftyne-text/55">
                      {data.quote.ticker}
                      {data.synthetic && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          synthetic data
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-end gap-6">
                    <div>
                      <p className="font-body text-[11px] uppercase tracking-wider text-giftyne-text/45">
                        Current price
                      </p>
                      <p className="font-heading text-4xl font-bold text-giftyne-text">
                        ${data.quote.current_price}
                      </p>
                    </div>
                    <div className="text-right pb-1">
                      <p
                        className={`inline-flex items-center gap-1 font-heading text-base font-semibold ${
                          data.quote.change_1d >= 0 ? "text-giftyne-sage" : "text-giftyne-terra"
                        }`}
                      >
                        {data.quote.change_1d >= 0 ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                        {formatPct(data.quote.change_1d_pct)} today
                      </p>
                      <p className="font-body text-xs text-giftyne-text/55 mt-0.5">
                        30d {formatPct(data.quote.change_30d_pct)} · 90d{" "}
                        {formatPct(data.quote.change_90d_pct)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Trend chart */}
              <section
                data-testid="planner-trend"
                className="bg-white border border-giftyne-sand/60 rounded-3xl p-6 md:p-8"
              >
                <SectionTitle
                  icon={Activity}
                  title="Current trend (90 days)"
                  hint="Daily closing price with 50-day moving average overlay."
                />
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.price_history.map((p) => ({
                        ...p,
                        sma50: tech.sma_50,
                      }))}
                      margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
                    >
                      <CartesianGrid stroke="#E6D5B8" strokeDasharray="3 3" opacity={0.5} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "#2D2A26" }}
                        tickFormatter={(v) =>
                          new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        }
                        minTickGap={32}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#2D2A26" }}
                        domain={["auto", "auto"]}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#FFFFFF",
                          border: "1px solid #E6D5B8",
                          borderRadius: 12,
                          fontFamily: "Manrope",
                          fontSize: 12,
                        }}
                        labelFormatter={(v) =>
                          new Date(v).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        }
                        formatter={(v) => [`$${v}`, "Close"]}
                      />
                      <ReferenceLine
                        y={tech.sma_50}
                        stroke="#7D8F69"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={{
                          value: `SMA 50 ($${tech.sma_50})`,
                          fill: "#7D8F69",
                          fontSize: 10,
                          position: "right",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="close"
                        stroke="#C66C49"
                        strokeWidth={2.2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Financials + Balance sheet + Technicals */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div
                  data-testid="planner-financials"
                  className="bg-white border border-giftyne-sand/60 rounded-3xl p-6"
                >
                  <SectionTitle icon={BarChart3} title="Financial data" />
                  <div className="grid grid-cols-2 gap-3">
                    <KPI label="Market cap" value={formatCurrency(fin.market_cap)} />
                    <KPI label="Revenue (TTM)" value={formatCurrency(fin.revenue_ttm)} />
                    <KPI label="Net income" value={formatCurrency(fin.net_income_ttm)} />
                    <KPI label="EPS" value={`$${fin.eps_ttm.toFixed(2)}`} />
                    <KPI
                      label="P/E ratio"
                      value={fin.pe_ratio ? fin.pe_ratio.toFixed(2) : "—"}
                      sub={fin.pe_ratio < 18 ? "Attractive" : fin.pe_ratio > 45 ? "Rich" : "Reasonable"}
                    />
                    <KPI
                      label="Revenue growth"
                      value={formatPct(fin.revenue_growth_yoy * 100)}
                      tone={fin.revenue_growth_yoy >= 0 ? "up" : "down"}
                    />
                    <KPI label="Profit margin" value={formatPct(fin.profit_margin * 100)} />
                    <KPI
                      label="Dividend yield"
                      value={fin.dividend_yield > 0 ? formatPct(fin.dividend_yield * 100) : "None"}
                    />
                    <KPI label="Beta" value={fin.beta.toFixed(2)} />
                    <KPI
                      label="Shares out."
                      value={formatCurrency(fin.shares_outstanding).replace("$", "")}
                    />
                  </div>
                </div>

                <div
                  data-testid="planner-balance-sheet"
                  className="bg-white border border-giftyne-sand/60 rounded-3xl p-6"
                >
                  <SectionTitle icon={Wallet} title="Balance sheet" />
                  <div className="grid grid-cols-2 gap-3">
                    <KPI label="Cash" value={formatCurrency(bal.cash_and_equivalents)} tone="up" />
                    <KPI label="Total debt" value={formatCurrency(bal.total_debt)} tone="down" />
                    <KPI label="Total assets" value={formatCurrency(bal.total_assets)} />
                    <KPI label="Total liabilities" value={formatCurrency(bal.total_liabilities)} />
                    <KPI label="Equity" value={formatCurrency(bal.shareholders_equity)} />
                    <KPI
                      label="Debt / Equity"
                      value={bal.debt_to_equity ? bal.debt_to_equity.toFixed(2) : "—"}
                      sub={
                        bal.debt_to_equity < 0.6
                          ? "Conservative"
                          : bal.debt_to_equity > 1.5
                          ? "Stretched"
                          : "Balanced"
                      }
                    />
                    <KPI
                      label="Current ratio"
                      value={bal.current_ratio ? bal.current_ratio.toFixed(2) : "—"}
                      sub={
                        bal.current_ratio >= 1.5
                          ? "Strong"
                          : bal.current_ratio >= 1
                          ? "Adequate"
                          : "Weak"
                      }
                    />
                    <KPI label="Long-term debt" value={formatCurrency(bal.long_term_debt)} />
                  </div>
                </div>

                <div
                  data-testid="planner-technicals"
                  className="bg-white border border-giftyne-sand/60 rounded-3xl p-6"
                >
                  <SectionTitle icon={Activity} title="Technical analysis" />
                  <div className="grid grid-cols-2 gap-3">
                    <KPI
                      label="Trend"
                      value={tech.trend.toUpperCase()}
                      tone={
                        tech.trend === "uptrend"
                          ? "up"
                          : tech.trend === "downtrend"
                          ? "down"
                          : "default"
                      }
                    />
                    <KPI
                      label="RSI (14)"
                      value={tech.rsi_14 ?? "—"}
                      sub={
                        tech.rsi_14 == null
                          ? null
                          : tech.rsi_14 > 70
                          ? "Overbought"
                          : tech.rsi_14 < 30
                          ? "Oversold"
                          : "Neutral"
                      }
                      tone={
                        tech.rsi_14 == null
                          ? "default"
                          : tech.rsi_14 > 70
                          ? "down"
                          : tech.rsi_14 < 30
                          ? "up"
                          : "default"
                      }
                    />
                    <KPI label="SMA 20" value={tech.sma_20 ?? "—"} />
                    <KPI label="SMA 50" value={tech.sma_50 ?? "—"} />
                    <KPI label="SMA 200" value={tech.sma_200 ?? "—"} />
                    <KPI
                      label="MACD"
                      value={tech.macd ?? "—"}
                      sub={
                        tech.macd != null && tech.macd_signal != null
                          ? tech.macd > tech.macd_signal
                            ? "Bullish crossover"
                            : "Bearish crossover"
                          : null
                      }
                      tone={
                        tech.macd != null && tech.macd_signal != null
                          ? tech.macd > tech.macd_signal
                            ? "up"
                            : "down"
                          : "default"
                      }
                    />
                    <KPI label="52w high" value={`$${tech.high_52w}`} />
                    <KPI label="52w low" value={`$${tech.low_52w}`} />
                    <KPI
                      label="Vs 200-SMA"
                      value={tech.above_sma_200 ? "Above" : "Below"}
                      tone={tech.above_sma_200 ? "up" : "down"}
                    />
                  </div>
                </div>
              </section>

              {/* Recommendation */}
              <section
                data-testid="planner-recommendation"
                className="bg-giftyne-text text-white rounded-3xl p-6 md:p-10 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                  <div>
                    <span className="font-accent text-base text-giftyne-terra">your plan</span>
                    <h3 className="font-heading text-3xl md:text-4xl font-bold leading-tight">
                      Investment recommendation
                    </h3>
                    <p className="font-body text-sm text-white/55 max-w-xl mt-1">
                      Combined view of trend, momentum, valuation and balance‑sheet health for{" "}
                      {data.quote.ticker}.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15">
                      <ShieldAlert size={14} className="text-giftyne-terra" />
                      <span className="font-body text-xs">
                        Risk: <span className="font-semibold">{data.recommendation.risk_level}</span>
                      </span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-giftyne-text">
                  <HorizonCard
                    plan={data.recommendation.short_term}
                    label="Short term"
                    accent="bg-giftyne-terra"
                  />
                  <HorizonCard
                    plan={data.recommendation.long_term}
                    label="Long term"
                    accent="bg-giftyne-sage"
                  />
                </div>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 text-white/60">
                  <Clock3 size={14} />
                  <p className="font-body text-xs leading-relaxed">{data.disclaimer}</p>
                </div>
              </section>
            </motion.div>
          )}

          {!data && !loading && (
            <motion.section
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {[
                {
                  icon: Activity,
                  title: "Trend & technicals",
                  desc: "Moving averages, RSI and MACD identify momentum and trend direction.",
                },
                {
                  icon: BarChart3,
                  title: "Financials",
                  desc: "Earnings, growth, margins and valuation metrics — the quality of the business.",
                },
                {
                  icon: Target,
                  title: "Plan",
                  desc: "Entry zones, targets and stop‑loss for both short and long horizons.",
                },
              ].map((it) => (
                <div
                  key={it.title}
                  className="bg-white border border-giftyne-sand/60 rounded-3xl p-6"
                >
                  <span className="w-10 h-10 rounded-xl bg-giftyne-terra/10 text-giftyne-terra flex items-center justify-center mb-3">
                    <it.icon size={18} />
                  </span>
                  <h4 className="font-heading text-lg font-semibold text-giftyne-text mb-1">
                    {it.title}
                  </h4>
                  <p className="font-body text-sm text-giftyne-text/55 leading-relaxed">{it.desc}</p>
                </div>
              ))}
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default FinancialPlanner;
