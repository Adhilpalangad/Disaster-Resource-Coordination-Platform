import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";

export const ManageResources: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Manage Resources"
        description="Global inventory audit, emergency supply stockpiles, and inter-agency resource transfers."
        breadcrumbs={[{ label: "Admin Console", path: "/admin/dashboard" }, { label: "Resources" }]}
      />

      <Card title="Global Resource Audit">
        {/* TODO: Developers will build global resource inventory audit */}
        <p style={{ fontSize: "14px", color: "#64748B" }}>
          Placeholder for global resource audit table (Item category, Total availability, Critical shortages, NGO allocation).
        </p>
      </Card>
    </PageContainer>
  );
};

export default ManageResources;
