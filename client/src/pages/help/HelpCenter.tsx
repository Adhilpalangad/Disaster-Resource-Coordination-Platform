import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Home, Building2, HandHelping, ShieldCheck, LifeBuoy, Mail, HelpCircle } from "lucide-react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import SearchBar from "../../components/SearchBar.js";
import EmptyState from "../../components/EmptyState.js";
import { useAuth } from "../../context/AuthContext.js";
import type { UserRole } from "../../types/index.js";

type RoleFilter = UserRole | "all";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  roles: RoleFilter[]; // "all" applies regardless of the selected role filter
}

interface FaqSection {
  id: string;
  title: string;
  items: FaqItem[];
}

const ROLE_META: Record<RoleFilter, { label: string; icon: React.ElementType; bg: string; color: string }> = {
  all:       { label: "All Roles", icon: LifeBuoy,    bg: "rgba(2,132,199,0.1)",  color: "#0284C7" },
  citizen:   { label: "Citizen",   icon: Home,        bg: "rgba(2,132,199,0.1)",  color: "#0284C7" },
  ngo:       { label: "NGO",       icon: Building2,   bg: "rgba(124,58,237,0.1)", color: "#7C3AED" },
  volunteer: { label: "Volunteer", icon: HandHelping, bg: "rgba(5,150,105,0.1)",  color: "#059669" },
  admin:     { label: "Admin",     icon: ShieldCheck, bg: "rgba(220,38,38,0.1)",  color: "#DC2626" },
};

const ROLE_ORDER: RoleFilter[] = ["all", "citizen", "ngo", "volunteer", "admin"];

const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "login",
    title: "Signing In & Passwords",
    items: [
      {
        id: "how-to-sign-in",
        roles: ["all"],
        question: "How do I sign in?",
        answer:
          "There's a single sign-in page for every account type — Citizen, NGO, Volunteer, and Admin. Enter the email and password you registered with; the platform reads your account's role and sends you straight to the right dashboard (Citizen → Dashboard, NGO → NGO Console, Volunteer → Workstation, Admin → Admin Console).",
      },
      {
        id: "incorrect-credentials",
        roles: ["all"],
        question: "Why do I get “Incorrect email or password”?",
        answer:
          "This means the email and password you entered don't match an account. Check for typos, extra spaces, and Caps Lock. If you're confident your password is right but it still fails, use “Forgot password?” on the sign-in page to set a new one.",
      },
      {
        id: "forgot-password",
        roles: ["all"],
        question: "I forgot my password — what do I do?",
        answer:
          "Click “Forgot password?” on the sign-in page and enter your registered email. You'll see the same “check your inbox” confirmation whether or not that email has an account — that's intentional, for privacy, so this step alone won't confirm an account exists. If you do have one, a reset link will arrive by email; open it to set a new password (minimum 6 characters).",
      },
      {
        id: "invalid-reset-link",
        roles: ["all"],
        question: "My reset link says “Invalid Link” or has expired",
        answer:
          "Reset links are single-use and time-limited. If yours no longer works, return to the Forgot Password page, request a fresh link, and open it right away.",
      },
      {
        id: "signed-up-cant-login",
        roles: ["all"],
        question: "I just registered but can't sign in",
        answer:
          "New accounts are active immediately — there's no separate email verification step, so you should be able to sign in right away with the email and password you registered. If it still fails, double-check the email for typos, or use “Forgot password?” to set a new one.",
      },
      {
        id: "unexpected-redirect",
        roles: ["all"],
        question: "Why was I redirected somewhere I didn't expect?",
        answer:
          "This happens in two specific cases. If you weren't signed in, you're sent to the sign-in page — after logging in, you're taken back to the page you originally tried to open. If you were signed in but tried to open a page belonging to a different account type (for example, a Citizen opening an NGO page), you're sent straight to your own dashboard instead, with no error message shown. Every account has exactly one fixed role, and each section of the platform only opens for its matching role — so this redirect is expected behavior, not a bug.",
      },
      {
        id: "session-expired",
        roles: ["all"],
        question: "My session keeps expiring / I keep getting logged out",
        answer:
          "Your sign-in is verified on every request. Once your session token expires, you'll be signed out automatically and sent back to the sign-in page the next time you open a page that needs one — just sign in again to continue.",
      },
    ],
  },
  {
    id: "accounts",
    title: "Registration & Account Types",
    items: [
      {
        id: "register-citizen",
        roles: ["citizen"],
        question: "What do I need to register as a Citizen?",
        answer:
          "Just your full name, email, and a password (minimum 6 characters). Phone number is optional but helps NGOs and volunteers reach you about a request.",
      },
      {
        id: "register-ngo",
        roles: ["ngo"],
        question: "What do I need to register as an NGO?",
        answer:
          "Name, email, and password, plus your Organization Name and District — both required. Your district determines which relief requests in that service area get routed to your organization.",
      },
      {
        id: "register-volunteer",
        roles: ["volunteer"],
        question: "What do I need to register as a Volunteer?",
        answer:
          "Name, email, and password, plus your District and Profession / Skills — both required. NGOs use these to match you with nearby tasks suited to your skillset.",
      },
      {
        id: "duplicate-email",
        roles: ["all"],
        question: "“An account with this email already exists” when registering",
        answer:
          "That email is already registered. Go to the sign-in page and log in instead — if you don't remember the password, use “Forgot password?” to reset it.",
      },
      {
        id: "admin-account",
        roles: ["admin"],
        question: "How do I get an Administrator account?",
        answer:
          "Administrator accounts aren't self-service — they're provisioned directly by whoever manages the platform's database. If you need admin access, contact the project maintainer.",
      },
    ],
  },
];

