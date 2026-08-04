import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import SearchBar from "../../components/SearchBar.js";
import FilterBar from "../../components/FilterBar.js";
import { Link } from "react-router-dom";
import { MapPin, Users, AlertTriangle } from "lucide-react";

export const Disasters: React.FC = () => {
  const disasters = [
    {
      id: "disaster-2026-1",
      title: "Kerala Flood Relief Campaign 2026",
      type: "Flood",
      location: "Northern Districts (Wayanad & Calicut)",
      severity: "high",
      status: "verified",
      affectedCount: "15,400+",
      date: "Aug 2026",
    },
    {
      id: "disaster-2026-2",
      title: "Cyclone Wayanad Coastal Operations",
      type: "Cyclone",
      location: "Coastal Belt Sector 2",
      severity: "high",
      status: "verified",
      affectedCount: "8,200+",
      date: "Aug 2026",
    },
    {
      id: "disaster-2026-3",
      title: "Landslide Sector B Relief Initiative",
      type: "Landslide",
      location: "Hill Region Sector 4",
      severity: "medium",
      status: "pending",
      affectedCount: "2,100+",
      date: "Aug 2026",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Disaster Relief Campaigns"
        description="Active disaster initiatives requiring emergency resource coordination and volunteer dispatch."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Disasters" }]}
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <SearchBar value="" onChange={() => {}} placeholder="Search disaster campaigns..." />
        <FilterBar
          options={[
            { label: "All Campaigns", value: "all" },
            { label: "High Severity", value: "high" },
            { label: "Active Only", value: "active" },
          ]}
          selected="all"
          onChange={() => {}}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
        {disasters.map((disaster) => (
          <Card key={disaster.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <StatusBadge status={disaster.status} label={disaster.status === "verified" ? "Active Response" : "Pending Verification"} />
              <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600 }}>{disaster.date}</span>
            </div>

            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "var(--text-h)" }}>
              {disaster.title}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "16px 0", fontSize: "13px", color: "var(--secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={16} style={{ color: "var(--primary)" }} /> {disaster.location}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={16} style={{ color: "var(--primary)" }} /> Affected Citizens: {disaster.affectedCount}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={16} style={{ color: disaster.severity === "high" ? "var(--danger)" : "var(--warning)" }} /> Severity: {disaster.severity.toUpperCase()}
              </div>
            </div>

            <Link
              to={`/disasters/${disaster.id}`}
              style={{
                display: "block",
                textAlign: "center",
                padding: "10px",
                borderRadius: "8px",
                backgroundColor: "rgba(2, 132, 199, 0.08)",
                border: "1px solid rgba(2, 132, 199, 0.2)",
                color: "var(--primary)",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              View Campaign Details →
            </Link>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

export default Disasters;
