from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import math
import hashlib
import random
import time
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Optional yfinance — graceful fallback if missing or network blocked.
try:
    import yfinance as yf  # type: ignore
    _HAS_YF = True
except Exception:  # pragma: no cover
    yf = None
    _HAS_YF = False

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ---------- Existing status models ----------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ===========================================================================
# Financial Planner
#   - Live data via yfinance with deterministic synthetic fallback
#   - Technical, fundamental, balance-sheet analysis
#   - Short / long-term recommendation
#   - News, sector-index benchmark, FX
#   - Watchlist, portfolio, price alerts (Mongo)
#   - Risk profile scoring
# ===========================================================================

# ---------- Curated profiles (fallback data + nice display names) -----------
_TICKER_PROFILES = {
    "AAPL":  {"name": "Apple Inc.",                  "sector": "Technology",            "currency": "USD", "base_price": 232.0, "drift": 0.00040, "vol": 0.014},
    "MSFT":  {"name": "Microsoft Corporation",       "sector": "Technology",            "currency": "USD", "base_price": 438.0, "drift": 0.00045, "vol": 0.013},
    "GOOGL": {"name": "Alphabet Inc.",               "sector": "Communication Services","currency": "USD", "base_price": 195.0, "drift": 0.00035, "vol": 0.016},
    "AMZN":  {"name": "Amazon.com, Inc.",            "sector": "Consumer Cyclical",     "currency": "USD", "base_price": 218.0, "drift": 0.00040, "vol": 0.018},
    "META":  {"name": "Meta Platforms, Inc.",        "sector": "Communication Services","currency": "USD", "base_price": 612.0, "drift": 0.00050, "vol": 0.020},
    "NVDA":  {"name": "NVIDIA Corporation",          "sector": "Technology",            "currency": "USD", "base_price": 142.0, "drift": 0.00080, "vol": 0.028},
    "TSLA":  {"name": "Tesla, Inc.",                 "sector": "Consumer Cyclical",     "currency": "USD", "base_price": 360.0, "drift": 0.00030, "vol": 0.034},
    "JPM":   {"name": "JPMorgan Chase & Co.",        "sector": "Financial Services",    "currency": "USD", "base_price": 248.0, "drift": 0.00025, "vol": 0.012},
    "V":     {"name": "Visa Inc.",                   "sector": "Financial Services",    "currency": "USD", "base_price": 314.0, "drift": 0.00030, "vol": 0.011},
    "WMT":   {"name": "Walmart Inc.",                "sector": "Consumer Defensive",    "currency": "USD", "base_price": 92.0,  "drift": 0.00020, "vol": 0.010},
    "DIS":   {"name": "The Walt Disney Company",     "sector": "Communication Services","currency": "USD", "base_price": 112.0, "drift": 0.00010, "vol": 0.018},
    "NFLX":  {"name": "Netflix, Inc.",               "sector": "Communication Services","currency": "USD", "base_price": 905.0, "drift": 0.00055, "vol": 0.022},
    "BRK.B": {"name": "Berkshire Hathaway Inc.",     "sector": "Financial Services",    "currency": "USD", "base_price": 472.0, "drift": 0.00020, "vol": 0.009},
    "JNJ":   {"name": "Johnson & Johnson",           "sector": "Healthcare",            "currency": "USD", "base_price": 156.0, "drift": 0.00015, "vol": 0.010},
    "XOM":   {"name": "Exxon Mobil Corporation",     "sector": "Energy",                "currency": "USD", "base_price": 118.0, "drift": 0.00012, "vol": 0.016},
    "INFY":  {"name": "Infosys Limited",             "sector": "Technology",            "currency": "USD", "base_price": 22.0,  "drift": 0.00025, "vol": 0.015},
    "TCS":   {"name": "Tata Consultancy Services",   "sector": "Technology",            "currency": "INR", "base_price": 4150.0,"drift": 0.00022, "vol": 0.013},
    "RELIANCE": {"name": "Reliance Industries Ltd.", "sector": "Energy",                "currency": "INR", "base_price": 1295.0,"drift": 0.00018, "vol": 0.014},
    "HDFCBANK": {"name": "HDFC Bank Ltd.",           "sector": "Financial Services",    "currency": "INR", "base_price": 1815.0,"drift": 0.00022, "vol": 0.012},
}

# Recognised benchmark indices.
_BENCHMARKS = {
    "SPY":   {"name": "S&P 500 (SPY)",        "currency": "USD", "base_price": 612.0, "drift": 0.00030, "vol": 0.008},
    "QQQ":   {"name": "Nasdaq 100 (QQQ)",     "currency": "USD", "base_price": 545.0, "drift": 0.00038, "vol": 0.010},
    "DIA":   {"name": "Dow Jones (DIA)",      "currency": "USD", "base_price": 451.0, "drift": 0.00020, "vol": 0.007},
    "NIFTY": {"name": "Nifty 50",             "currency": "INR", "base_price": 24850.0,"drift": 0.00022, "vol": 0.009},
    "SENSEX":{"name": "BSE Sensex",           "currency": "INR", "base_price": 81600.0,"drift": 0.00020, "vol": 0.009},
}

_SECTOR_TO_BENCHMARK = {
    "Technology": "QQQ",
    "Communication Services": "QQQ",
    "Financial Services": "DIA",
    "Healthcare": "SPY",
    "Energy": "SPY",
    "Consumer Cyclical": "SPY",
    "Consumer Defensive": "SPY",
    "Industrials": "DIA",
    "Utilities": "SPY",
    "Real Estate": "SPY",
}

