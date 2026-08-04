import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";

export const Notifications: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Notifications Center"
        description="System alerts, verification updates, task dispatches, and emergency broadcast messages."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Notifications" }]}
      />

      <Card title="Activity & Alert Log">
        {/* TODO: Developers will build notifications list feed */}
        <p style={{ fontSize: "14px", color: "#64748B" }}>
          Placeholder for notifications feed (Emergency broadcasts, assignment alerts, verification updates, timestamp history).
        </p>
      </Card>
    </PageContainer>
  );
};

export default Notifications;
