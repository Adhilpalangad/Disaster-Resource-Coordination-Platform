import React, { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard } from "lucide-react";
import Footer from "./Footer.js";
import ThemeToggle from "../components/ThemeToggle.js";
import ProfileDropdown from "../components/ProfileDropdown.js";
import Logo from "../components/Logo.js";
import { useAuth } from "../context/AuthContext.js";

const NAV_LINKS = [
  { to: "/home", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const PublicLayout: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, getDashboardPath, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    fontSize: "14px",
    fontWeight: 500,
    color: isActive ? "var(--primary)" : "var(--secondary)",
    textDecoration: "none",
    padding: "6px 2px",
    borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
    transition: "color 0.15s, border-color 0.15s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      {/* ── 21st.app Floating Pill Header ───────────────────────────────── */}
      <div style={{ position: "sticky", top: "16px", zIndex: 50, padding: "0 16px" }}>
        <header
          style={{
            maxWidth: "880px",
            margin: "0 auto",
            height: "56px",
            backgroundColor: "var(--card-bg)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--border)",
            borderRadius: "99px",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: scrolled ? "0 14px 40px rgba(0,0,0,0.22)" : "0 10px 30px rgba(0,0,0,0.12)",
            transition: "all 0.25s ease",
          }}
        >
          {/* Brand */}
          <Logo to="/home" height={30} showText={true} />

          {/* Desktop Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "24px" }} className="public-nav-desktop">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} style={navLinkStyle}>{l.label}</NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }} className="public-nav-desktop">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    fontWeight: 700,
                    fontFamily: "var(--heading)",
                    color: "var(--text-h)",
                    textDecoration: "none",
                    padding: "8px 18px",
                    borderRadius: "99px",
                    border: "none",
                    backgroundColor: "var(--bg)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                <ProfileDropdown />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    fontFamily: "var(--heading)",
                    color: "var(--text-h)",
                    textDecoration: "none",
                    padding: "8px 18px",
                    borderRadius: "99px",
                    border: "none",
                    backgroundColor: "var(--bg)",
                    transition: "all 0.15s ease",
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    fontFamily: "var(--heading)",
                    color: "#ffffff",
                    backgroundColor: "var(--primary)",
                    textDecoration: "none",
                    padding: "8px 20px",
                    borderRadius: "99px",
                    border: "none",
                    boxShadow: "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "none", border: "none", color: "var(--secondary)", cursor: "pointer", padding: "4px", display: "none" }}
            className="public-nav-mobile-btn"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <div
          className="public-nav-mobile"
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            zIndex: 49,
            backgroundColor: "var(--card-bg)",
            borderBottom: "1px solid var(--border)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                fontSize: "15px",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--primary)" : "var(--text-h)",
                textDecoration: "none",
                padding: "8px 0",
                borderBottom: "1px solid var(--border)",
              })}
            >
              {l.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileOpen(false)}
                style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: "9px", border: "1px solid var(--border)", color: "var(--text-h)", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}
              >
                Dashboard
              </Link>
              <button
                onClick={() => { setMobileOpen(false); logout(); navigate("/login"); }}
                style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: "9px", border: "none", backgroundColor: "var(--danger)", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: "9px", border: "1px solid var(--border)", color: "var(--text-h)", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: "9px", backgroundColor: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;
