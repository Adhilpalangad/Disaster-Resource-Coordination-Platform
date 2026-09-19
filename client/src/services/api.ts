import axios from "axios";
import { supabase } from "../lib/supabase.js";

// ─── Axios Instance ────────────────────────────────────────────────────────────
// Base URL reads from the Vite env variable VITE_API_URL.
// Set it in .env.local for local dev: VITE_API_URL=http://localhost:5000/api
// Falls back to /api for production (same-origin proxy).

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ── Request interceptor — attach JWT from Supabase ─────────────────────────
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error("Error getting supabase session for request:", error);
  }
  return config;
});

// ── Response interceptor — handle 401 globally ────────────────────────────────
// A single 401 is not necessarily proof the session is dead — it can also mean a
// transient hiccup verifying the token server-side, or a request that raced ahead
// of session hydration by a few milliseconds. Nuking the session on every 401
// unconditionally turned rare transient failures into "logged in, then instantly
// logged back out" for the user. Now we try exactly one silent refresh + retry
// before giving up, and only force sign-out if the session is genuinely invalid.
let refreshPromise: Promise<boolean> | null = null;

function refreshSessionOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = supabase.auth
      .refreshSession()
      .then(({ data, error }) => !error && !!data.session)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const config = error.config as (typeof error.config & { _retriedAfterRefresh?: boolean }) | undefined;
      const onLoginPage = window.location.pathname === "/login";

      if (config && !config._retriedAfterRefresh && !onLoginPage) {
        config._retriedAfterRefresh = true;
        const refreshed = await refreshSessionOnce();
        if (refreshed) {
          return api(config); // retry the original request once with the fresh token
        }
      }

      // Refresh failed, or we already retried once — the session really is invalid.
      await supabase.auth.signOut();
      if (!onLoginPage) window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