# Static fallback FX rates (relative to USD). Updated periodically in real apps.
_FX_RATES = {
    "USD": 1.0,
    "INR": 84.20,
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 153.0,
    "AUD": 1.51,
    "CAD": 1.39,
    "CHF": 0.88,
    "SGD": 1.34,
    "AED": 3.67,
}


# Simple in-memory TTL cache.
class _TTLCache:
    def __init__(self, ttl_seconds: int = 300):
        self.ttl = ttl_seconds
        self._store: Dict[str, Any] = {}

    def get(self, key):
        rec = self._store.get(key)
        if not rec:
            return None
        ts, val = rec
        if time.time() - ts > self.ttl:
            self._store.pop(key, None)
            return None
        return val

    def set(self, key, value):
        self._store[key] = (time.time(), value)


_PRICE_CACHE = _TTLCache(ttl_seconds=300)
_INFO_CACHE = _TTLCache(ttl_seconds=900)


def _seed_for(ticker: str) -> int:
    h = hashlib.sha256(ticker.upper().encode("utf-8")).digest()
    return int.from_bytes(h[:8], "big")


def _profile_for(ticker: str) -> dict:
    t = ticker.upper().strip()
    if t in _TICKER_PROFILES:
        return {**_TICKER_PROFILES[t], "ticker": t, "synthetic": False}
    if t in _BENCHMARKS:
        return {**_BENCHMARKS[t], "ticker": t, "sector": "Index", "synthetic": False}
    seed = _seed_for(t)
    rng = random.Random(seed)
    sectors = list(_SECTOR_TO_BENCHMARK.keys())
    return {
        "ticker": t,
        "name": f"{t} Holdings Corp.",
        "sector": rng.choice(sectors),
        "currency": "USD",
        "base_price": round(rng.uniform(35, 480), 2),
        "drift": rng.uniform(-0.0002, 0.0007),
        "vol": rng.uniform(0.010, 0.028),
        "synthetic": True,
    }


# ---------- Synthetic price generator (fallback) ----------
def _generate_price_history(profile: dict, days: int = 200):
    rng = random.Random(_seed_for(profile["ticker"]))
    drift = profile["drift"]
    vol = profile["vol"]
    price = profile["base_price"] * 0.78
    prices = []
    today = datetime.now(timezone.utc).date()
    for i in range(days, 0, -1):
        shock = rng.gauss(0, 1) * vol
        price = max(0.5, price * math.exp(drift + shock))
        prices.append({"date": (today - timedelta(days=i - 1)).isoformat(), "close": round(price, 2)})
    if prices:
        anchor = profile["base_price"]
        last = prices[-1]["close"]
        adjust = anchor / last if last else 1.0
        n = min(30, len(prices))
        for i in range(n):
            w = (i + 1) / n
            j = len(prices) - n + i
            prices[j]["close"] = round(prices[j]["close"] * (1 - w + w * adjust), 2)
    return prices


# ---------- Live data via yfinance with cache + fallback ----------
def _yf_symbol(ticker: str) -> str:
    """Map our internal symbols to yfinance symbols (e.g. RELIANCE -> RELIANCE.NS)."""
    t = ticker.upper()
    if t in {"RELIANCE", "TCS", "HDFCBANK", "INFOSYS"}:
        return f"{t}.NS"
    if t == "INFY":
        return "INFY"  # ADR on NYSE
    if t == "NIFTY":
        return "^NSEI"
    if t == "SENSEX":
        return "^BSESN"
    return t


def _fetch_history_live(ticker: str, days: int = 200):
    if not _HAS_YF:
        return None
    cache_key = f"hist:{ticker}:{days}"
    cached = _PRICE_CACHE.get(cache_key)
    if cached is not None:
        return cached
    try:
        sym = _yf_symbol(ticker)
        period = "1y" if days <= 252 else "2y"
        hist = yf.Ticker(sym).history(period=period, interval="1d", auto_adjust=False)
        if hist is None or hist.empty:
            return None
        hist = hist.tail(days)
        out = []
        for ts, row in hist.iterrows():
            close = float(row["Close"])
            if math.isnan(close):
                continue
            out.append({"date": ts.date().isoformat(), "close": round(close, 4)})
        if not out:
            return None
        _PRICE_CACHE.set(cache_key, out)
        return out
    except Exception as exc:  # pragma: no cover - network
        logger.warning("yfinance history failed for %s: %s", ticker, exc)
        return None


def _fetch_info_live(ticker: str):
    if not _HAS_YF:
        return None
    cache_key = f"info:{ticker}"
    cached = _INFO_CACHE.get(cache_key)
    if cached is not None:
        return cached
    try:
        info = yf.Ticker(_yf_symbol(ticker)).get_info()
        if not info:
            return None
        _INFO_CACHE.set(cache_key, info)
        return info
    except Exception as exc:  # pragma: no cover
        logger.warning("yfinance info failed for %s: %s", ticker, exc)
        return None


