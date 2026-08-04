import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { requestsApi } from "../../services/requestsApi.js";
import type { RequestCategory, UrgencyLevel } from "../../types/index.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";

const CATEGORIES: { value: RequestCategory; label: string; icon: string }[] = [
  { value: "food", label: "Food & Nutrition", icon: "🍱" },
  { value: "water", label: "Clean Water", icon: "💧" },
  { value: "medical", label: "Medical Aid", icon: "🏥" },
  { value: "shelter", label: "Emergency Shelter", icon: "🏠" },
  { value: "clothing", label: "Clothing & Hygiene", icon: "👕" },
  { value: "rescue", label: "Rescue / Evacuation", icon: "🚨" },
  { value: "other", label: "Other Need", icon: "📦" },
];

const URGENCY_CONFIG: { value: UrgencyLevel; label: string; color: string; desc: string }[] = [
  { value: "low", label: "Low", color: "var(--success)", desc: "Can wait 24–48 hrs" },
  { value: "medium", label: "Medium", color: "var(--warning)", desc: "Needed today" },
  { value: "high", label: "High", color: "var(--danger)", desc: "Within a few hours" },
  { value: "critical", label: "Critical", color: "#7c3aed", desc: "Life-threatening" },
];

export const CreateReliefRequest: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState<RequestCategory>("food");
  const [urgency, setUrgency] = useState<UrgencyLevel>("medium");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!location.trim()) { setError("Please enter your current location."); return; }
    if (!description.trim()) { setError("Please describe your need in detail."); return; }

    setSubmitting(true);
    setError("");
    try {
      await requestsApi.create({
        createdBy: user.id,
        createdByName: user.name,
        category,
        urgency,
        location: location.trim(),
        contactNumber: contactNumber.trim() || undefined,
        description: description.trim(),
        image: imageFile ?? undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate("/requests"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <PageContainer maxWidth="560px">
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "340px", textAlign: "center", gap: "16px",
          backgroundColor: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--border)",
          padding: "48px", boxShadow: "var(--shadow)",
        }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle size={28} color="var(--success)" />
          </div>
          <h2 style={{ margin: 0, color: "var(--text-h)" }}>Request Submitted</h2>
          <p style={{ margin: 0, color: "var(--secondary)", fontSize: "14px" }}>
            Your relief request has been sent to NGOs and volunteers. You can track its status in My Requests.
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--secondary)" }}>Redirecting…</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="840px">
      <PageHeader
        title="Submit Relief Request"
        description="Report urgent disaster-related needs. NGOs will review and dispatch help."
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "My Requests", path: "/requests" },
          { label: "Submit Request" },
        ]}
      />

      <form onSubmit={handleSubmit}>
        <Card title="What kind of help do you need?">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
            {CATEGORIES.map(({ value, label, icon }) => {
              const active = category === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                    padding: "14px 10px", borderRadius: "10px", cursor: "pointer",
                    border: `2px solid ${active ? "var(--primary)" : "var(--border)"}`,
                    backgroundColor: active ? "rgba(2,132,199,0.08)" : "var(--bg)",
                    color: active ? "var(--primary)" : "var(--text-h)",
                    fontWeight: active ? 700 : 500, fontSize: "13px",
                    transition: "border-color 0.15s, background-color 0.15s",
                  }}
                >
                  <span style={{ fontSize: "22px" }}>{icon}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </Card>

        <div style={{ marginTop: "20px" }}>
          <Card title="Urgency Level">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
              {URGENCY_CONFIG.map(({ value, label, color, desc }) => {
                const active = urgency === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setUrgency(value)}
                    style={{
                      padding: "14px", borderRadius: "10px", cursor: "pointer", textAlign: "left",
                      border: `2px solid ${active ? color : "var(--border)"}`,
                      backgroundColor: active ? `${color}14` : "var(--bg)",
                      transition: "border-color 0.15s, background-color 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, fontSize: "13px", color: active ? color : "var(--text-h)" }}>{label}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--secondary)" }}>{desc}</p>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div style={{ marginTop: "20px" }}>
          <Card title="Location & Contact">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                  Current Location <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <MapPin size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--secondary)" }} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sector 4, community hall, Kozhikode"
                    required
                    style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "14px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                  Contact Number (optional)
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "14px", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </Card>
        </div>

        <div style={{ marginTop: "20px" }}>
          <Card title="Describe Your Need">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                  Detailed Description <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                  placeholder="Specify quantities, number of people affected, access restrictions, specific medical needs, or any critical instructions for relief workers..."
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "14px", boxSizing: "border-box", resize: "vertical", fontFamily: "var(--sans)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                  Photo Evidence (optional)
                </label>
                <label
                  htmlFor="req-image-upload"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                    border: "2px dashed var(--border)", borderRadius: "12px", padding: "28px",
                    backgroundColor: "var(--bg)", cursor: "pointer", textAlign: "center",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <Upload size={22} color="var(--primary)" />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>
                    {imageFile ? imageFile.name : "Click to attach a photo"}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--secondary)" }}>JPG, PNG, WEBP · Max 5 MB</span>
                </label>
                <input
                  id="req-image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </Card>
        </div>

        {error && (
          <div style={{ marginTop: "16px", padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", gap: "10px", color: "var(--danger)", fontSize: "13px" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div style={{ marginTop: "16px", padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(2,132,199,0.08)", border: "1px solid rgba(2,132,199,0.2)", display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <AlertCircle size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-h)", lineHeight: 1.5 }}>
            Your request will be sent to all active NGOs and field volunteers. You can track its status in <strong>My Requests</strong>.
          </p>
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => navigate("/requests")}
            style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              flex: 2, padding: "12px", borderRadius: "10px", border: "none",
              backgroundColor: submitting ? "var(--secondary)" : "var(--primary)",
              color: "#fff", fontWeight: 600, fontSize: "14px", cursor: submitting ? "not-allowed" : "pointer",
              transition: "background-color 0.15s",
            }}
          >
            {submitting ? "Submitting…" : "Submit Relief Request"}
          </button>
        </div>
      </form>
    </PageContainer>
  );
};

export default CreateReliefRequest;
