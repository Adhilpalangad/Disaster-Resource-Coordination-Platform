import React, { useState, useEffect } from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import { useAuth } from "../../context/AuthContext.js";
import { User, Bell, Moon, Sun, Shield, Save, Check } from "lucide-react";

export const Settings: React.FC = () => {
  const { user } = useAuth();

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark" ||
      document.documentElement.classList.contains("dark-theme");
  });

  const [emailAlerts, setEmailAlerts] = useState<boolean>(() => {
    return localStorage.getItem("pref_email_alerts") !== "false";
  });

  const [smsAlerts, setSmsAlerts] = useState<boolean>(() => {
    return localStorage.getItem("pref_sms_alerts") === "true";
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSavePreferences = () => {
    localStorage.setItem("pref_email_alerts", String(emailAlerts));
    localStorage.setItem("pref_sms_alerts", String(smsAlerts));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <PageContainer maxWidth="800px">
      <PageHeader
        title="Application Settings"
        description="Manage your account profile, notification alerts, display preferences, and session security."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Settings" }]}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Account Profile Card */}
        <Card title="Account Profile Summary">
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "rgba(2, 132, 199, 0.1)",
                color: "var(--primary, #0284C7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              <User size={26} />
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-h, #0F172A)" }}>
                {user?.name || "Authenticated User"}
              </div>
              <div style={{ fontSize: "13px", color: "var(--secondary, #64748B)" }}>
                {user?.email || "No email linked"}
              </div>
              <div style={{ marginTop: "4px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    backgroundColor: "rgba(2, 132, 199, 0.1)",
                    color: "var(--primary, #0284C7)",
                  }}
                >
                  Role: {user?.role || "Citizen"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
            <div style={{ padding: "10px 12px", backgroundColor: "var(--bg, #F8FAFC)", borderRadius: "8px" }}>
              <span style={{ color: "var(--secondary, #64748B)" }}>Assigned District:</span>{" "}
              <strong style={{ color: "var(--text-h, #0F172A)" }}>{user?.district || "Statewide"}</strong>
            </div>
            {user?.organizationName && (
              <div style={{ padding: "10px 12px", backgroundColor: "var(--bg, #F8FAFC)", borderRadius: "8px" }}>
                <span style={{ color: "var(--secondary, #64748B)" }}>Organization:</span>{" "}
                <strong style={{ color: "var(--text-h, #0F172A)" }}>{user.organizationName}</strong>
              </div>
            )}
            {user?.phone && (
              <div style={{ padding: "10px 12px", backgroundColor: "var(--bg, #F8FAFC)", borderRadius: "8px" }}>
                <span style={{ color: "var(--secondary, #64748B)" }}>Contact Phone:</span>{" "}
                <strong style={{ color: "var(--text-h, #0F172A)" }}>{user.phone}</strong>
              </div>
            )}
          </div>
        </Card>

        {/* Display & Notification Preferences Card */}
        <Card title="Notification & Display Preferences">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Theme Toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                border: "1px solid var(--border, #E2E8F0)",
                borderRadius: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {darkMode ? <Moon size={20} color="#F59E0B" /> : <Sun size={20} color="#0284C7" />}
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-h, #0F172A)" }}>
                    Dark Theme Mode
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--secondary, #64748B)" }}>
                    Switch between high-contrast dark mode and standard light theme.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
            </div>

            {/* Email Alerts Toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                border: "1px solid var(--border, #E2E8F0)",
                borderRadius: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Bell size={20} color="#10B981" />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-h, #0F172A)" }}>
                    Email Notifications
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--secondary, #64748B)" }}>
                    Receive automated email alerts on relief request status updates.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
            </div>

            {/* SMS Alerts Toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                border: "1px solid var(--border, #E2E8F0)",
                borderRadius: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Bell size={20} color="#8B5CF6" />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-h, #0F172A)" }}>
                    Critical Emergency SMS Alerts
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--secondary, #64748B)" }}>
                    Receive instant mobile SMS alerts when critical disaster declarations occur.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <button
              onClick={handleSavePreferences}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                borderRadius: "8px",
                backgroundColor: saved ? "var(--success, #059669)" : "var(--primary, #0284C7)",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: "13px",
                border: "none",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? "Preferences Saved" : "Save Preferences"}
            </button>
          </div>
        </Card>

        {/* Security & Authentication Options */}
        <Card title="Security & Credentials">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <Shield size={20} color="#0284C7" />
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-h, #0F172A)" }}>
                Authentication Provider
              </div>
              <div style={{ fontSize: "12px", color: "var(--secondary, #64748B)" }}>
                Secured via Supabase JWT Authentication & RBAC Access Control.
              </div>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "var(--secondary, #64748B)", margin: 0 }}>
            To update your password or authentication credentials, please use the account recovery option on the login screen or contact your organization administrator.
          </p>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Settings;