def _fetch_news_live(ticker: str, limit: int = 6):
    if not _HAS_YF:
        return None
    cache_key = f"news:{ticker}"
    cached = _PRICE_CACHE.get(cache_key)
    if cached is not None:
        return cached
    try:
        items = yf.Ticker(_yf_symbol(ticker)).get_news() or []
        out = []
        for it in items[:limit]:
            out.append({
                "title": it.get("title") or it.get("headline") or "",
                "publisher": it.get("publisher") or "",
                "url": it.get("link") or it.get("url") or "",
                "published_at": datetime.fromtimestamp(it.get("providerPublishTime", time.time()), tz=timezone.utc).isoformat(),
                "sentiment": _sentiment_for(it.get("title", "")),
            })
        out = [n for n in out if n["title"]]
        if not out:
            return None
        _PRICE_CACHE.set(cache_key, out)
        return out
    except Exception as exc:  # pragma: no cover
        logger.warning("yfinance news failed for %s: %s", ticker, exc)
        return None


_POS_WORDS = {"beat", "beats", "surge", "record", "strong", "growth", "upgrade", "buy", "rally", "expands", "wins", "profit", "raises", "outperform"}
_NEG_WORDS = {"miss", "misses", "downgrade", "sell", "loss", "losses", "weak", "drop", "fall", "falls", "decline", "lawsuit", "investigation", "cuts", "warns", "fraud"}


def _sentiment_for(title: str) -> str:
    if not title:
        return "neutral"
    s = title.lower()
    pos = sum(1 for w in _POS_WORDS if w in s)
    neg = sum(1 for w in _NEG_WORDS if w in s)
    if pos > neg:
        return "positive"
    if neg > pos:
        return "negative"
    return "neutral"


def _synthetic_news(ticker: str, profile: dict, limit: int = 6):
    rng = random.Random(_seed_for(ticker) ^ 0xCAFE)
    templates = [
        ("{name} reports stronger-than-expected quarterly revenue", "MarketWatch"),
        ("Analysts raise price target on {ticker} after solid earnings", "Reuters"),
        ("{name} expands into {sector} with new product launch", "Bloomberg"),
        ("{ticker} faces near-term headwinds amid sector rotation", "CNBC"),
        ("{name} announces share buyback program", "Financial Times"),
        ("Insider activity at {name} spikes ahead of guidance update", "Seeking Alpha"),
        ("{ticker} downgraded as competition intensifies", "Barron's"),
        ("Hedge funds rotate into {sector} names including {ticker}", "WSJ"),
    ]
    out = []
    today = datetime.now(timezone.utc)
    for i in range(min(limit, len(templates))):
        title, pub = rng.choice(templates)
        title = title.format(name=profile["name"], ticker=ticker, sector=profile["sector"])
        out.append({
            "title": title,
            "publisher": pub,
            "url": "",
            "published_at": (today - timedelta(hours=rng.randint(2, 96))).isoformat(),
            "sentiment": _sentiment_for(title),
        })
    return out


# ---------- Technical indicators ----------
def _sma(values: List[float], window: int) -> Optional[float]:
    if len(values) < window:
        return None
    return sum(values[-window:]) / window


def _rsi(values: List[float], period: int = 14) -> Optional[float]:
    if len(values) <= period:
        return None
    gains, losses = 0.0, 0.0
    for i in range(-period, 0):
        diff = values[i] - values[i - 1]
        if diff >= 0:
            gains += diff
        else:
            losses -= diff
    if losses == 0:
        return 100.0
    rs = (gains / period) / (losses / period)
    return round(100 - (100 / (1 + rs)), 2)


def _macd(values: List[float]):
    def ema(vals, period):
        k = 2 / (period + 1)
        e = vals[0]
        for v in vals[1:]:
            e = v * k + e * (1 - k)
        return e

    if len(values) < 35:
        return None, None
    ema12 = ema(values, 12)
    ema26 = ema(values, 26)
    macd = ema12 - ema26
    macd_series = []
    for end in range(26, len(values) + 1):
        sub = values[:end]
        macd_series.append(ema(sub, 12) - ema(sub, 26))
    signal = ema(macd_series[-9:], 9) if len(macd_series) >= 9 else macd
    return round(macd, 3), round(signal, 3)


def _build_technicals(prices: List[dict]) -> dict:
    closes = [p["close"] for p in prices]
    current = closes[-1]
    sma20 = _sma(closes, 20)
    sma50 = _sma(closes, 50)
    sma200 = _sma(closes, 200) if len(closes) >= 200 else _sma(closes, len(closes))
    rsi14 = _rsi(closes, 14)
    macd, signal = _macd(closes)
    high_52w = max(closes)
    low_52w = min(closes)
    return {
        "current_price": current,
        "sma_20": round(sma20, 2) if sma20 else None,
        "sma_50": round(sma50, 2) if sma50 else None,
        "sma_200": round(sma200, 2) if sma200 else None,
        "rsi_14": rsi14,
        "macd": macd,
        "macd_signal": signal,
        "high_52w": round(high_52w, 2),
        "low_52w": round(low_52w, 2),
        "above_sma_50": (sma50 is not None) and current > sma50,
        "above_sma_200": (sma200 is not None) and current > sma200,
        "trend": (
            "uptrend" if (sma50 and sma200 and sma50 > sma200 and current > sma50)
            else "downtrend" if (sma50 and sma200 and sma50 < sma200 and current < sma50)
            else "sideways"
        ),
    }


