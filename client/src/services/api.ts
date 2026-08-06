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
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
