import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";

export const About: React.FC = () => {
  return (
    <PageContainer maxWidth="900px">
      <PageHeader
        title="About the Disaster Resource Coordination Platform"
        description="A simple summary of our platform, services, and the team behind it."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* What is the product */}
        <Card title="What is the Platform?">
          <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.7, margin: "0 0 12px" }}>
            The Disaster Resource Coordination Platform is a real-time web application built to coordinate emergency relief operations during natural disasters and crisis situations.
          </p>
          <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.7, margin: 0 }}>
            Instead of relying on unverified social media posts, scattered phone calls, or paper logs, this platform brings together four key groups into one centralized system: citizens needing aid, relief NGOs managing inventory, volunteers delivering supplies, and administrators overseeing crisis campaigns.
          </p>
        </Card>

        {/* How it helps */}
        <Card title="How it Works & How it Helps You">
          <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.7, margin: "0 0 12px" }}>
            <strong>For Citizens:</strong> You can quickly submit emergency requests for food, water, medical supplies, or shelter with your location and photos. You can track your request status in real time and locate nearby active emergency shelters.
          </p>
          <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.7, margin: "0 0 12px" }}>
            <strong>For NGOs & Relief Agencies:</strong> You can review and verify citizen requests, monitor your stock levels in real time, and assign delivery tasks directly to field volunteers.
          </p>
          <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.7, margin: "0 0 12px" }}>
            <strong>For Volunteers:</strong> You receive assigned delivery tasks with clear recipient locations and item lists, and you can confirm deliveries directly from the field.
          </p>
          <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.7, margin: 0 }}>
            <strong>For Administrators:</strong> You can launch disaster campaigns, accredit relief organizations, and monitor analytics across all active relief operations.
          </p>
        </Card>

        {/* About Team Sync6 */}
        <Card title="Created by Team Sync6">
          <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.7, margin: 0 }}>
            This platform was developed by <strong>Team Sync6</strong>, a group of dedicated student developers. Our goal is to use modern web technology to build simple, effective, and reliable software that solves real-world emergency coordination challenges and helps save lives during critical disasters.
          </p>
        </Card>

      </div>
    </PageContainer>
  );
};

export default About;
