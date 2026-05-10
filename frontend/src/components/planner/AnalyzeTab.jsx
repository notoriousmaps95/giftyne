import { useState, useEffect, useCallback } from "react";
import {
  Search, Activity, BarChart3, Wallet, ShieldAlert, Loader2,
  TrendingUp, TrendingDown, Sparkles, Target, Clock3, Star, Bell, Printer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from "recharts";
import {
  analyzeTicker, fetchNews, fetchBenchmark, Watchlist, Alerts,
} from "./api";
import {
  KPI, SectionTitle, Card, PrimaryButton, formatCurrency, formatPct,
} from "./shared";

const POPULAR = ["AAPL", "MSFT", "NVDA", "GOOGL", "TSLA", "AMZN", "INFY", "RELIANCE"];

const verdictStyles = {
  Buy: "bg-giftyne-sage/15 text-giftyne-sage border-giftyne-sage/30",
  Accumulate: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Hold: "bg-amber-50 text-amber-700 border-amber-200",
  Reduce: "bg-orange-50 text-orange-700 border-orange-200",
  Sell: "bg-red-50 text-red-700 border-red-200",
};

const HorizonCard = ({ plan, label, accent, currency, fxRate }) => {
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
            {formatCurrency(plan.entry_zone[0], currency, fxRate)} – {formatCurrency(plan.entry_zone[1], currency, fxRate)}
          </p>
        </div>
        <div className="bg-giftyne-muted/60 rounded-2xl p-3">
          <p className="font-body text-[10px] uppercase tracking-wider text-giftyne-text/45">Target</p>
          <p className="font-heading text-sm font-semibold text-giftyne-sage">{formatCurrency(plan.target_price, currency, fxRate)}</p>
        </div>
        <div className="bg-giftyne-muted/60 rounded-2xl p-3">
          <p className="font-body text-[10px] uppercase tracking-wider text-giftyne-text/45">Stop loss</p>
          <p className="font-heading text-sm font-semibold text-giftyne-terra">{formatCurrency(plan.stop_loss, currency, fxRate)}</p>
        </div>
        <div className="bg-giftyne-muted/60 rounded-2xl p-3">
          <p className="font-body text-[10px] uppercase tracking-wider text-giftyne-text/45">Expected return</p>
          <p className={`font-heading text-sm font-semibold ${isPositive ? "text-giftyne-sage" : "text-giftyne-terra"}`}>
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
        <span className="font-body text-xs text-giftyne-text/55">Suggested allocation</span>
        <span className="font-heading text-base font-semibold text-giftyne-text">
          {plan.suggested_allocation_pct}%
        </span>
      </div>
    </div>
  );
};

