import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";

export const SystemSettings: React.FC = () => {
  return (
    <PageContainer maxWidth="800px">
      <PageHeader
        title="System Settings"
        description="Configure API integration settings, database backup schedules, and global system parameters."
        breadcrumbs={[{ label: "Admin Console", path: "/admin/dashboard" }, { label: "System Settings" }]}
      />

      <Card title="System Configuration">
        {/* TODO: Developers will build system settings controls */}
        <p style={{ fontSize: "14px", color: "#64748B" }}>
          Placeholder for administrative system settings (Cloudinary configuration, SMTP email gateways, security policies, backup logs).
        </p>
      </Card>
    </PageContainer>
  );
};

export default SystemSettings;
