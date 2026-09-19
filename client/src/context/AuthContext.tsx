import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { User, UserRole, LoginCredentials, RegisterPayload } from "../types/index.js";
import { supabase } from "../lib/supabase.js";
import api from "../services/api.js";

// ─── Context Shape ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<string>;
  register: (payload: RegisterPayload) => Promise<string>;
  logout: () => Promise<void>;
  getDashboardPath: () => string;
}

const ROLE_DASHBOARD: Record<UserRole, string> = {
  citizen: "/dashboard",
  ngo: "/ngo/dashboard",
  volunteer: "/volunteer/dashboard",
  admin: "/admin/dashboard",
};

// ─── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // supabase.auth.signInWithPassword() fires the onAuthStateChange "SIGNED_IN"
  // listener below AND login()/register() also call loadUserProfile() directly for
  // the same token — without de-duping, both run concurrently. For a brand-new user
  // (no Mongo profile yet) both hit the 404-then-/auth/sync path at once; one sync
  // call wins, the other hits a duplicate-key error and calls setUser(null). Whichever
  // call happens to resolve last wins the race, so a successful login was
  // intermittently getting silently undone. Caching the in-flight promise per token
  // makes concurrent callers share one execution instead of racing.
  const inFlightProfileLoad = useRef<{ token: string; promise: Promise<void> } | null>(null);

  const loadUserProfile = useCallback((accessToken: string): Promise<void> => {
    if (inFlightProfileLoad.current?.token === accessToken) {
      return inFlightProfileLoad.current.promise;
    }

    const promise = (async () => {
      try {
        setToken(accessToken);
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        // Normalise: server returns `_id` from Mongoose; ensure `id` is always a string
        // Normalise: server always sends id, but guard against _id-only responses
        const raw = res.data.data;
        setUser({ ...raw, id: raw.id ?? raw._id });
      } catch (error: unknown) {
        // If profile not found (404), the user exists in Supabase but not MongoDB.
        // This can happen if email confirmation was required and sync was skipped.
        // Auto-sync with minimal data so the user can at least log in.
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          try {
            const { data: { user: sbUser } } = await supabase.auth.getUser();
            if (sbUser) {
              await api.post(
                "/auth/sync",
                {
                  name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
                  email: sbUser.email,
                  role: sbUser.user_metadata?.role || 'citizen',
                  phone: sbUser.user_metadata?.phone,
                  organizationName: sbUser.user_metadata?.organizationName,
                  district: sbUser.user_metadata?.district,
                  profession: sbUser.user_metadata?.profession,
                },
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
              const retry = await api.get("/auth/me", {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              const retryRaw = retry.data.data;
              setUser({ ...retryRaw, id: retryRaw.id ?? retryRaw._id });
              return;
            }
          } catch (syncErr) {
            console.error("Auto-sync failed:", syncErr);
          }
        }
        console.error("Failed to load user profile:", error);
        setUser(null);
        setToken(null);
      }
    })();

    inFlightProfileLoad.current = { token: accessToken, promise };
    return promise;
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          await loadUserProfile(session.access_token);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (event === "SIGNED_IN" && session) {
          await loadUserProfile(session.access_token);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setToken(null);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials): Promise<string> => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (data.session) {
      await loadUserProfile(data.session.access_token);
      // Read user data from the session/metadata since state may not be updated yet
      const role = (data.session.user.user_metadata?.role as UserRole) || 'citizen';
      return ROLE_DASHBOARD[role] || '/dashboard';
    }
    return '/dashboard';
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  // Uses the backend admin API endpoint to create users with email auto-confirmed.
  // This bypasses Supabase email confirmation completely.
  const register = useCallback(async (payload: RegisterPayload): Promise<string> => {
    // Step 1: Create user on backend (uses Supabase admin API — auto confirms email)
    const regRes = await api.post("/auth/register", {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      phone: payload.phone,
      organizationName: payload.organizationName,
      district: payload.district,
      profession: payload.profession,
    });

    if (!regRes.data.success) {
      throw new Error(regRes.data.message || "Registration failed.");
    }

    // Step 2: Sign in to get a session token (user is now confirmed)
    const { error: signInError, data } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (signInError) {
      throw new Error(signInError.message);
    }

    if (data.session) {
      await loadUserProfile(data.session.access_token);
    }

    // Return the role-specific dashboard path
    return ROLE_DASHBOARD[payload.role] || '/dashboard';
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
  }, []);

  const getDashboardPath = useCallback(() => {
    if (!user) return "/login";
    return ROLE_DASHBOARD[user.role];
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export default AuthContext;
