import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";

export const ManageDisasters: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Manage Disasters"
        description="Create new disaster relief campaigns, update severity ratings, and close completed initiatives."
        breadcrumbs={[{ label: "Admin Console", path: "/admin/dashboard" }, { label: "Disasters" }]}
      />

      <Card title="Disaster Campaign Control">
        {/* TODO: Developers will build disaster creation form and campaign status controls */}
        <p style={{ fontSize: "14px", color: "#64748B" }}>
          Placeholder for administrative disaster management (Create disaster form, severity status toggles, sector mapping).
        </p>
      </Card>
    </PageContainer>
  );
};

export default ManageDisasters;
