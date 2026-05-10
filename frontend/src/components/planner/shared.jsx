import React from "react";

export const formatCurrency = (n, currency = "USD", fxRate = 1) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const v = n * fxRate;
  if (Math.abs(v) >= 1e12) return `${currency === "INR" ? "₹" : "$"}${(v / 1e12).toFixed(2)}T`;
  if (Math.abs(v) >= 1e9) return `${currency === "INR" ? "₹" : "$"}${(v / 1e9).toFixed(2)}B`;
  if (Math.abs(v) >= 1e6) return `${currency === "INR" ? "₹" : "$"}${(v / 1e6).toFixed(2)}M`;
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return `${currency} ${v.toFixed(2)}`;
  }
};

export const formatPct = (n, digits = 2) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
};

export const KPI = ({ label, value, sub, tone = "default" }) => (
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

export const SectionTitle = ({ icon: Icon, title, hint, action }) => (
  <div className="flex items-center justify-between gap-3 mb-4">
    <div className="flex items-center gap-3">
      <span className="w-9 h-9 rounded-xl bg-giftyne-terra/10 text-giftyne-terra flex items-center justify-center">
        <Icon size={18} />
      </span>
      <div>
        <h3 className="font-heading text-xl font-semibold text-giftyne-text leading-none">{title}</h3>
        {hint && <p className="font-body text-xs text-giftyne-text/50 mt-1">{hint}</p>}
      </div>
    </div>
    {action}
  </div>
);

export const Card = ({ children, className = "", ...props }) => (
  <div
    className={`bg-white border border-giftyne-sand/60 rounded-3xl p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const PrimaryButton = ({ children, className = "", ...props }) => (
  <button
    className={`bg-giftyne-terra text-white font-body font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-giftyne-terra/90 disabled:opacity-60 transition-colors inline-flex items-center gap-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const GhostButton = ({ children, className = "", ...props }) => (
  <button
    className={`font-body text-sm font-medium text-giftyne-text/65 hover:text-giftyne-terra px-4 py-2 rounded-full border border-giftyne-sand/60 hover:border-giftyne-terra/40 transition-colors inline-flex items-center gap-1.5 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const TextInput = React.forwardRef(({ className = "", icon: Icon, ...props }, ref) => (
  <div className="relative">
    {Icon && (
      <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-giftyne-text/35" />
    )}
    <input
      ref={ref}
      className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 rounded-full border border-giftyne-sand/60 bg-white font-body text-sm text-giftyne-text placeholder:text-giftyne-text/35 focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30 ${className}`}
      {...props}
    />
  </div>
));
TextInput.displayName = "TextInput";

export const Select = ({ children, className = "", ...props }) => (
  <select
    className={`w-full px-3 py-2.5 rounded-full border border-giftyne-sand/60 bg-white font-body text-sm text-giftyne-text focus:outline-none focus:ring-2 focus:ring-giftyne-terra/30 ${className}`}
    {...props}
  >
    {children}
  </select>
);

export const Empty = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12">
    {Icon && (
      <span className="inline-flex w-14 h-14 rounded-2xl bg-giftyne-muted text-giftyne-terra items-center justify-center mb-4">
        <Icon size={22} />
      </span>
    )}
    <h4 className="font-heading text-xl font-semibold text-giftyne-text mb-1">{title}</h4>
    {description && (
      <p className="font-body text-sm text-giftyne-text/55 max-w-md mx-auto">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