const NewsCard = ({ items, source }) => (
  <Card>
    <SectionTitle
      icon={Sparkles}
      title="Latest news & sentiment"
      hint={source === "yfinance" ? "Live headlines from Yahoo Finance." : "Headlines (sample data)."}
    />
    {items.length === 0 ? (
      <p className="font-body text-sm text-giftyne-text/55">No news available.</p>
    ) : (
      <ul className="space-y-3">
        {items.map((n, i) => (
          <li key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-giftyne-muted/40">
            <span
              className={`mt-0.5 px-2 py-0.5 text-[10px] uppercase font-semibold rounded-full ${
                n.sentiment === "positive"
                  ? "bg-giftyne-sage/15 text-giftyne-sage"
                  : n.sentiment === "negative"
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {n.sentiment}
            </span>
            <div className="flex-1">
              {n.url ? (
                <a
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-body text-sm font-medium text-giftyne-text hover:text-giftyne-terra"
                >
                  {n.title}
                </a>
              ) : (
                <span className="font-body text-sm font-medium text-giftyne-text">{n.title}</span>
              )}
              <p className="font-body text-xs text-giftyne-text/45 mt-0.5">
                {n.publisher} · {new Date(n.published_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    )}
  </Card>
);

const BenchmarkCard = ({ benchmark }) => (
  <Card>
    <SectionTitle
      icon={Activity}
      title={`Benchmark: ${benchmark.benchmark_name}`}
      hint={`Indexed to 100 on day 0. ${benchmark.ticker} ${formatPct(benchmark.ticker_return_pct)} vs benchmark ${formatPct(benchmark.benchmark_return_pct)}.`}
    />
    <div className="h-60">
      <ResponsiveContainer>
        <LineChart
          data={benchmark.ticker_series.map((p, i) => ({
            date: p.date,
            ticker: p.value,
            benchmark: benchmark.benchmark_series[i]?.value,
          }))}
          margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
        >
          <CartesianGrid stroke="#E6D5B8" strokeDasharray="3 3" opacity={0.5} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#2D2A26" }}
            tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short" })}
            minTickGap={32}
          />
          <YAxis tick={{ fontSize: 10, fill: "#2D2A26" }} domain={["auto", "auto"]} />
          <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E6D5B8", borderRadius: 12, fontSize: 12 }} />
          <Line type="monotone" dataKey="ticker" stroke="#C66C49" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="benchmark" stroke="#7D8F69" strokeWidth={2} dot={false} strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const AnalyzeTab = ({ currency, fxRate, onWatch, watched }) => {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState(null);
  const [news, setNews] = useState(null);
  const [benchmark, setBenchmark] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alertSaving, setAlertSaving] = useState(false);

  const runAnalysis = useCallback(async (sym) => {
    const symbol = (sym || "").trim().toUpperCase();
    if (!symbol) { setError("Enter a stock ticker."); return; }
    setLoading(true); setError(""); setData(null); setNews(null); setBenchmark(null);
    try {
      const result = await analyzeTicker(symbol);
      setData(result);
      // Side requests; failures are non-fatal.
      fetchNews(symbol).then(setNews).catch(() => setNews({ items: [], source: "" }));
      fetchBenchmark(symbol).then(setBenchmark).catch(() => setBenchmark(null));
    } catch (e) {
      setError(e?.response?.data?.detail || "Could not fetch analysis.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onSubmit = (e) => { e.preventDefault(); runAnalysis(ticker); };

  const addAlert = async (cond, price) => {
    if (!data) return;
    setAlertSaving(true);
    try {
      await Alerts.add({ ticker: data.quote.ticker, condition: cond, price });
      window.dispatchEvent(new CustomEvent("planner-alert-added"));
    } catch (e) { /* ignore */ } finally { setAlertSaving(false); }
  };

  const tech = data?.technicals; const fin = data?.financials; const bal = data?.balance_sheet;
  const isWatched = data && watched.includes(data.quote.ticker);

  return (
    <div className="space-y-8">
      {/* Search */}
      <Card className="md:p-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-giftyne-sage/10 border border-giftyne-sage/20 mb-4">
              <Sparkles size={14} className="text-giftyne-sage" />
              <span className="font-body text-xs font-medium text-giftyne-sage">AI-powered analysis</span>
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-giftyne-text mb-3 leading-tight">
              Analyse a stock, get a <span className="text-giftyne-terra italic">tailored plan</span>.
            </h2>
            <p className="font-body text-sm text-giftyne-text/60 leading-relaxed">
              Enter a ticker — we run trend, technicals, fundamentals and balance‑sheet, then build a short‑term and long‑term plan with entry, target and stop‑loss.
            </p>
          </div>
          <form onSubmit={onSubmit} className="bg-giftyne-muted/60 rounded-2xl p-5 border border-giftyne-sand/60">
            <label className="font-body text-xs uppercase tracking-wider text-giftyne-text/45 mb-2 block">
              Ticker symbol
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-giftyne-text/35" />
                <input
                  data-testid="planner-ticker-input"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="e.g. AAPL, MSFT, RELIANCE"
                  className="w-full pl-9 pr-3 py-3 rounded-full border border-giftyne-sand/60 bg-white font-body text-sm text-giftyne-text placeholder:text-giftyne-text/35 focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30"
                />
              </div>
              <PrimaryButton type="submit" disabled={loading} data-testid="planner-analyze-btn">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
                Analyse
              </PrimaryButton>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {POPULAR.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => { setTicker(t); runAnalysis(t); }}
                  className="text-[11px] font-body font-medium px-2.5 py-1 rounded-full border border-giftyne-sand/70 text-giftyne-text/65 hover:border-giftyne-terra/40 hover:text-giftyne-terra transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
            {error && <p className="mt-3 font-body text-xs text-giftyne-terra">{error}</p>}
          </form>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {data && (
          <motion.div key={data.quote.ticker} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 print:space-y-4">
            {/* Quote */}
            <Card className="md:p-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <span className="font-body text-xs uppercase tracking-wider text-giftyne-text/45">{data.quote.sector}</span>
                  <h3 className="font-heading text-3xl md:text-4xl font-bold text-giftyne-text leading-tight">{data.quote.name}</h3>
                  <p className="font-body text-sm text-giftyne-text/55">
                    {data.quote.ticker}
                    <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-giftyne-muted text-giftyne-text/55 border border-giftyne-sand/60">
                      {data.data_source}
                    </span>
                  </p>
                </div>
                <div className="flex items-end gap-6">
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-wider text-giftyne-text/45">Current price</p>
                    <p className="font-heading text-4xl font-bold text-giftyne-text">{formatCurrency(data.quote.current_price, currency, fxRate)}</p>
                  </div>
                  <div className="text-right pb-1">
                    <p className={`inline-flex items-center gap-1 font-heading text-base font-semibold ${data.quote.change_1d >= 0 ? "text-giftyne-sage" : "text-giftyne-terra"}`}>
                      {data.quote.change_1d >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {formatPct(data.quote.change_1d_pct)} today
                    </p>
                    <p className="font-body text-xs text-giftyne-text/55 mt-0.5">
                      30d {formatPct(data.quote.change_30d_pct)} · 90d {formatPct(data.quote.change_90d_pct)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 print:hidden">
                <button
                  onClick={() => onWatch(data.quote.ticker)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-body transition-colors ${
                    isWatched
                      ? "bg-giftyne-terra/10 border-giftyne-terra/30 text-giftyne-terra"
                      : "border-giftyne-sand/60 text-giftyne-text/70 hover:border-giftyne-terra/40"
                  }`}
                >
                  <Star size={14} className={isWatched ? "fill-giftyne-terra" : ""} />
                  {isWatched ? "In watchlist" : "Add to watchlist"}
                </button>
                <button
                  disabled={alertSaving}
                  onClick={() => addAlert("above", Math.round(data.quote.current_price * 1.05 * 100) / 100)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-giftyne-sand/60 text-sm font-body text-giftyne-text/70 hover:border-giftyne-terra/40"
                >
                  <Bell size={14} /> Alert at +5%
                </button>
                <button
                  disabled={alertSaving}
                  onClick={() => addAlert("below", Math.round(data.quote.current_price * 0.95 * 100) / 100)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-giftyne-sand/60 text-sm font-body text-giftyne-text/70 hover:border-giftyne-terra/40"
                >
                  <Bell size={14} /> Alert at -5%
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-giftyne-sand/60 text-sm font-body text-giftyne-text/70 hover:border-giftyne-terra/40"
                >
                  <Printer size={14} /> Export PDF
                </button>
              </div>
            </Card>

            {/* Trend */}
            <Card className="md:p-8">
              <SectionTitle icon={Activity} title="Current trend (90 days)" hint="Daily close with 50-day SMA reference." />
              <div className="h-72">
                <ResponsiveContainer>
                  <LineChart data={data.price_history} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                    <CartesianGrid stroke="#E6D5B8" strokeDasharray="3 3" opacity={0.5} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#2D2A26" }}
                      tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      minTickGap={32}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#2D2A26" }} domain={["auto", "auto"]} tickFormatter={(v) => `${currency === "INR" ? "₹" : "$"}${(v * fxRate).toFixed(0)}`} />
                    <Tooltip
                      contentStyle={{ background: "#FFFFFF", border: "1px solid #E6D5B8", borderRadius: 12, fontSize: 12 }}
                      labelFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      formatter={(v) => [formatCurrency(v, currency, fxRate), "Close"]}
                    />
                    {tech?.sma_50 && (
                      <ReferenceLine y={tech.sma_50} stroke="#7D8F69" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `SMA 50`, fill: "#7D8F69", fontSize: 10, position: "right" }} />
                    )}
                    <Line type="monotone" dataKey="close" stroke="#C66C49" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Benchmark */}
            {benchmark && <BenchmarkCard benchmark={benchmark} />}

            {/* Financials/Balance/Tech grid */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <SectionTitle icon={BarChart3} title="Financial data" />
                <div className="grid grid-cols-2 gap-3">
                  <KPI label="Market cap" value={formatCurrency(fin.market_cap, currency, fxRate)} />
                  <KPI label="Revenue (TTM)" value={formatCurrency(fin.revenue_ttm, currency, fxRate)} />
                  <KPI label="Net income" value={formatCurrency(fin.net_income_ttm, currency, fxRate)} />
                  <KPI label="EPS" value={formatCurrency(fin.eps_ttm, currency, fxRate)} />
                  <KPI label="P/E ratio" value={fin.pe_ratio?.toFixed(2) ?? "—"} sub={fin.pe_ratio < 18 ? "Attractive" : fin.pe_ratio > 45 ? "Rich" : "Reasonable"} />
                  <KPI label="Revenue growth" value={formatPct(fin.revenue_growth_yoy * 100)} tone={fin.revenue_growth_yoy >= 0 ? "up" : "down"} />
                  <KPI label="Profit margin" value={formatPct(fin.profit_margin * 100)} />
                  <KPI label="Dividend yield" value={fin.dividend_yield > 0 ? formatPct(fin.dividend_yield * 100) : "None"} />
                  <KPI label="Beta" value={fin.beta.toFixed(2)} />
                  <KPI label="Shares out." value={fin.shares_outstanding.toLocaleString()} />
                </div>
              </Card>
              <Card>
                <SectionTitle icon={Wallet} title="Balance sheet" />
                <div className="grid grid-cols-2 gap-3">
                  <KPI label="Cash" value={formatCurrency(bal.cash_and_equivalents, currency, fxRate)} tone="up" />
                  <KPI label="Total debt" value={formatCurrency(bal.total_debt, currency, fxRate)} tone="down" />
                  <KPI label="Total assets" value={formatCurrency(bal.total_assets, currency, fxRate)} />
                  <KPI label="Total liabilities" value={formatCurrency(bal.total_liabilities, currency, fxRate)} />
                  <KPI label="Equity" value={formatCurrency(bal.shareholders_equity, currency, fxRate)} />
                  <KPI label="Debt / Equity" value={bal.debt_to_equity?.toFixed(2) ?? "—"} sub={bal.debt_to_equity < 0.6 ? "Conservative" : bal.debt_to_equity > 1.5 ? "Stretched" : "Balanced"} />
                  <KPI label="Current ratio" value={bal.current_ratio?.toFixed(2) ?? "—"} sub={bal.current_ratio >= 1.5 ? "Strong" : bal.current_ratio >= 1 ? "Adequate" : "Weak"} />
                  <KPI label="Long-term debt" value={formatCurrency(bal.long_term_debt, currency, fxRate)} />
                </div>
              </Card>
              <Card>
                <SectionTitle icon={Activity} title="Technical analysis" />
                <div className="grid grid-cols-2 gap-3">
                  <KPI label="Trend" value={tech.trend.toUpperCase()} tone={tech.trend === "uptrend" ? "up" : tech.trend === "downtrend" ? "down" : "default"} />
                  <KPI label="RSI (14)" value={tech.rsi_14 ?? "—"} sub={tech.rsi_14 == null ? null : tech.rsi_14 > 70 ? "Overbought" : tech.rsi_14 < 30 ? "Oversold" : "Neutral"} tone={tech.rsi_14 == null ? "default" : tech.rsi_14 > 70 ? "down" : tech.rsi_14 < 30 ? "up" : "default"} />
                  <KPI label="SMA 20" value={tech.sma_20?.toFixed(2) ?? "—"} />
                  <KPI label="SMA 50" value={tech.sma_50?.toFixed(2) ?? "—"} />
                  <KPI label="SMA 200" value={tech.sma_200?.toFixed(2) ?? "—"} />
                  <KPI label="MACD" value={tech.macd ?? "—"} sub={tech.macd != null && tech.macd_signal != null ? tech.macd > tech.macd_signal ? "Bullish crossover" : "Bearish crossover" : null} tone={tech.macd != null && tech.macd_signal != null ? tech.macd > tech.macd_signal ? "up" : "down" : "default"} />
                  <KPI label="52w high" value={formatCurrency(tech.high_52w, currency, fxRate)} />
                  <KPI label="52w low" value={formatCurrency(tech.low_52w, currency, fxRate)} />
                  <KPI label="Vs 200-SMA" value={tech.above_sma_200 ? "Above" : "Below"} tone={tech.above_sma_200 ? "up" : "down"} />
                </div>
              </Card>
            </section>

            {/* News */}
            {news && <NewsCard items={news.items} source={news.source} />}

            {/* Recommendation */}
            <section className="bg-giftyne-text text-white rounded-3xl p-6 md:p-10 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                <div>
                  <span className="font-accent text-base text-giftyne-terra">your plan</span>
                  <h3 className="font-heading text-3xl md:text-4xl font-bold leading-tight">Investment recommendation</h3>
                  <p className="font-body text-sm text-white/55 max-w-xl mt-1">
                    Combined view of trend, momentum, valuation and balance‑sheet health for {data.quote.ticker}.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15">
                  <ShieldAlert size={14} className="text-giftyne-terra" />
                  <span className="font-body text-xs">
                    Risk: <span className="font-semibold">{data.recommendation.risk_level}</span>
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-giftyne-text">
                <HorizonCard plan={data.recommendation.short_term} label="Short term" accent="bg-giftyne-terra" currency={currency} fxRate={fxRate} />
                <HorizonCard plan={data.recommendation.long_term} label="Long term" accent="bg-giftyne-sage" currency={currency} fxRate={fxRate} />
              </div>
              <div className="mt-8 flex items-start gap-3 text-white/60">
                <Clock3 size={14} className="mt-0.5 shrink-0" />
                <p className="font-body text-xs leading-relaxed">{data.disclaimer}</p>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {!data && !loading && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Activity, title: "Trend & technicals", desc: "Moving averages, RSI and MACD identify momentum." },
            { icon: BarChart3, title: "Financials", desc: "Earnings, growth, margins and valuation — quality of the business." },
            { icon: Target, title: "Plan", desc: "Entry zones, targets and stop‑loss for both short and long horizons." },
          ].map((it) => (
            <Card key={it.title}>
              <span className="w-10 h-10 rounded-xl bg-giftyne-terra/10 text-giftyne-terra flex items-center justify-center mb-3">
                <it.icon size={18} />
              </span>
              <h4 className="font-heading text-lg font-semibold text-giftyne-text mb-1">{it.title}</h4>
              <p className="font-body text-sm text-giftyne-text/55 leading-relaxed">{it.desc}</p>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
};

export default AnalyzeTab;
