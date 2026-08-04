import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import SearchBar from "../../components/SearchBar.js";
import FilterBar from "../../components/FilterBar.js";

export const ManageUsers: React.FC = () => {
  const users = [
    { id: "USR-101", name: "Alex Mercer", email: "alex.m@example.com", role: "Citizen", status: "verified", date: "Aug 01, 2026" },
    { id: "USR-102", name: "Sarah Jenkins", email: "sarah@redcross.org", role: "NGO Admin", status: "verified", date: "Jul 28, 2026" },
    { id: "USR-103", name: "Rajesh Kumar", email: "rajesh.v@example.com", role: "Volunteer", status: "verified", date: "Aug 02, 2026" },
    { id: "USR-104", name: "David Chen", email: "david@shelterops.org", role: "Shelter Manager", status: "pending", date: "Aug 03, 2026" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Manage Platform Users"
        description="View registered citizens, volunteers, NGO representatives, and system administrators."
        breadcrumbs={[{ label: "Admin Console", path: "/admin/dashboard" }, { label: "Users" }]}
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <SearchBar value="" onChange={() => {}} placeholder="Search user name, email, or role..." />
        <FilterBar
          options={[
            { label: "All Roles", value: "all" },
            { label: "Citizens", value: "citizen" },
            { label: "NGO Reps", value: "ngo" },
            { label: "Volunteers", value: "volunteer" },
          ]}
          selected="all"
          onChange={() => {}}
        />
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--secondary)" }}>
                <th style={{ padding: "12px" }}>User ID</th>
                <th style={{ padding: "12px" }}>Full Name</th>
                <th style={{ padding: "12px" }}>Email</th>
                <th style={{ padding: "12px" }}>Role</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700, color: "var(--text-h)" }}>{u.id}</td>
                  <td style={{ padding: "14px 12px", fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>{u.email}</td>
                  <td style={{ padding: "14px 12px", color: "var(--text-h)" }}>{u.role}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <StatusBadge status={u.status} />
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <button style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--border)", background: "transparent", fontSize: "12px", cursor: "pointer", color: "var(--primary)" }}>
                      Edit User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
};

export default ManageUsers;
