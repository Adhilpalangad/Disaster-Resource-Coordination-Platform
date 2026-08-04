import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import { Upload, MapPin, AlertCircle } from "lucide-react";

export const CreateReliefRequest: React.FC = () => {
  return (
    <PageContainer maxWidth="840px">
      <PageHeader
        title="Submit Relief Request"
        description="Report urgent disaster-related needs for food, medical care, shelter, or rescue."
        breadcrumbs={[
          { label: "Overview", path: "/dashboard" },
          { label: "Relief Requests", path: "/requests" },
          { label: "Submit Request" },
        ]}
      />

      <Card title="Request & Incident Information">
        {/* TODO: Connect backend submission API */}
        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                Active Disaster Campaign *
              </label>
              <select style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)" }}>
                <option value="disaster-2026-1">Kerala Flood Relief Campaign 2026</option>
                <option value="disaster-2026-2">Cyclone Wayanad Coastal Operation</option>
                <option value="disaster-2026-3">Landslide Rescue Sector B</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                Need Category *
              </label>
              <select style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)" }}>
                <option value="Food & Water">Food & Water</option>
                <option value="Medical Assistance">Medical Assistance</option>
                <option value="Emergency Shelter">Emergency Shelter</option>
                <option value="Rescue/Evacuation">Rescue/Evacuation</option>
                <option value="Clothing & Hygiene">Clothing & Hygiene</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "8px" }}>
              Urgency Level *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div style={{ border: "1px solid var(--success)", backgroundColor: "rgba(34, 197, 94, 0.08)", padding: "10px", borderRadius: "10px", textAlign: "center", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "var(--success)" }}>
                Low Urgency
              </div>
              <div style={{ border: "1px solid var(--warning)", backgroundColor: "rgba(245, 158, 11, 0.08)", padding: "10px", borderRadius: "10px", textAlign: "center", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "var(--warning)" }}>
                Medium Urgency
              </div>
              <div style={{ border: "1px solid var(--danger)", backgroundColor: "rgba(239, 68, 68, 0.08)", padding: "10px", borderRadius: "10px", textAlign: "center", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "var(--danger)" }}>
                High (Critical)
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                Latitude
              </label>
              <div style={{ position: "relative" }}>
                <input type="text" defaultValue="11.2588" style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "10px", border: "1px solid var(--border)", boxSizing: "border-box" }} />
                <MapPin size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--secondary)" }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                Longitude
              </label>
              <div style={{ position: "relative" }}>
                <input type="text" defaultValue="75.7804" style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "10px", border: "1px solid var(--border)", boxSizing: "border-box" }} />
                <MapPin size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--secondary)" }} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
              Upload Image Evidence
            </label>
            <div style={{ border: "2px dashed var(--border)", borderRadius: "12px", padding: "24px", textAlign: "center", backgroundColor: "var(--bg)", cursor: "pointer" }}>
              <Upload size={24} style={{ color: "var(--primary)", marginBottom: "8px" }} />
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>Click or drag photo files here</p>
              <span style={{ fontSize: "12px", color: "var(--secondary)" }}>Supports JPG, PNG, WEBP up to 5MB</span>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
              Detailed Description *
            </label>
            <textarea
              rows={4}
              defaultValue="Emergency food and drinking water needed for 12 families trapped near Sector 4 community hall due to rising water levels."
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(2, 132, 199, 0.08)", border: "1px solid rgba(2, 132, 199, 0.2)", display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <AlertCircle size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-h)", lineHeight: 1.4 }}>
              Your request will be submitted to active NGOs and field volunteers. Once submitted, its status can be tracked in your dashboard.
            </p>
          </div>

          <button
            type="button"
            style={{
              backgroundColor: "var(--primary)",
              color: "white",
              padding: "12px",
              borderRadius: "10px",
              fontWeight: 600,
              border: "none",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Submit Relief Request (Placeholder UI)
          </button>
        </form>
      </Card>
    </PageContainer>
  );
};

export default CreateReliefRequest;
