import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";

export const Reports: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive summary metrics on relief delivery progress, resource distribution, and response times."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Reports" }]}
      />

      <Card title="Operational Performance Reports">
        {/* TODO: Developers will build report export and chart visualizations */}
        <p style={{ fontSize: "14px", color: "#64748B" }}>
          Placeholder for response metrics (Fulfilled requests chart, average delivery duration, shelter occupancy analytics, CSV export controls).
        </p>
      </Card>
    </PageContainer>
  );
};

export default Reports;
