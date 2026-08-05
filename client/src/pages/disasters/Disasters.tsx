import React, { useState, useEffect, useCallback } from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import SearchBar from "../../components/SearchBar.js";
import FilterBar from "../../components/FilterBar.js";
import { Link } from "react-router-dom";
import { MapPin, Users, AlertTriangle, RefreshCw } from "lucide-react";
import { disastersApi } from "../../services/disastersApi.js";
import type { Disaster } from "../../types/index.js";

const SEVERITY_COLOR: Record<string, string> = {
  low:      "var(--success)",
  moderate: "var(--warning)",
  high:     "orange",
  critical: "var(--danger)",
};

export const Disasters: React.FC = () => {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await disastersApi.getAll();
      setDisasters(data);
    } catch {
      setError("Could not load disasters. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  // Client-side filter
  const filtered = disasters.filter(d => {
    const matchSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.affectedDistrictNames.join(", ").toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all" ||
      (filter === "high" && (d.severity === "high" || d.severity === "critical")) ||
      (filter === "active" && (d.status === "active" || d.status === "monitoring"));

    return matchSearch && matchFilter;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Disaster Relief Campaigns"
        description="Active disaster initiatives requiring emergency resource coordination and volunteer dispatch."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Disasters" }]}
        actions={
          <button
            onClick={fetchAll}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", borderRadius: "8px",
              border: "1px solid var(--border)", backgroundColor: "var(--card-bg)",
              color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer",
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search disaster campaigns..." />
        <FilterBar
          options={[
            { label: "All Campaigns", value: "all" },
            { label: "High / Critical Severity", value: "high" },
            { label: "Active Only", value: "active" },
          ]}
          selected={filter}
          onChange={setFilter}
        />
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: "220px", backgroundColor: "var(--border)", borderRadius: "14px", opacity: 0.4 }} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={{
          padding: "16px 20px", borderRadius: "10px",
          backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid var(--danger)",
          color: "var(--danger)", fontSize: "14px",
        }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px 24px",
          backgroundColor: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--border)",
        }}>
          <AlertTriangle size={32} style={{ color: "var(--secondary)", marginBottom: "12px" }} />
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--text-h)" }}>
            {disasters.length === 0 ? "No active disasters" : "No campaigns match your search"}
          </p>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--secondary)" }}>
            {disasters.length === 0
              ? "There are currently no registered disaster campaigns."
              : "Try adjusting your search terms or filters."}
          </p>
        </div>
      )}

      {/* Disaster cards */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
          {filtered.map((disaster) => (
            <Card key={disaster._id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <StatusBadge
                  status={disaster.status === "active" ? "verified" : disaster.status === "monitoring" ? "pending" : "resolved"}
                  label={disaster.status === "active" ? "Active Response" : disaster.status === "monitoring" ? "Monitoring" : "Resolved"}
                />
                <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600, textTransform: "capitalize" }}>
                  {disaster.type}
                </span>
              </div>

              <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "var(--text-h)" }}>
                {disaster.title}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "16px 0", fontSize: "13px", color: "var(--secondary)" }}>
                {disaster.affectedDistrictNames.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin size={16} style={{ color: "var(--primary)" }} />
                    {disaster.affectedDistrictNames.join(", ")}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={16} style={{ color: "var(--primary)" }} />
                  Started: {new Date(disaster.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertTriangle size={16} style={{ color: SEVERITY_COLOR[disaster.severity] ?? "var(--warning)" }} />
                  Severity: <strong style={{ color: SEVERITY_COLOR[disaster.severity] ?? "var(--warning)" }}>{disaster.severity.toUpperCase()}</strong>
                </div>
              </div>

              {/* Description snippet */}
              <p style={{
                margin: "0 0 16px", fontSize: "13px", color: "var(--secondary)", lineHeight: 1.55,
                overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>
                {disaster.description}
              </p>

              <Link
                to={`/disasters/${disaster._id}`}
                style={{
                  display: "block", textAlign: "center", padding: "10px",
                  borderRadius: "8px", backgroundColor: "rgba(2, 132, 199, 0.08)",
                  border: "1px solid rgba(2, 132, 199, 0.2)", color: "var(--primary)",
                  fontWeight: 600, textDecoration: "none", fontSize: "14px",
                }}
              >
                View Campaign Details →
              </Link>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default Disasters;
