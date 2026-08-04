import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";

export const ManageNgos: React.FC = () => {
  const ngos = [
    { id: "NGO-201", name: "Red Cross Disaster Operations", reg: "REG-99120", sector: "Medical & Rescue", status: "verified", reps: 14 },
    { id: "NGO-202", name: "Kerala Relief Alliance", reg: "REG-88210", sector: "Food & Shelter", status: "verified", reps: 8 },
    { id: "NGO-203", name: "Hope Foundation International", reg: "REG-77140", sector: "Clothing & Supplies", status: "pending", reps: 3 },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Manage Verified Organizations & NGOs"
        description="Verify NGO credentials, review operational permits, and grant sector clearance."
        breadcrumbs={[{ label: "Admin Console", path: "/admin/dashboard" }, { label: "NGOs" }]}
      />

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--secondary)" }}>
                <th style={{ padding: "12px" }}>NGO ID</th>
                <th style={{ padding: "12px" }}>Organization Name</th>
                <th style={{ padding: "12px" }}>Reg Code</th>
                <th style={{ padding: "12px" }}>Operational Sector</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {ngos.map((ngo) => (
                <tr key={ngo.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700, color: "var(--text-h)" }}>{ngo.id}</td>
                  <td style={{ padding: "14px 12px", fontWeight: 600 }}>{ngo.name}</td>
                  <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>{ngo.reg}</td>
                  <td style={{ padding: "14px 12px", color: "var(--text-h)" }}>{ngo.sector}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <StatusBadge status={ngo.status} />
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    {ngo.status === "pending" ? (
                      <button style={{ padding: "4px 10px", borderRadius: "6px", backgroundColor: "var(--primary)", color: "white", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                        Approve Clearance
                      </button>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>Cleared</span>
                    )}
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

export default ManageNgos;
