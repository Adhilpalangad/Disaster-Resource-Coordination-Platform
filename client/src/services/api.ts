import axios from "axios";

// ─── Axios Instance ────────────────────────────────────────────────────────────
// Base URL reads from the Vite env variable VITE_API_URL.
// Set it in .env.local for local dev: VITE_API_URL=http://localhost:5000/api
// Falls back to /api for production (same-origin proxy).

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ── Request interceptor — attach JWT from localStorage ─────────────────────────
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("disaster_auth");
    if (stored) {
      const parsed = JSON.parse(stored) as { token: string };
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch {
    // ignore malformed storage
  }
  return config;
});

// ── Response interceptor — handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("disaster_auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