def _build_financials(profile: dict, current_price: float, info: Optional[dict] = None) -> dict:
    if info:
        market_cap = info.get("marketCap") or 0
        shares = info.get("sharesOutstanding") or (market_cap / current_price if current_price else 0)
        revenue = info.get("totalRevenue") or 0
        net_income = info.get("netIncomeToCommon") or 0
        eps = info.get("trailingEps") or (net_income / shares if shares else 0)
        pe = info.get("trailingPE") or (current_price / eps if eps else None)
        dividend_yield = info.get("dividendYield") or 0
        revenue_growth = info.get("revenueGrowth") or 0
        profit_margin = info.get("profitMargins") or (net_income / revenue if revenue else 0)
        beta = info.get("beta") or 1.0
        if market_cap and shares and revenue:
            return {
                "market_cap": float(market_cap),
                "shares_outstanding": float(shares),
                "revenue_ttm": float(revenue),
                "net_income_ttm": float(net_income),
                "eps_ttm": round(float(eps), 2),
                "pe_ratio": round(float(pe), 2) if pe else None,
                "dividend_yield": round(float(dividend_yield), 4),
                "revenue_growth_yoy": round(float(revenue_growth), 4),
                "profit_margin": round(float(profit_margin), 4),
                "beta": round(float(beta), 2),
            }

    # Synthetic fallback
    rng = random.Random(_seed_for(profile["ticker"]) ^ 0xF1A1)
    if current_price < 50:
        shares = rng.uniform(1_500, 8_500) * 1e6
    elif current_price < 200:
        shares = rng.uniform(800, 4_000) * 1e6
    elif current_price < 600:
        shares = rng.uniform(300, 1_800) * 1e6
    else:
        shares = rng.uniform(80, 600) * 1e6
    market_cap = shares * current_price
    revenue = market_cap * rng.uniform(0.18, 0.55)
    net_income = revenue * rng.uniform(0.05, 0.28)
    eps = net_income / shares
    pe = current_price / eps if eps > 0 else None
    dividend_yield = rng.choice([0, 0, rng.uniform(0.005, 0.04)])
    revenue_growth = rng.uniform(-0.05, 0.30)
    profit_margin = net_income / revenue
    return {
        "market_cap": round(market_cap, 2),
        "shares_outstanding": round(shares, 0),
        "revenue_ttm": round(revenue, 2),
        "net_income_ttm": round(net_income, 2),
        "eps_ttm": round(eps, 2),
        "pe_ratio": round(pe, 2) if pe else None,
        "dividend_yield": round(dividend_yield, 4),
        "revenue_growth_yoy": round(revenue_growth, 4),
        "profit_margin": round(profit_margin, 4),
        "beta": round(0.6 + profile["vol"] * 35 + rng.uniform(-0.2, 0.2), 2),
    }


def _build_balance_sheet(profile: dict, financials: dict, info: Optional[dict] = None) -> dict:
    if info:
        cash = info.get("totalCash") or 0
        debt = info.get("totalDebt") or 0
        equity = info.get("totalStockholderEquity") or info.get("bookValue", 0) * (info.get("sharesOutstanding") or 0)
        d2e_pct = info.get("debtToEquity")  # comes as percent
        d2e = (d2e_pct / 100) if isinstance(d2e_pct, (int, float)) and d2e_pct > 5 else d2e_pct
        current_ratio = info.get("currentRatio")
        if cash and debt:
            assets = (equity or 0) + debt + cash
            liabilities = debt + cash * 0.4  # rough
            return {
                "cash_and_equivalents": float(cash),
                "short_term_debt": float(info.get("shortTermDebt") or debt * 0.2),
                "long_term_debt": float(info.get("longTermDebt") or debt * 0.8),
                "total_debt": float(debt),
                "total_assets": float(assets),
                "total_liabilities": float(liabilities),
                "shareholders_equity": float(equity or assets - liabilities),
                "current_ratio": round(float(current_ratio), 2) if current_ratio else None,
                "debt_to_equity": round(float(d2e), 2) if d2e else None,
            }

    rng = random.Random(_seed_for(profile["ticker"]) ^ 0xB2B2)
    revenue = financials["revenue_ttm"]
    cash = revenue * rng.uniform(0.10, 0.35)
    short_term_debt = revenue * rng.uniform(0.02, 0.10)
    long_term_debt = revenue * rng.uniform(0.15, 0.55)
    total_debt = short_term_debt + long_term_debt
    total_assets = revenue * rng.uniform(1.2, 2.4)
    total_liabilities = total_debt + revenue * rng.uniform(0.20, 0.55)
    equity = total_assets - total_liabilities
    current_assets = cash + revenue * rng.uniform(0.10, 0.25)
    current_liabilities = short_term_debt + revenue * rng.uniform(0.10, 0.25)
    return {
        "cash_and_equivalents": round(cash, 2),
        "short_term_debt": round(short_term_debt, 2),
        "long_term_debt": round(long_term_debt, 2),
        "total_debt": round(total_debt, 2),
        "total_assets": round(total_assets, 2),
        "total_liabilities": round(total_liabilities, 2),
        "shareholders_equity": round(equity, 2),
        "current_ratio": round(current_assets / current_liabilities, 2) if current_liabilities else None,
        "debt_to_equity": round(total_debt / equity, 2) if equity > 0 else None,
    }


