import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import SearchBar from "../../components/SearchBar.js";

export const ShelterManagement: React.FC = () => {
  const shelters = [
    { name: "St. Mary's School Relief Shelter", location: "Wayanad Sector 1", capacity: 300, occupancy: 240, status: "in_progress", manager: "Sr. Teresa" },
    { name: "Community Hall Camp B", location: "Calicut Road", capacity: 150, occupancy: 145, status: "pending", manager: "M. Nair" },
    { name: "Central Indoor Stadium Shelter", location: "Town Center", capacity: 500, occupancy: 120, status: "verified", manager: "R. Pillai" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Shelter Management"
        description="Monitor active shelter locations, total capacity, occupancy rates, and available emergency supplies."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Shelters" }]}
      />

      <div style={{ marginBottom: "20px" }}>
        <SearchBar value="" onChange={() => {}} placeholder="Search shelters by name or sector..." />
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--secondary)" }}>
                <th style={{ padding: "12px" }}>Shelter Name</th>
                <th style={{ padding: "12px" }}>Location</th>
                <th style={{ padding: "12px" }}>Capacity</th>
                <th style={{ padding: "12px" }}>Occupancy</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Manager</th>
              </tr>
            </thead>
            <tbody>
              {shelters.map((shelter, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700, color: "var(--text-h)" }}>{shelter.name}</td>
                  <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>{shelter.location}</td>
                  <td style={{ padding: "14px 12px", fontWeight: 600 }}>{shelter.capacity} max</td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ fontWeight: 700, color: shelter.occupancy / shelter.capacity > 0.9 ? "var(--danger)" : "var(--success)" }}>
                      {shelter.occupancy} ({Math.round((shelter.occupancy / shelter.capacity) * 100)}%)
                    </span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <StatusBadge status={shelter.occupancy / shelter.capacity > 0.9 ? "rejected" : "verified"} label={shelter.occupancy / shelter.capacity > 0.9 ? "Near Capacity" : "Available"} />
                  </td>
                  <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>{shelter.manager}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
};

export default ShelterManagement;
