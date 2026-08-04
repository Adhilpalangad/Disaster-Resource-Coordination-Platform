import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { User, UserRole, LoginCredentials, RegisterPayload } from "../types/index.js";

// ─── Context Shape ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  getDashboardPath: () => string;
}

// ─── Demo Accounts ─────────────────────────────────────────────────────────────
// These are used for local development / UI structure testing.
// When the backend auth is ready, replace login() and register() with real API calls.

const DEMO_ACCOUNTS: Record<string, User & { password: string }> = {
  "citizen@demo.com": {
    id: "demo-citizen-001",
    name: "Riya Menon",
    email: "citizen@demo.com",
    role: "citizen",
    phone: "+91 98765 43210",
    password: "demo1234",
  },
  "ngo@demo.com": {
    id: "demo-ngo-001",
    name: "Arjun Nair",
    email: "ngo@demo.com",
    role: "ngo",
    organizationName: "Kerala Relief Foundation",
    phone: "+91 98765 11111",
    password: "demo1234",
  },
  "volunteer@demo.com": {
    id: "demo-volunteer-001",
    name: "Sneha Pillai",
    email: "volunteer@demo.com",
    role: "volunteer",
    phone: "+91 98765 22222",
    password: "demo1234",
  },
  "admin@demo.com": {
    id: "demo-admin-001",
    name: "Admin User",
    email: "admin@demo.com",
    role: "admin",
    password: "demo1234",
  },
};

const ROLE_DASHBOARD: Record<UserRole, string> = {
  citizen: "/dashboard",
  ngo: "/ngo/dashboard",
  volunteer: "/volunteer/dashboard",
  admin: "/admin/dashboard",
};

const STORAGE_KEY = "disaster_auth";

// ─── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { user: User; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = (user: User, token: string) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    setUser(user);
    setToken(token);
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  // TODO: Replace this with a real API call when backend auth is ready:
  //   const response = await api.post<ApiResponse<{ user: User; token: string }>>("/auth/login", credentials);
  //   persist(response.data.data.user, response.data.data.token);
  const login = useCallback(async (credentials: LoginCredentials) => {
    const demo = DEMO_ACCOUNTS[credentials.email];
    if (!demo || demo.password !== credentials.password) {
      throw new Error("Invalid email or password.");
    }
    const { password: _pw, ...userWithoutPassword } = demo;
    void _pw;
    const mockToken = `mock-jwt-${userWithoutPassword.role}-${Date.now()}`;
    persist(userWithoutPassword, mockToken);
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  // TODO: Replace with real API call:
  //   const response = await api.post<ApiResponse<{ user: User; token: string }>>("/auth/register", payload);
  //   persist(response.data.data.user, response.data.data.token);
  const register = useCallback(async (payload: RegisterPayload) => {
    const { password: _pw, ...rest } = payload;
    void _pw;
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: rest.name,
      email: rest.email,
      role: rest.role,
      phone: rest.phone,
      organizationName: rest.organizationName,
    };
    const mockToken = `mock-jwt-${newUser.role}-${Date.now()}`;
    persist(newUser, mockToken);
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
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
