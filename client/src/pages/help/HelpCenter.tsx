import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";

export const HelpCenter: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Help Center & Documentation"
        description="Guides, operating protocols, emergency contact numbers, and platform usage FAQs."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Help Center" }]}
      />

      <Card title="Frequently Asked Questions">
        {/* TODO: Add platform operational guides */}
        <p style={{ fontSize: "14px", color: "#64748B" }}>
          Placeholder for help topics (How to submit a request, How NGO verification works, Emergency hotline numbers, System user guides).
        </p>
      </Card>
    </PageContainer>
  );
};

export default HelpCenter;