def _score_signals(tech: dict, fin: dict, bal: dict) -> dict:
    short = 0
    if tech["rsi_14"] is not None:
        if tech["rsi_14"] < 30:
            short += 2
        elif tech["rsi_14"] > 70:
            short -= 2
        elif tech["rsi_14"] < 45:
            short += 1
        elif tech["rsi_14"] > 60:
            short -= 1
    if tech["macd"] is not None and tech["macd_signal"] is not None:
        short += 1 if tech["macd"] > tech["macd_signal"] else -1
    if tech["above_sma_50"]:
        short += 1
    else:
        short -= 1

    long = 0
    if tech["above_sma_200"]:
        long += 1
    else:
        long -= 1
    if fin["revenue_growth_yoy"] >= 0.10:
        long += 1
    elif fin["revenue_growth_yoy"] < 0:
        long -= 1
    if fin["profit_margin"] >= 0.15:
        long += 1
    elif fin["profit_margin"] < 0.05:
        long -= 1
    if fin["pe_ratio"] is not None:
        if fin["pe_ratio"] < 18:
            long += 1
        elif fin["pe_ratio"] > 45:
            long -= 1
    if bal["debt_to_equity"] is not None:
        if bal["debt_to_equity"] < 0.6:
            long += 1
        elif bal["debt_to_equity"] > 1.5:
            long -= 1

    short = max(-3, min(3, short))
    long = max(-3, min(3, long))
    return {"short_term_score": short, "long_term_score": long}


def _verdict(score: int) -> str:
    if score >= 2:
        return "Buy"
    if score == 1:
        return "Accumulate"
    if score == 0:
        return "Hold"
    if score == -1:
        return "Reduce"
    return "Sell"


def _build_recommendation(profile, tech, fin, bal, scores) -> dict:
    current = tech["current_price"]
    short_verdict = _verdict(scores["short_term_score"])
    long_verdict = _verdict(scores["long_term_score"])
    short_target = round(current * (1 + (0.06 if scores["short_term_score"] > 0 else -0.04)), 2)
    short_stop = round(current * (0.94 if scores["short_term_score"] >= 0 else 0.92), 2)
    long_target = round(current * (1 + (0.30 if scores["long_term_score"] > 0 else 0.05)), 2)
    long_stop = round(current * 0.80, 2)

    short_reasons = []
    if tech["rsi_14"] is not None:
        if tech["rsi_14"] < 30:
            short_reasons.append(f"RSI {tech['rsi_14']} signals oversold; mean-reversion bounce likely.")
        elif tech["rsi_14"] > 70:
            short_reasons.append(f"RSI {tech['rsi_14']} is overbought; expect a near-term pullback.")
        else:
            short_reasons.append(f"RSI sits at {tech['rsi_14']} — neutral momentum.")
    if tech["macd"] is not None and tech["macd_signal"] is not None:
        short_reasons.append(
            "MACD is above its signal line — bullish momentum building."
            if tech["macd"] > tech["macd_signal"]
            else "MACD is below its signal line — momentum is fading."
        )
    short_reasons.append(
        f"Price is {'above' if tech['above_sma_50'] else 'below'} the 50-day SMA "
        f"({tech['sma_50']}) — short-term trend is {'positive' if tech['above_sma_50'] else 'weak'}."
    )

    long_reasons = [
        f"Revenue growth of {fin['revenue_growth_yoy'] * 100:.1f}% YoY with a "
        f"{fin['profit_margin'] * 100:.1f}% net margin."
    ]
    if fin["pe_ratio"]:
        long_reasons.append(
            f"P/E of {fin['pe_ratio']} is "
            f"{'attractive' if fin['pe_ratio'] < 18 else 'rich' if fin['pe_ratio'] > 45 else 'reasonable'} "
            "versus the broader market."
        )
    if bal["debt_to_equity"] is not None:
        long_reasons.append(
            f"Debt/Equity of {bal['debt_to_equity']} indicates a "
            f"{'conservative' if bal['debt_to_equity'] < 0.6 else 'stretched' if bal['debt_to_equity'] > 1.5 else 'balanced'} "
            "balance sheet."
        )
    long_reasons.append(
        f"Price is {'above' if tech['above_sma_200'] else 'below'} the 200-day SMA — "
        f"the long-term trend is {'intact' if tech['above_sma_200'] else 'broken'}."
    )

    return {
        "short_term": {
            "horizon": "1 - 3 months",
            "verdict": short_verdict,
            "entry_zone": [round(current * 0.98, 2), round(current * 1.02, 2)],
            "target_price": short_target,
            "stop_loss": short_stop,
            "expected_return_pct": round((short_target / current - 1) * 100, 2),
            "rationale": short_reasons,
            "suggested_allocation_pct": 5 if short_verdict in ("Buy", "Accumulate") else 0,
        },
        "long_term": {
            "horizon": "1 - 3 years",
            "verdict": long_verdict,
            "entry_zone": [round(current * 0.92, 2), round(current * 1.05, 2)],
            "target_price": long_target,
            "stop_loss": long_stop,
            "expected_return_pct": round((long_target / current - 1) * 100, 2),
            "rationale": long_reasons,
            "suggested_allocation_pct": 15 if long_verdict == "Buy" else 8 if long_verdict == "Accumulate" else 0,
        },
        "risk_level": (
            "High" if profile["vol"] > 0.022
            else "Moderate" if profile["vol"] > 0.014
            else "Low"
        ),
    }


# ===========================================================================
# Endpoints
# ===========================================================================

