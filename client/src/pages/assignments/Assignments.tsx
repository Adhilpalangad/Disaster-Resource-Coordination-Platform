import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";

export const Assignments: React.FC = () => {
  const assignments = [
    { id: "ASN-401", reqId: "REQ-8492", ngo: "Red Cross Disaster Ops", volunteer: "Volunteer Alpha", status: "in_progress", dispatchTime: "10:35 AM" },
    { id: "ASN-405", reqId: "REQ-8510", ngo: "Kerala Relief Alliance", volunteer: "Volunteer Beta", status: "pending", dispatchTime: "11:10 AM" },
    { id: "ASN-398", reqId: "REQ-8410", ngo: "Emergency Medical Corps", volunteer: "Volunteer Gamma", status: "completed", dispatchTime: "08:20 AM" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Resource & Delivery Assignments"
        description="Track request dispatch tasks from verification through volunteer delivery fulfillment."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Assignments" }]}
      />

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--secondary)" }}>
                <th style={{ padding: "12px" }}>Assignment ID</th>
                <th style={{ padding: "12px" }}>Request ID</th>
                <th style={{ padding: "12px" }}>Coordinating NGO</th>
                <th style={{ padding: "12px" }}>Assigned Volunteer</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Dispatch Time</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700, color: "var(--text-h)" }}>{row.id}</td>
                  <td style={{ padding: "14px 12px", color: "var(--primary)", fontWeight: 600 }}>{row.reqId}</td>
                  <td style={{ padding: "14px 12px", color: "var(--text-h)" }}>{row.ngo}</td>
                  <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>{row.volunteer}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <StatusBadge status={row.status} />
                  </td>
                  <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>{row.dispatchTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Assignments;
