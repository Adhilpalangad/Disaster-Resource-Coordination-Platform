import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";

export const Settings: React.FC = () => {
  return (
    <PageContainer maxWidth="800px">
      <PageHeader
        title="Application Settings"
        description="Configure localization, notification thresholds, theme preferences, and security options."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Settings" }]}
      />

      <Card title="System Preferences">
        {/* TODO: Developers will build settings controls */}
        <p style={{ fontSize: "14px", color: "#64748B" }}>
          Placeholder for user preferences (SMS alert toggles, default map coordinates, language selection, API keys).
        </p>
      </Card>
    </PageContainer>
  );
};

export default Settings;