@api_router.get("/financial/tickers")
async def list_supported_tickers():
    return {
        "supported": [
            {"ticker": k, "name": v["name"], "sector": v["sector"], "currency": v.get("currency", "USD")}
            for k, v in _TICKER_PROFILES.items()
        ],
        "indices": [
            {"ticker": k, "name": v["name"], "currency": v.get("currency", "USD")}
            for k, v in _BENCHMARKS.items()
        ],
        "note": "Other symbols also work — synthetic data is generated deterministically.",
    }


@api_router.get("/financial/analyze/{ticker}")
async def analyze_ticker(ticker: str):
    if not ticker or len(ticker) > 16:
        raise HTTPException(status_code=400, detail="Invalid ticker symbol.")

    profile = _profile_for(ticker)
    live_history = _fetch_history_live(profile["ticker"], days=200)
    info = _fetch_info_live(profile["ticker"])
    using_live = bool(live_history)

    history = live_history or _generate_price_history(profile, days=200)
    closes = [p["close"] for p in history]
    current = closes[-1]
    prev = closes[-2] if len(closes) > 1 else current
    change_1d = current - prev
    change_30d_pct = ((current / closes[-30]) - 1) * 100 if len(closes) >= 30 else 0.0
    change_90d_pct = ((current / closes[-90]) - 1) * 100 if len(closes) >= 90 else 0.0

    quote = {
        "ticker": profile["ticker"],
        "name": (info.get("longName") if info else None) or profile["name"],
        "sector": (info.get("sector") if info else None) or profile["sector"],
        "currency": (info.get("currency") if info else None) or profile.get("currency", "USD"),
        "current_price": round(current, 2),
        "change_1d": round(change_1d, 2),
        "change_1d_pct": round((change_1d / prev) * 100, 2) if prev else 0.0,
        "change_30d_pct": round(change_30d_pct, 2),
        "change_90d_pct": round(change_90d_pct, 2),
    }

    technicals = _build_technicals(history)
    financials = _build_financials(profile, current, info if using_live else None)
    balance = _build_balance_sheet(profile, financials, info if using_live else None)
    scores = _score_signals(technicals, financials, balance)
    recommendation = _build_recommendation(profile, technicals, financials, balance, scores)

    return {
        "quote": quote,
        "price_history": history[-90:],
        "technicals": technicals,
        "financials": financials,
        "balance_sheet": balance,
        "recommendation": recommendation,
        "short_term_score": scores["short_term_score"],
        "long_term_score": scores["long_term_score"],
        "synthetic": (not using_live) or profile["synthetic"],
        "data_source": "yfinance" if using_live else "synthetic",
        "disclaimer": (
            "This analysis combines live market data (when available) with a deterministic "
            "model for educational purposes. It is not investment advice — consult a licensed "
            "advisor before making investment decisions."
        ),
    }


@api_router.get("/financial/news/{ticker}")
async def get_news(ticker: str, limit: int = 6):
    profile = _profile_for(ticker)
    live = _fetch_news_live(profile["ticker"], limit=limit)
    if live:
        return {"ticker": profile["ticker"], "items": live, "source": "yfinance"}
    return {
        "ticker": profile["ticker"],
        "items": _synthetic_news(profile["ticker"], profile, limit=limit),
        "source": "synthetic",
    }


@api_router.get("/financial/benchmark/{ticker}")
async def get_benchmark(ticker: str):
    profile = _profile_for(ticker)
    bench_symbol = _SECTOR_TO_BENCHMARK.get(profile["sector"], "SPY")
    bench_profile = _profile_for(bench_symbol)

    live_t = _fetch_history_live(profile["ticker"], days=120)
    live_b = _fetch_history_live(bench_symbol, days=120)
    t_hist = live_t or _generate_price_history(profile, days=120)
    b_hist = live_b or _generate_price_history(bench_profile, days=120)

    # Normalize to 100 at the start so they're directly comparable.
    def normalize(hist):
        base = hist[0]["close"] if hist else 1
        return [{"date": p["date"], "value": round((p["close"] / base) * 100, 2)} for p in hist]

    return {
        "ticker": profile["ticker"],
        "benchmark": bench_symbol,
        "benchmark_name": bench_profile["name"],
        "ticker_series": normalize(t_hist),
        "benchmark_series": normalize(b_hist),
        "ticker_return_pct": round((t_hist[-1]["close"] / t_hist[0]["close"] - 1) * 100, 2),
        "benchmark_return_pct": round((b_hist[-1]["close"] / b_hist[0]["close"] - 1) * 100, 2),
        "data_source": "yfinance" if (live_t and live_b) else "synthetic",
    }


@api_router.get("/financial/fx/{base}/{quote}")
async def get_fx(base: str, quote: str):
    base = base.upper()
    quote = quote.upper()
    if base not in _FX_RATES or quote not in _FX_RATES:
        raise HTTPException(status_code=400, detail="Unsupported currency.")
    rate = _FX_RATES[quote] / _FX_RATES[base]
    return {"base": base, "quote": quote, "rate": round(rate, 4), "source": "static_table"}


# ---------- Risk profile ----------

class RiskAnswers(BaseModel):
    age: int = Field(..., ge=12, le=100)
    horizon_years: int = Field(..., ge=0, le=60)
    income_stability: str  # stable | variable | unstable
    loss_tolerance: str  # low | medium | high
    investing_experience: str  # none | some | experienced
    goal: str  # preservation | balanced | growth | aggressive_growth


