import React from "react";
import PageContainer from "../../components/PageContainer.js";
import EmptyState from "../../components/EmptyState.js";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export const NotFound: React.FC = () => {
  return (
    <PageContainer maxWidth="600px">
      <div style={{ marginTop: "60px" }}>
        <EmptyState
          icon={<AlertCircle size={48} style={{ color: "var(--danger, #EF4444)" }} />}
          title="404 - Page Not Found"
          description="The page you are trying to access does not exist or has been moved."
          action={
            <Link
              to="/"
              style={{
                display: "inline-block",
                backgroundColor: "var(--primary, #0284C7)",
                color: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: "10px",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Return Home
            </Link>
          }
        />
      </div>
    </PageContainer>
  );
};

export default NotFound;
