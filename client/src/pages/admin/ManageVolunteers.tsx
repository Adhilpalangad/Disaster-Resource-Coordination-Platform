import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";

export const ManageVolunteers: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Manage Volunteers"
        description="Review volunteer profiles, skills, operational deployment status, and NGO affiliations."
        breadcrumbs={[{ label: "Admin Console", path: "/admin/dashboard" }, { label: "Volunteers" }]}
      />

      <Card title="Volunteer Network Roster">
        {/* TODO: Developers will build volunteer roster table */}
        <p style={{ fontSize: "14px", color: "#64748B" }}>
          Placeholder for volunteer network roster (Volunteer name, Contact, Skills, Affiliation, Active tasks count).
        </p>
      </Card>
    </PageContainer>
  );
};

export default ManageVolunteers;