@api_router.post("/financial/risk-profile")
async def score_risk(answers: RiskAnswers):
    score = 0
    if answers.age < 30:
        score += 3
    elif answers.age < 45:
        score += 2
    elif answers.age < 60:
        score += 1

    if answers.horizon_years >= 15:
        score += 3
    elif answers.horizon_years >= 7:
        score += 2
    elif answers.horizon_years >= 3:
        score += 1

    score += {"stable": 2, "variable": 1, "unstable": 0}.get(answers.income_stability, 0)
    score += {"low": 0, "medium": 2, "high": 4}.get(answers.loss_tolerance, 1)
    score += {"none": 0, "some": 1, "experienced": 2}.get(answers.investing_experience, 0)
    score += {"preservation": 0, "balanced": 1, "growth": 2, "aggressive_growth": 3}.get(answers.goal, 1)

    if score <= 5:
        profile_name = "Conservative"
        equity = 25; debt = 60; gold = 10; cash = 5
    elif score <= 9:
        profile_name = "Moderately Conservative"
        equity = 40; debt = 45; gold = 10; cash = 5
    elif score <= 13:
        profile_name = "Balanced"
        equity = 55; debt = 30; gold = 10; cash = 5
    elif score <= 16:
        profile_name = "Growth"
        equity = 70; debt = 20; gold = 7; cash = 3
    else:
        profile_name = "Aggressive Growth"
        equity = 85; debt = 10; gold = 3; cash = 2

    return {
        "score": score,
        "profile": profile_name,
        "allocation": {"equity": equity, "debt": debt, "gold": gold, "cash": cash},
        "guidance": (
            f"Your risk profile is {profile_name}. We suggest roughly {equity}% in equities, "
            f"{debt}% in debt, {gold}% in gold and {cash}% in cash. Rebalance every 6-12 months."
        ),
    }


# ---------- Watchlist ----------

class WatchlistItem(BaseModel):
    user_id: str = "guest"
    ticker: str
    note: Optional[str] = ""


@api_router.get("/watchlist")
async def list_watchlist(user_id: str = "guest"):
    items = await db.watchlist.find({"user_id": user_id}, {"_id": 0}).to_list(500)
    return {"user_id": user_id, "items": items}


@api_router.post("/watchlist")
async def add_watchlist(item: WatchlistItem):
    item.ticker = item.ticker.upper()
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": item.user_id,
        "ticker": item.ticker,
        "note": item.note or "",
        "added_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.watchlist.update_one(
        {"user_id": item.user_id, "ticker": item.ticker},
        {"$setOnInsert": doc},
        upsert=True,
    )
    return doc


@api_router.delete("/watchlist/{ticker}")
async def remove_watchlist(ticker: str, user_id: str = "guest"):
    res = await db.watchlist.delete_one({"user_id": user_id, "ticker": ticker.upper()})
    return {"deleted": res.deleted_count}


# ---------- Portfolio ----------

class PortfolioHolding(BaseModel):
    user_id: str = "guest"
    ticker: str
    quantity: float = Field(..., gt=0)
    avg_cost: float = Field(..., gt=0)
    currency: str = "USD"


@api_router.get("/portfolio")
async def get_portfolio(user_id: str = "guest"):
    holdings = await db.portfolio.find({"user_id": user_id}, {"_id": 0}).to_list(500)

    total_cost = 0.0
    total_value = 0.0
    enriched = []
    for h in holdings:
        profile = _profile_for(h["ticker"])
        live_hist = _fetch_history_live(profile["ticker"], days=5)
        if live_hist:
            current = live_hist[-1]["close"]
        else:
            current = _generate_price_history(profile, days=5)[-1]["close"]
        cost = h["quantity"] * h["avg_cost"]
        value = h["quantity"] * current
        pl = value - cost
        pl_pct = (pl / cost) * 100 if cost else 0
        enriched.append({
            **h,
            "current_price": round(current, 2),
            "market_value": round(value, 2),
            "cost_basis": round(cost, 2),
            "unrealized_pl": round(pl, 2),
            "unrealized_pl_pct": round(pl_pct, 2),
        })
        total_cost += cost
        total_value += value

    total_pl = total_value - total_cost
    return {
        "user_id": user_id,
        "holdings": enriched,
        "summary": {
            "total_cost": round(total_cost, 2),
            "total_value": round(total_value, 2),
            "total_pl": round(total_pl, 2),
            "total_pl_pct": round((total_pl / total_cost) * 100, 2) if total_cost else 0,
        },
    }


@api_router.post("/portfolio")
async def add_holding(h: PortfolioHolding):
    h.ticker = h.ticker.upper()
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": h.user_id,
        "ticker": h.ticker,
        "quantity": h.quantity,
        "avg_cost": h.avg_cost,
        "currency": h.currency,
        "added_at": datetime.now(timezone.utc).isoformat(),
    }
    # Average-cost into existing position if present.
    existing = await db.portfolio.find_one({"user_id": h.user_id, "ticker": h.ticker}, {"_id": 0})
    if existing:
        new_qty = existing["quantity"] + h.quantity
        new_cost = ((existing["quantity"] * existing["avg_cost"]) + (h.quantity * h.avg_cost)) / new_qty
        await db.portfolio.update_one(
            {"user_id": h.user_id, "ticker": h.ticker},
            {"$set": {"quantity": new_qty, "avg_cost": round(new_cost, 4)}},
        )
        existing["quantity"] = new_qty
        existing["avg_cost"] = round(new_cost, 4)
        return existing
    await db.portfolio.insert_one(doc)
    return doc