const TROUBLESHOOTING: { title: string; steps: string[] }[] = [
  {
    title: "Can't sign in at all",
    steps: [
      "Re-check the email and password for typos, extra spaces, or Caps Lock.",
      "Use “Forgot password?” on the sign-in page to set a new password.",
      "Not sure you ever registered? Try creating an account — you'll get an “already exists” message if you already have one.",
    ],
  },
  {
    title: "Password reset link not working",
    steps: [
      "Request a new link from the Forgot Password page — old links stop working once a new one is issued or once used.",
      "Open the new link as soon as it arrives; reset links are time-limited.",
      "Complete the reset on the same device/browser where you opened the link.",
    ],
  },
  {
    title: "Redirected to the wrong page",
    steps: [
      "Sections like the NGO Console, Volunteer Workstation, and Admin Console only open for accounts with that role.",
      "Your account has exactly one role, fixed at registration, so you'll always land on your own dashboard rather than an error page.",
      "Need a different role's tools? That requires a separate account registered under that role.",
    ],
  },
];

export const HelpCenter: React.FC = () => {
  const { user, isAuthenticated, getDashboardPath } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(user?.role ?? "all");
  const [openId, setOpenId] = useState<string | null>(null);

  const query = search.trim().toLowerCase();

  const visibleSections = useMemo(() => {
    return FAQ_SECTIONS
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const roleMatch = roleFilter === "all" || item.roles.includes("all") || item.roles.includes(roleFilter);
          if (!roleMatch) return false;
          if (!query) return true;
          return item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query);
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [roleFilter, query]);

  const hasResults = visibleSections.length > 0;

  return (
    <PageContainer>
      <PageHeader
        title="Help Center & Documentation"
        description="Guidance for signing in, registering, and troubleshooting your account — for every role on the platform."
        breadcrumbs={[
          { label: isAuthenticated ? "Overview" : "Home", path: isAuthenticated ? getDashboardPath() : "/home" },
          { label: "Help Center" },
        ]}
      />

      {/* Search + role filter toolbar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search help topics…" style={{ maxWidth: "100%" }} />
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {ROLE_ORDER.map((role) => {
            const meta = ROLE_META[role];
            const Icon = meta.icon;
            const active = roleFilter === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: `1.5px solid ${active ? meta.color : "var(--border)"}`,
                  backgroundColor: active ? meta.bg : "var(--card-bg)",
                  color: active ? meta.color : "var(--secondary)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.14s",
                }}
              >
                <Icon size={14} /> {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {!hasResults ? (
        <EmptyState
          icon={<HelpCircle size={36} />}
          title="No matching help topics"
          description="Try a different search term, or switch back to “All Roles”."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {visibleSections.map((section) => (
            <Card key={section.id} title={section.title}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {section.items.map((item) => {
                  const open = openId === item.id;
                  return (
                    <div key={item.id} style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : item.id)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          padding: "13px 16px",
                          border: "none",
                          backgroundColor: open ? "var(--bg)" : "var(--card-bg)",
                          color: "var(--text-h)",
                          fontSize: "14px",
                          fontWeight: 600,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        {item.question}
                        <ChevronDown
                          size={16}
                          style={{ flexShrink: 0, color: "var(--secondary)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                        />
                      </button>
                      {open && (
                        <div style={{ padding: "0 16px 16px", fontSize: "13px", lineHeight: 1.6, color: "var(--secondary)", backgroundColor: "var(--bg)" }}>
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Troubleshooting checklists */}
      <Card
        title="Troubleshooting Checklists"
        subtitle="Step-by-step fixes for the most common sign-in issues"
        style={{ marginTop: "20px" }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "18px" }}>
          {TROUBLESHOOTING.map((block) => (
            <div key={block.title}>
              <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 700, color: "var(--text-h)" }}>{block.title}</p>
              <ol style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {block.steps.map((step, i) => (
                  <li key={i} style={{ fontSize: "13px", color: "var(--secondary)", lineHeight: 1.5 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Card>

      {/* Contact & support */}
      <Card title="Still need help?" subtitle="Reach the coordination team directly" style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(2,132,199,0.1)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Mail size={16} />
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--secondary)", maxWidth: "420px" }}>
              Can't find what you're looking for? Send us the details on the Contact page and the coordination team will follow up.
            </p>
          </div>
          <Link
            to="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 18px",
              borderRadius: "10px",
              backgroundColor: "var(--primary)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "13px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            Contact Support
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
};

export default HelpCenter;
