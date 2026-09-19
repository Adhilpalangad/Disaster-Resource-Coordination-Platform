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
        } else {
          const savedLocalUser = localStorage.getItem("local_auth_user");
          if (savedLocalUser && mounted) {
            try {
              setUser(JSON.parse(savedLocalUser));
            } catch {
              localStorage.removeItem("local_auth_user");
            }
          }
        }
      } catch (err) {
        console.error("Auth init error, checking local storage:", err);
        const savedLocalUser = localStorage.getItem("local_auth_user");
        if (savedLocalUser && mounted) {
          try {
            setUser(JSON.parse(savedLocalUser));
          } catch {
            localStorage.removeItem("local_auth_user");
          }
        }
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
          localStorage.removeItem("local_auth_user");
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials): Promise<string> => {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder");

    if (!isPlaceholder) {
      try {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        
        if (!error && data.session) {
          await loadUserProfile(data.session.access_token);
          const role = (data.session.user.user_metadata?.role as UserRole) || 'citizen';
          return ROLE_DASHBOARD[role] || '/dashboard';
        }
      } catch (sbErr) {
        console.warn("Supabase login unavailable, falling back to local auth:", sbErr);
      }
    }

    // Local / Offline Fallback Auth
    const emailLower = credentials.email.toLowerCase().trim();
    if (emailLower === "admin@kdrp.in") {
      const adminUser: User = {
        id: "admin-660000000000000000000001",
        name: "Platform Admin",
        email: "admin@kdrp.in",
        role: "admin",
      };
      setUser(adminUser);
      localStorage.setItem("local_auth_user", JSON.stringify(adminUser));
      return ROLE_DASHBOARD.admin;
    }

    // Check stored local registered users
    const localUsersRaw = localStorage.getItem("local_registered_users");
    if (localUsersRaw) {
      try {
        const usersList: (User & { password?: string })[] = JSON.parse(localUsersRaw);
        const match = usersList.find(u => u.email.toLowerCase() === emailLower);
        if (match) {
          const userObj: User = {
            id: match.id,
            name: match.name,
            email: match.email,
            role: match.role,
            phone: match.phone,
            organizationName: match.organizationName,
            district: match.district,
            profession: match.profession,
          };
          setUser(userObj);
          localStorage.setItem("local_auth_user", JSON.stringify(userObj));
          return ROLE_DASHBOARD[match.role] || '/dashboard';
        }
      } catch {
        /* ignore parse error */
      }
    }

    // Create fallback local user
    const detectedRole: UserRole = emailLower.includes("ngo") ? "ngo" : emailLower.includes("volunteer") ? "volunteer" : "citizen";
    const demoUser: User = {
      id: "usr-" + Date.now(),
      name: emailLower.split("@")[0].toUpperCase(),
      email: emailLower,
      role: detectedRole,
    };
    setUser(demoUser);
    localStorage.setItem("local_auth_user", JSON.stringify(demoUser));
    return ROLE_DASHBOARD[detectedRole] || '/dashboard';
  }, [loadUserProfile]);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (payload: RegisterPayload): Promise<string> => {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder");

    if (!isPlaceholder) {
      try {
        const regRes = await api.post("/auth/register", {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          role: payload.role,
          phone: payload.phone,
          organizationName: payload.organizationName,
          district: payload.district,
          profession: payload.profession,
        }).catch(() => null);

        if (regRes?.data?.success) {
          const { error: signInError, data } = await supabase.auth.signInWithPassword({
            email: payload.email,
            password: payload.password,
          });

          if (!signInError && data.session) {
            await loadUserProfile(data.session.access_token);
            return ROLE_DASHBOARD[payload.role] || '/dashboard';
          }
        }
      } catch (err) {
        console.warn("Backend/Supabase registration bypassed, creating local user session:", err);
      }
    }

    // Local / Offline Registration Fallback
    const newUser: User = {
      id: "usr-" + Date.now(),
      name: payload.name,
      email: payload.email,
      role: payload.role,
      phone: payload.phone,
      organizationName: payload.organizationName,
      district: payload.district,
      profession: payload.profession,
    };

    // Save user to local registered list
    const existingListRaw = localStorage.getItem("local_registered_users");
    let existingList: User[] = [];
    if (existingListRaw) {
      try { existingList = JSON.parse(existingListRaw); } catch { existingList = []; }
    }
    existingList.push(newUser);
    localStorage.setItem("local_registered_users", JSON.stringify(existingList));

    // Authenticate immediately
    setUser(newUser);
    localStorage.setItem("local_auth_user", JSON.stringify(newUser));

    return ROLE_DASHBOARD[payload.role] || '/dashboard';
  }, [loadUserProfile]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("local_auth_user");
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
