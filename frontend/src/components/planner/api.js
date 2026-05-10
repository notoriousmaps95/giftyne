import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, timeout: 20000 });

export const analyzeTicker = (ticker) =>
  api.get(`/financial/analyze/${encodeURIComponent(ticker)}`).then((r) => r.data);

export const fetchNews = (ticker, limit = 6) =>
  api.get(`/financial/news/${encodeURIComponent(ticker)}`, { params: { limit } }).then((r) => r.data);

export const fetchBenchmark = (ticker) =>
  api.get(`/financial/benchmark/${encodeURIComponent(ticker)}`).then((r) => r.data);

export const fetchFx = (base, quote) =>
  api.get(`/financial/fx/${base}/${quote}`).then((r) => r.data);

export const scoreRiskProfile = (answers) =>
  api.post("/financial/risk-profile", answers).then((r) => r.data);

export const Watchlist = {
  list: (user_id = "guest") =>
    api.get("/watchlist", { params: { user_id } }).then((r) => r.data),
  add: (ticker, note = "", user_id = "guest") =>
    api.post("/watchlist", { user_id, ticker, note }).then((r) => r.data),
  remove: (ticker, user_id = "guest") =>
    api.delete(`/watchlist/${ticker}`, { params: { user_id } }).then((r) => r.data),
};

export const Portfolio = {
  list: (user_id = "guest") =>
    api.get("/portfolio", { params: { user_id } }).then((r) => r.data),
  add: (h, user_id = "guest") =>
    api.post("/portfolio", { user_id, ...h }).then((r) => r.data),
  remove: (ticker, user_id = "guest") =>
    api.delete(`/portfolio/${ticker}`, { params: { user_id } }).then((r) => r.data),
};

export const Alerts = {
  list: (user_id = "guest") =>
    api.get("/alerts", { params: { user_id } }).then((r) => r.data),
  add: (a, user_id = "guest") =>
    api.post("/alerts", { user_id, ...a }).then((r) => r.data),
  remove: (id) => api.delete(`/alerts/${id}`).then((r) => r.data),
  check: (user_id = "guest") =>
    api.post(`/alerts/check`, null, { params: { user_id } }).then((r) => r.data),
};
