import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Home,
  Package,
  Users,
  Bell,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  Shield,
  Building2,
  Sliders,
  UserCheck,
  PlusCircle,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import type { UserRole } from "../types/index.js";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  citizen: [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Active Disasters", path: "/disasters", icon: <AlertTriangle size={18} /> },
    { label: "My Requests", path: "/requests", icon: <FileText size={18} /> },
    { label: "Submit Request", path: "/requests/create", icon: <PlusCircle size={18} /> },
    { label: "Shelters", path: "/shelters", icon: <Home size={18} /> },
    { label: "Notifications", path: "/notifications", icon: <Bell size={18} /> },
    { label: "Profile", path: "/profile", icon: <User size={18} /> },
    { label: "Help Center", path: "/help", icon: <HelpCircle size={18} /> },
  ],
  ngo: [
    { label: "NGO Console", path: "/ngo/dashboard", icon: <Building2 size={18} /> },
    { label: "Verification Queue", path: "/ngo/requests", icon: <FileText size={18} /> },
    { label: "Assignments", path: "/assignments", icon: <UserCheck size={18} /> },
    { label: "Inventory", path: "/inventory", icon: <Package size={18} /> },
    { label: "Shelters", path: "/shelters", icon: <Home size={18} /> },
    { label: "Reports", path: "/reports", icon: <BarChart3 size={18} /> },
    { label: "Notifications", path: "/notifications", icon: <Bell size={18} /> },
    { label: "Profile", path: "/profile", icon: <User size={18} /> },
    { label: "Settings", path: "/settings", icon: <Settings size={18} /> },
  ],
  volunteer: [
    { label: "Workstation", path: "/volunteer/dashboard", icon: <Users size={18} /> },
    { label: "My Tasks", path: "/volunteer/tasks", icon: <ClipboardList size={18} /> },
    { label: "Notifications", path: "/notifications", icon: <Bell size={18} /> },
    { label: "Profile", path: "/profile", icon: <User size={18} /> },
    { label: "Help Center", path: "/help", icon: <HelpCircle size={18} /> },
  ],
  admin: [
    { label: "Admin Dashboard", path: "/admin/dashboard", icon: <Shield size={18} /> },
    { label: "Manage Users", path: "/admin/users", icon: <Users size={18} /> },
    { label: "Manage NGOs", path: "/admin/ngos", icon: <Building2 size={18} /> },
    { label: "Manage Volunteers", path: "/admin/volunteers", icon: <UserCheck size={18} /> },
    { label: "Manage Disasters", path: "/admin/disasters", icon: <AlertTriangle size={18} /> },
    { label: "Manage Resources", path: "/admin/resources", icon: <Package size={18} /> },
    { label: "Manage Duplicates", path: "/admin/duplicates", icon: <AlertTriangle size={18} /> },
    { label: "Analytics", path: "/admin/analytics", icon: <BarChart3 size={18} /> },
    { label: "System Settings", path: "/admin/settings", icon: <Sliders size={18} /> },
  ],
};

const ROLE_LABEL: Record<UserRole, string> = {
  citizen: "Citizen",
  ngo: "NGO Representative",
  volunteer: "Volunteer",
  admin: "Administrator",
};

const BRAND_HOME: Record<UserRole, string> = {
  citizen: "/dashboard",
  ngo: "/ngo/dashboard",
  volunteer: "/volunteer/dashboard",
  admin: "/admin/dashboard",
};

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const role: UserRole = user?.role ?? "citizen";
  const navItems = NAV_ITEMS[role];

  const sidebarContent = (
    <aside
      style={{
        width: "260px",
        height: "100%",
        backgroundColor: "var(--card-bg, #FFFFFF)",
        borderRight: "1px solid var(--border, #E2E8F0)",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Brand */}
      <div
        style={{
          height: "64px",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--border, #E2E8F0)",
        }}
      >
        <Link
          to={BRAND_HOME[role]}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text-h, #0F172A)",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "var(--primary, #0284C7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            <Shield size={18} />
          </div>
          <span>Disaster Platform</span>
        </Link>
      </div>

      {/* Role badge */}
      <div
        style={{
          padding: "10px 20px",
          borderBottom: "1px solid var(--border, #E2E8F0)",
          backgroundColor: "var(--bg, #F8FAFC)",
        }}
      >
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
          Signed in as
        </div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>
          {user?.name ?? "Guest"}
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: "4px",
            padding: "2px 8px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 600,
            backgroundColor:
              role === "admin" ? "rgba(220,38,38,0.1)" :
              role === "ngo" ? "rgba(124,58,237,0.1)" :
              role === "volunteer" ? "rgba(5,150,105,0.1)" :
              "rgba(2,132,199,0.1)",
            color:
              role === "admin" ? "#DC2626" :
              role === "ngo" ? "#7C3AED" :
              role === "volunteer" ? "#059669" :
              "#0284C7",
          }}
        >
          {ROLE_LABEL[role]}
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#94A3B8",
            letterSpacing: "0.5px",
            padding: "0 12px 8px",
            textTransform: "uppercase",
          }}
        >
          Navigation
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname === item.path ||
                  location.pathname.startsWith(item.path + "/");

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--primary, #0284C7)" : "var(--secondary, #475569)",
                  backgroundColor: isActive ? "rgba(2, 132, 199, 0.08)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ color: isActive ? "var(--primary, #0284C7)" : "#64748B", flexShrink: 0 }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="app-sidebar-desktop">{sidebarContent}</div>

      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            zIndex: 999,
            display: "flex",
          }}
          onClick={onCloseMobile}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ height: "100%" }}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
