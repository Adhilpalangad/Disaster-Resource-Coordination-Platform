import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";

export const About: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="About the Platform"
        description="Learn about our mission to streamline disaster response and resource coordination."
      />

      <Card title="Mission & Purpose">
        <p style={{ fontSize: "14px", color: "var(--secondary, #475569)", lineHeight: 1.6, margin: "0 0 16px" }}>
          During natural disasters, critical information gets fragmented across uncoordinated channels. This platform centralizes citizen relief requests, NGO inventory management, volunteer dispatching, and shelter tracking into a unified ecosystem.
        </p>
        {/* TODO: Add detailed organization background */}
      </Card>
    </PageContainer>
  );
};

export default About;
