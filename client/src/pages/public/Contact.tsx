import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";

export const Contact: React.FC = () => {
  return (
    <PageContainer maxWidth="800px">
      <PageHeader
        title="Contact Platform Support"
        description="Reach out for technical inquiries, NGO verification requests, or system integration."
      />

      <Card title="Send a Message">
        <p style={{ fontSize: "14px", color: "var(--secondary, #475569)", marginBottom: "20px" }}>
          Fill in your details below and our coordination team will respond promptly.
        </p>
        {/* TODO: Developers will wire the contact form backend submission */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Your Name</label>
            <input type="text" placeholder="John Doe" disabled style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #E2E8F0" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Email Address</label>
            <input type="email" placeholder="john@example.com" disabled style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #E2E8F0" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Message</label>
            <textarea rows={4} placeholder="Describe your inquiry..." disabled style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #E2E8F0" }} />
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Contact;
