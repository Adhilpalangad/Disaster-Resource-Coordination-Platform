import React, { useState } from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import api from "../../services/api.js";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ type: "error", message: "Please fill in all required fields (Name, Email, Message)." });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/contact", formData);
      if (res.data.success) {
        setStatus({
          type: "success",
          message: res.data.message || "Message sent successfully! Our team will contact you shortly.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({ type: "error", message: res.data.message || "Failed to send message." });
      }
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || err.message || "Failed to submit message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

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

        {status && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              backgroundColor: status.type === "success" ? "rgba(5, 150, 105, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: status.type === "success" ? "var(--success, #059669)" : "var(--danger, #EF4444)",
              border: `1px solid ${status.type === "success" ? "rgba(5, 150, 105, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
            }}
          >
            {status.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Your Name <span style={{ color: "var(--danger, #EF4444)" }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border, #E2E8F0)",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "var(--card-bg, #FFFFFF)",
                color: "var(--text-h, #0F172A)",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Email Address <span style={{ color: "var(--danger, #EF4444)" }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border, #E2E8F0)",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "var(--card-bg, #FFFFFF)",
                color: "var(--text-h, #0F172A)",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. NGO Verification Request"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border, #E2E8F0)",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "var(--card-bg, #FFFFFF)",
                color: "var(--text-h, #0F172A)",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Message <span style={{ color: "var(--danger, #EF4444)" }}>*</span>
            </label>
            <textarea
              rows={5}
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe your inquiry or relief coordination request..."
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border, #E2E8F0)",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "var(--card-bg, #FFFFFF)",
                color: "var(--text-h, #0F172A)",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 24px",
                borderRadius: "10px",
                backgroundColor: "var(--primary, #0284C7)",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: "14px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Send size={16} /> {loading ? "Sending Message..." : "Send Message"}
            </button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
};

export default Contact;
