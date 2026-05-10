from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import math
import hashlib
import random
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
# Financial Planner: deterministic synthetic analysis seeded by ticker symbol
# ===========================================================================

# Curated profile data for well-known tickers. Falls back to generic sector
# pricing for any other symbol so the planner works for arbitrary input.
_TICKER_PROFILES = {
    "AAPL":  {"name": "Apple Inc.",                  "sector": "Technology",            "base_price": 232.0, "drift": 0.00040, "vol": 0.014},
    "MSFT":  {"name": "Microsoft Corporation",       "sector": "Technology",            "base_price": 438.0, "drift": 0.00045, "vol": 0.013},
    "GOOGL": {"name": "Alphabet Inc.",               "sector": "Communication Services","base_price": 195.0, "drift": 0.00035, "vol": 0.016},
    "AMZN":  {"name": "Amazon.com, Inc.",            "sector": "Consumer Cyclical",     "base_price": 218.0, "drift": 0.00040, "vol": 0.018},
    "META":  {"name": "Meta Platforms, Inc.",        "sector": "Communication Services","base_price": 612.0, "drift": 0.00050, "vol": 0.020},
    "NVDA":  {"name": "NVIDIA Corporation",          "sector": "Technology",            "base_price": 142.0, "drift": 0.00080, "vol": 0.028},
    "TSLA":  {"name": "Tesla, Inc.",                 "sector": "Consumer Cyclical",     "base_price": 360.0, "drift": 0.00030, "vol": 0.034},
    "JPM":   {"name": "JPMorgan Chase & Co.",        "sector": "Financial Services",    "base_price": 248.0, "drift": 0.00025, "vol": 0.012},
    "V":     {"name": "Visa Inc.",                   "sector": "Financial Services",    "base_price": 314.0, "drift": 0.00030, "vol": 0.011},
    "WMT":   {"name": "Walmart Inc.",                "sector": "Consumer Defensive",    "base_price": 92.0,  "drift": 0.00020, "vol": 0.010},
    "DIS":   {"name": "The Walt Disney Company",     "sector": "Communication Services","base_price": 112.0, "drift": 0.00010, "vol": 0.018},
    "NFLX":  {"name": "Netflix, Inc.",               "sector": "Communication Services","base_price": 905.0, "drift": 0.00055, "vol": 0.022},
    "BRK.B": {"name": "Berkshire Hathaway Inc.",     "sector": "Financial Services",    "base_price": 472.0, "drift": 0.00020, "vol": 0.009},
    "JNJ":   {"name": "Johnson & Johnson",           "sector": "Healthcare",            "base_price": 156.0, "drift": 0.00015, "vol": 0.010},
    "XOM":   {"name": "Exxon Mobil Corporation",     "sector": "Energy",                "base_price": 118.0, "drift": 0.00012, "vol": 0.016},
    "INFY":  {"name": "Infosys Limited",             "sector": "Technology",            "base_price": 22.0,  "drift": 0.00025, "vol": 0.015},
    "TCS":   {"name": "Tata Consultancy Services",   "sector": "Technology",            "base_price": 4150.0,"drift": 0.00022, "vol": 0.013},
    "RELIANCE": {"name": "Reliance Industries Ltd.", "sector": "Energy",                "base_price": 1295.0,"drift": 0.00018, "vol": 0.014},
    "HDFCBANK": {"name": "HDFC Bank Ltd.",           "sector": "Financial Services",    "base_price": 1815.0,"drift": 0.00022, "vol": 0.012},
}


def _seed_for(ticker: str) -> int:
    h = hashlib.sha256(ticker.upper().encode("utf-8")).digest()
    return int.from_bytes(h[:8], "big")


def _profile_for(ticker: str) -> dict:
    t = ticker.upper().strip()
    if t in _TICKER_PROFILES:
        return {**_TICKER_PROFILES[t], "ticker": t, "synthetic": False}
    # Generic fallback derived from the seed.
    seed = _seed_for(t)
    rng = random.Random(seed)
    sectors = ["Technology", "Healthcare", "Financial Services",
               "Consumer Cyclical", "Consumer Defensive", "Industrials",
               "Energy", "Utilities", "Real Estate", "Communication Services"]
    return {
        "ticker": t,
        "name": f"{t} Holdings Corp.",
        "sector": rng.choice(sectors),
        "base_price": round(rng.uniform(35, 480), 2),
        "drift": rng.uniform(-0.0002, 0.0007),
        "vol": rng.uniform(0.010, 0.028),
        "synthetic": True,
    }


def _generate_price_history(profile: dict, days: int = 120):
    """Geometric Brownian motion seeded by the ticker symbol."""
    rng = random.Random(_seed_for(profile["ticker"]))
    drift = profile["drift"]
    vol = profile["vol"]
    price = profile["base_price"] * 0.78  # walk up to current
    prices = []
    today = datetime.now(timezone.utc).date()
    for i in range(days, 0, -1):
        shock = rng.gauss(0, 1) * vol
        price = max(0.5, price * math.exp(drift + shock))
        prices.append({
            "date": (today - timedelta(days=i - 1)).isoformat(),
            "close": round(price, 2),
        })
    # Anchor the final close near the curated base_price for realism.
    if prices:
        anchor = profile["base_price"]
        last = prices[-1]["close"]
        adjust = anchor / last if last else 1.0
        # smooth-blend the adjustment over the trailing 30 days
        n = min(30, len(prices))
        for i in range(n):
            w = (i + 1) / n
            j = len(prices) - n + i
            prices[j]["close"] = round(prices[j]["close"] * (1 - w + w * adjust), 2)
    return prices


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
    # crude signal line: EMA9 of last 9 macd snapshots
    macd_series = []
    for end in range(26, len(values) + 1):
        sub = values[:end]
        macd_series.append(ema(sub, 12) - ema(sub, 26))
    signal = ema(macd_series[-9:], 9) if len(macd_series) >= 9 else macd
    return round(macd, 3), round(signal, 3)