@api_router.delete("/portfolio/{ticker}")
async def remove_holding(ticker: str, user_id: str = "guest"):
    res = await db.portfolio.delete_one({"user_id": user_id, "ticker": ticker.upper()})
    return {"deleted": res.deleted_count}


# ---------- Alerts ----------

class Alert(BaseModel):
    user_id: str = "guest"
    ticker: str
    condition: str  # above | below
    price: float = Field(..., gt=0)


@api_router.get("/alerts")
async def list_alerts(user_id: str = "guest"):
    items = await db.alerts.find({"user_id": user_id}, {"_id": 0}).to_list(500)
    return {"user_id": user_id, "items": items}


@api_router.post("/alerts")
async def add_alert(alert: Alert):
    if alert.condition not in {"above", "below"}:
        raise HTTPException(status_code=400, detail="condition must be 'above' or 'below'")
    alert.ticker = alert.ticker.upper()
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": alert.user_id,
        "ticker": alert.ticker,
        "condition": alert.condition,
        "price": alert.price,
        "triggered": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.alerts.insert_one(doc)
    return doc


@api_router.delete("/alerts/{alert_id}")
async def remove_alert(alert_id: str):
    res = await db.alerts.delete_one({"id": alert_id})
    return {"deleted": res.deleted_count}


@api_router.post("/alerts/check")
async def check_alerts(user_id: str = "guest"):
    """Re-evaluate alerts; flips triggered=True when condition met."""
    items = await db.alerts.find({"user_id": user_id, "triggered": False}, {"_id": 0}).to_list(500)
    triggered = []
    for a in items:
        profile = _profile_for(a["ticker"])
        hist = _fetch_history_live(profile["ticker"], days=2) or _generate_price_history(profile, days=2)
        price = hist[-1]["close"]
        hit = (a["condition"] == "above" and price >= a["price"]) or \
              (a["condition"] == "below" and price <= a["price"])
        if hit:
            await db.alerts.update_one(
                {"id": a["id"]},
                {"$set": {"triggered": True, "triggered_at": datetime.now(timezone.utc).isoformat(), "triggered_price": price}},
            )
            triggered.append({**a, "triggered_price": price})
    return {"user_id": user_id, "triggered": triggered, "checked": len(items)}


# ---------- Calculators (server-side too, for completeness) ----------

class SipInput(BaseModel):
    monthly_amount: float = Field(..., gt=0)
    annual_return_pct: float
    years: float = Field(..., gt=0)


@api_router.post("/calculators/sip")
async def sip_calc(inp: SipInput):
    n = int(inp.years * 12)
    r = inp.annual_return_pct / 100 / 12
    if r == 0:
        future = inp.monthly_amount * n
    else:
        future = inp.monthly_amount * (((1 + r) ** n - 1) / r) * (1 + r)
    invested = inp.monthly_amount * n
    schedule = []
    bal = 0.0
    for m in range(1, n + 1):
        bal = (bal + inp.monthly_amount) * (1 + r)
        if m % 12 == 0:
            schedule.append({"year": m // 12, "balance": round(bal, 2), "invested": round(inp.monthly_amount * m, 2)})
    return {
        "future_value": round(future, 2),
        "total_invested": round(invested, 2),
        "wealth_gained": round(future - invested, 2),
        "schedule": schedule,
    }


class GoalInput(BaseModel):
    target_amount: float = Field(..., gt=0)
    years: float = Field(..., gt=0)
    annual_return_pct: float
    current_corpus: float = 0


@api_router.post("/calculators/goal")
async def goal_calc(inp: GoalInput):
    n = int(inp.years * 12)
    r = inp.annual_return_pct / 100 / 12
    fv_existing = inp.current_corpus * ((1 + r) ** n)
    needed = max(inp.target_amount - fv_existing, 0)
    if r == 0:
        monthly = needed / n if n else 0
    else:
        monthly = needed / ((((1 + r) ** n - 1) / r) * (1 + r))
    return {
        "monthly_investment_required": round(monthly, 2),
        "future_value_of_existing_corpus": round(fv_existing, 2),
        "shortfall_to_fund": round(needed, 2),
    }


class TaxInput(BaseModel):
    purchase_price: float = Field(..., gt=0)
    sale_price: float = Field(..., gt=0)
    quantity: float = Field(..., gt=0)
    holding_period_months: int = Field(..., ge=0)
    region: str = "IN"  # IN | US


@api_router.post("/calculators/tax")
async def tax_calc(inp: TaxInput):
    gain = (inp.sale_price - inp.purchase_price) * inp.quantity
    region = inp.region.upper()
    if region == "IN":
        long_term = inp.holding_period_months >= 12
        if long_term:
            exempt = 100_000
            taxable = max(gain - exempt, 0)
            tax = taxable * 0.10
            label = "LTCG (India, equity)"
        else:
            tax = max(gain, 0) * 0.15
            label = "STCG (India, equity)"
    else:  # US
        long_term = inp.holding_period_months >= 12
        if long_term:
            tax = max(gain, 0) * 0.15
            label = "Long-term capital gains (US)"
        else:
            tax = max(gain, 0) * 0.24
            label = "Short-term capital gains (US, est.)"
    return {
        "gross_gain": round(gain, 2),
        "tax": round(tax, 2),
        "net_gain": round(gain - tax, 2),
        "category": label,
        "note": "Estimates only. Local rules and exemptions vary; consult a tax professional.",
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
