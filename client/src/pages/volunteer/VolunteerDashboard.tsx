import React from "react";
import {
  MapPin,
  CheckCircle2,
  Navigation,
  Clock,
  Package,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import EmptyState from "../../components/EmptyState.js";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";

const tasks = [
  {
    id: "TASK-104",
    reqId: "REQ-8492",
    title: "Deliver 50 Water Cans & Meal Packs",
    address: "Community Hall, Sector 4, Wayanad",
    urgency: "high",
    status: "in_progress",
    ngo: "Red Cross Disaster Operations",
    category: "food",
    assignedAt: "1 hr ago",
  },
  {
    id: "TASK-108",
    reqId: "REQ-8510",
    title: "Distribute First Aid & Medicine Kits",
    address: "Relief Camp 2, Calicut Road",
    urgency: "medium",
    status: "pending",
    ngo: "Kerala Relief Alliance",
    category: "medical",
    assignedAt: "3 hr ago",
  },
];

const URGENCY_COLOR: Record<string, string> = {
  high: "var(--danger)",
  medium: "var(--warning)",
  low: "var(--success)",
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  food: <Package size={16} />,
  medical: <AlertTriangle size={16} />,
};

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();

  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const pending = tasks.filter((t) => t.status === "pending");
  const completed: typeof tasks = [];

  return (
    <PageContainer>
      <PageHeader
        title={`Volunteer Workstation`}
        description={`Welcome, ${user?.name?.split(" ")[0] ?? "there"}. Here are your assigned delivery tasks.`}
        actions={
          <Link
            to="/notifications"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-h)",
              fontWeight: 600,
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            Notifications
          </Link>
        }
      />

      {/* Summary strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
        marginBottom: "24px",
      }}>
        {[
          { label: "In Progress", value: inProgress.length, color: "var(--primary)" },
          { label: "Assigned / Pending", value: pending.length, color: "var(--warning)" },
          { label: "Completed Today", value: completed.length, color: "var(--success)" },
        ].map((s) => (
          <div key={s.label} style={{
            backgroundColor: "var(--card-bg)",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            padding: "16px 20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "26px", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.4px", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Task Cards */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={40} />}
          title="No tasks assigned yet"
          description="Your NGO will assign delivery tasks when a verified request needs a volunteer responder."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                backgroundColor: "var(--card-bg)",
                borderRadius: "14px",
                border: `1px solid ${task.status === "in_progress" ? "rgba(2,132,199,0.35)" : "var(--border)"}`,
                padding: "20px 24px",
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
              }}
            >
              {/* Left: urgency stripe */}
              <div style={{
                width: "4px",
                borderRadius: "4px",
                backgroundColor: URGENCY_COLOR[task.urgency],
                alignSelf: "stretch",
                flexShrink: 0,
              }} />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                  <StatusBadge status={task.status} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--secondary)" }}>{task.id}</span>
                  <span style={{ fontSize: "12px", color: "var(--secondary)" }}>·</span>
                  <span style={{ fontSize: "12px", color: "var(--secondary)" }}>Assigned {task.assignedAt}</span>
                </div>

                <h3 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: 700, color: "var(--text-h)" }}>
                  {task.title}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", color: "var(--secondary)" }}>
                    <MapPin size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    {task.address}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", color: "var(--secondary)" }}>
                    <span style={{ color: "var(--secondary)" }}>{CATEGORY_ICON[task.category] ?? <Package size={14} />}</span>
                    Dispatched by <strong style={{ color: "var(--text-h)" }}>&nbsp;{task.ngo}</strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                {task.status === "in_progress" ? (
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      borderRadius: "9px",
                      backgroundColor: "var(--success)",
                      color: "#fff",
                      border: "none",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <CheckCircle2 size={15} /> Mark Complete
                  </button>
                ) : (
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      borderRadius: "9px",
                      backgroundColor: "var(--primary)",
                      color: "#fff",
                      border: "none",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Navigation size={15} /> Start Task
                  </button>
                )}
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 18px",
                    borderRadius: "9px",
                    border: "1px solid var(--border)",
                    backgroundColor: "transparent",
                    color: "var(--secondary)",
                    fontWeight: 500,
                    fontSize: "12px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    justifyContent: "center",
                  }}
                >
                  <Clock size={13} /> Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <Link
          to="/volunteer/tasks"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--primary)",
            textDecoration: "none",
          }}
        >
          View All Tasks <ArrowRight size={14} />
        </Link>
      </div>
    </PageContainer>
  );
};

export default VolunteerDashboard;