def _build_financials(profile: dict, current_price: float) -> dict:
    rng = random.Random(_seed_for(profile["ticker"]) ^ 0xF1A1)
    # Approximate share counts so market cap looks realistic.
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


def _build_balance_sheet(profile: dict, financials: dict) -> dict:
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


def _score_signals(tech: dict, fin: dict, bal: dict) -> dict:
    """Combine signals into short-term and long-term scores in [-3, 3]."""
    short = 0
    if tech["rsi_14"] is not None:
        if tech["rsi_14"] < 30:
            short += 2  # oversold
        elif tech["rsi_14"] > 70:
            short -= 2  # overbought
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

    # Targets keyed off volatility / trend.
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
        if tech["macd"] > tech["macd_signal"]:
            short_reasons.append("MACD is above its signal line — bullish momentum building.")
        else:
            short_reasons.append("MACD is below its signal line — momentum is fading.")
    short_reasons.append(
        f"Price is {'above' if tech['above_sma_50'] else 'below'} the 50-day SMA "
        f"({tech['sma_50']}) — short-term trend is {'positive' if tech['above_sma_50'] else 'weak'}."
    )

    long_reasons = []
    long_reasons.append(
        f"Revenue growth of {fin['revenue_growth_yoy'] * 100:.1f}% YoY with a "
        f"{fin['profit_margin'] * 100:.1f}% net margin."
    )
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


# ---------- Pydantic response models ----------

class PriceBar(BaseModel):
    date: str
    close: float


class Quote(BaseModel):
    ticker: str
    name: str
    sector: str
    current_price: float
    change_1d: float
    change_1d_pct: float
    change_30d_pct: float
    change_90d_pct: float


class Technicals(BaseModel):
    current_price: float
    sma_20: Optional[float]
    sma_50: Optional[float]
    sma_200: Optional[float]
    rsi_14: Optional[float]
    macd: Optional[float]
    macd_signal: Optional[float]
    high_52w: float
    low_52w: float
    above_sma_50: bool
    above_sma_200: bool
    trend: str


class Financials(BaseModel):
    market_cap: float
    shares_outstanding: float
    revenue_ttm: float
    net_income_ttm: float
    eps_ttm: float
    pe_ratio: Optional[float]
    dividend_yield: float
    revenue_growth_yoy: float
    profit_margin: float
    beta: float


class BalanceSheet(BaseModel):
    cash_and_equivalents: float
    short_term_debt: float
    long_term_debt: float
    total_debt: float
    total_assets: float
    total_liabilities: float
    shareholders_equity: float
    current_ratio: Optional[float]
    debt_to_equity: Optional[float]


class HorizonPlan(BaseModel):
    horizon: str
    verdict: str
    entry_zone: List[float]
    target_price: float
    stop_loss: float
    expected_return_pct: float
    rationale: List[str]
    suggested_allocation_pct: float


class Recommendation(BaseModel):
    short_term: HorizonPlan
    long_term: HorizonPlan
    risk_level: str


class AnalysisResponse(BaseModel):
    quote: Quote
    price_history: List[PriceBar]
    technicals: Technicals
    financials: Financials
    balance_sheet: BalanceSheet
    recommendation: Recommendation
    short_term_score: int
    long_term_score: int
    synthetic: bool
    disclaimer: str


@api_router.get("/financial/tickers")
async def list_supported_tickers():
    return {
        "supported": [
            {"ticker": k, "name": v["name"], "sector": v["sector"]}
            for k, v in _TICKER_PROFILES.items()
        ],
        "note": "Other symbols also work — synthetic data is generated deterministically.",
    }


@api_router.get("/financial/analyze/{ticker}", response_model=AnalysisResponse)
async def analyze_ticker(ticker: str):
    if not ticker or len(ticker) > 16:
        raise HTTPException(status_code=400, detail="Invalid ticker symbol.")

    profile = _profile_for(ticker)
    history = _generate_price_history(profile, days=200)
    closes = [p["close"] for p in history]
    current = closes[-1]
    prev = closes[-2] if len(closes) > 1 else current
    change_1d = current - prev
    change_30d_pct = ((current / closes[-30]) - 1) * 100 if len(closes) >= 30 else 0.0
    change_90d_pct = ((current / closes[-90]) - 1) * 100 if len(closes) >= 90 else 0.0

    quote = {
        "ticker": profile["ticker"],
        "name": profile["name"],
        "sector": profile["sector"],
        "current_price": round(current, 2),
        "change_1d": round(change_1d, 2),
        "change_1d_pct": round((change_1d / prev) * 100, 2) if prev else 0.0,
        "change_30d_pct": round(change_30d_pct, 2),
        "change_90d_pct": round(change_90d_pct, 2),
    }

    technicals = _build_technicals(history)
    financials = _build_financials(profile, current)
    balance = _build_balance_sheet(profile, financials)
    scores = _score_signals(technicals, financials, balance)
    recommendation = _build_recommendation(profile, technicals, financials, balance, scores)

    return {
        "quote": quote,
        "price_history": history[-90:],  # send the last 90 days to the client
        "technicals": technicals,
        "financials": financials,
        "balance_sheet": balance,
        "recommendation": recommendation,
        "short_term_score": scores["short_term_score"],
        "long_term_score": scores["long_term_score"],
        "synthetic": profile["synthetic"],
        "disclaimer": (
            "This analysis is generated from a deterministic model for educational "
            "purposes. It is not investment advice — consult a licensed advisor "
            "before making investment decisions."
        ),
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
