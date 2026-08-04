import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";

export const Profile: React.FC = () => {
  return (
    <PageContainer maxWidth="800px">
      <PageHeader
        title="User Profile"
        description="Manage your account information, contact credentials, and notification preferences."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Profile" }]}
      />

      <Card title="Account Information">
        {/* TODO: Developers will build profile editing form */}
        <p style={{ fontSize: "14px", color: "#64748B" }}>
          Placeholder for profile settings (Full Name, Contact Number, Role details, Organization linkage, Security settings).
        </p>
      </Card>
    </PageContainer>
  );
};

export default Profile;
