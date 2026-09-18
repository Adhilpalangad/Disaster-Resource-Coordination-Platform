import React, { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { Shield, Menu, X, LayoutDashboard } from "lucide-react";
import Footer from "./Footer.js";
import ThemeToggle from "../components/ThemeToggle.js";
import ProfileDropdown from "../components/ProfileDropdown.js";
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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "var(--bg)" }}>

      {/* ── Sticky Header ───────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: "64px",
          backgroundColor: "var(--card-bg)",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "box-shadow 0.2s ease",
          boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
        }}
      >
        {/* Brand */}
        <Link
          to="/home"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "var(--primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Shield size={17} />
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-h)" }}>
            DisasterPlatform
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "28px" }} className="public-nav-desktop">
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
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--text-h)",
                  textDecoration: "none",
                  padding: "7px 16px",
                  borderRadius: "9px",
                  border: "1px solid var(--border)",
                  transition: "border-color 0.15s, background-color 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--primary)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; }}
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <ProfileDropdown />
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--text-h)",
                  textDecoration: "none",
                  padding: "7px 16px",
                  borderRadius: "9px",
                  border: "1px solid var(--border)",
                  transition: "border-color 0.15s, background-color 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--primary)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  backgroundColor: "var(--primary)",
                  textDecoration: "none",
                  padding: "7px 16px",
                  borderRadius: "9px",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--primary-hover)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--primary)"; }}
              >
                Get Started
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
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

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
