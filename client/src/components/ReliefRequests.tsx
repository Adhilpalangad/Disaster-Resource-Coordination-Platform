import React, { useState, useEffect } from "react";

interface ReliefRequestData {
  _id: string;
  disasterId: string;
  createdBy: string;
  category: string;
  description: string;
  urgency: "low" | "medium" | "high";
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  verificationStatus: "unverified" | "verified" | "flagged";
  status: "pending" | "assigned" | "resolved";
  assignedTo?: string;
  createdAt: string;
}

export default function ReliefRequests() {
  const [requests, setRequests] = useState<ReliefRequestData[]>([]);
  const [disasterId, setDisasterId] = useState("disaster-2026");
  const [category, setCategory] = useState("Food & Water");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [createdBy] = useState("Volunteer Alpha");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const backendUrl = "http://localhost:5000";

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/requests`);
      const result = await res.json();
      if (result.success) {
        setRequests(result.data);
      } else {
        setError(result.message || "Failed to load requests");
      }
    } catch (err) {
      setError("Cannot connect to server. Ensure the backend API is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please provide a description of the request.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("disasterId", disasterId);
      formData.append("createdBy", createdBy);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("urgency", urgency);
      if (latitude) formData.append("latitude", latitude);
      if (longitude) formData.append("longitude", longitude);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(`${backendUrl}/api/requests`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        setDescription("");
        setLatitude("");
        setLongitude("");
        setImageFile(null);
        fetchRequests();
      } else {
        alert(result.message || "Failed to create request.");
      }
    } catch (err) {
      alert("Error submitting request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        fetchRequests();
      }
    } catch (err) {
      alert("Failed to update request status.");
    }
  };

  const handleUpdateVerification = async (id: string, newVerification: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: newVerification }),
      });
      const result = await res.json();
      if (result.success) {
        fetchRequests();
      }
    } catch (err) {
      alert("Failed to update verification status.");
    }
  };

  const totalAlerts = requests.length;
  const highUrgencyCount = requests.filter(r => r.urgency === "high" && r.status !== "resolved").length;
  const resolvedCount = requests.filter(r => r.status === "resolved").length;

  return (
    <div style={styles.container}>
      {/* Header Bar */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.moduleBadge}>MODULE</span>
            <span style={styles.activeDisasterTag}>Active Campaign: {disasterId}</span>
          </div>
          <h1 style={styles.title}>Relief Request Management</h1>
          <p style={styles.subtitle}>Report, verify, and dispatch disaster relief requests across operational sectors.</p>
        </div>
        <button onClick={fetchRequests} style={styles.refreshButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Refresh Feed
        </button>
      </div>

      {/* Enterprise Metrics Bar */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, backgroundColor: "rgba(2, 132, 199, 0.1)", color: "var(--primary)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div>
            <h4 style={styles.statLabel}>Total Requests Logged</h4>
            <p style={styles.statVal}>{totalAlerts}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h4 style={styles.statLabel}>High Priority Alerts</h4>
            <p style={{ ...styles.statVal, color: "var(--danger)" }}>{highUrgencyCount}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div>
            <h4 style={styles.statLabel}>Resolved Needs</h4>
            <p style={{ ...styles.statVal, color: "var(--success)" }}>{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        {/* Form Panel */}
        <div style={styles.panelCard}>
          <div style={styles.panelHeader}>
            <div style={styles.headerTitleGroup}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <h3 style={styles.panelTitle}>Submit Relief Request</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Disaster Campaign ID</label>
                <input
                  type="text"
                  value={disasterId}
                  onChange={(e) => setDisasterId(e.target.value)}
                  style={styles.input}
                  placeholder="e.g. disaster-2026"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.select}
                >
                  <option value="Food & Water">Food & Water</option>
                  <option value="Medical Assistance">Medical Assistance</option>
                  <option value="Emergency Shelter">Emergency Shelter</option>
                  <option value="Rescue/Evacuation">Rescue/Evacuation</option>
                  <option value="Clothing & Hygiene">Clothing & Hygiene</option>
                  <option value="Other Needs">Other Needs</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Urgency Level</label>
              <div style={styles.urgencySelector}>
                {(["low", "medium", "high"] as const).map((level) => {
                  const isActive = urgency === level;
                  let levelColor = "var(--success)";
                  if (level === "medium") levelColor = "var(--warning)";
                  if (level === "high") levelColor = "var(--danger)";

                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setUrgency(level)}
                      style={{
                        ...styles.urgencyBtn,
                        borderColor: isActive ? levelColor : "var(--border)",
                        backgroundColor: isActive ? `${levelColor}15` : "transparent",
                        color: isActive ? levelColor : "var(--text)",
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      <span style={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: levelColor,
                        marginRight: "6px"
                      }}></span>
                      {level.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Latitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  style={styles.input}
                  placeholder="e.g. 13.0827"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Longitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  style={styles.input}
                  placeholder="e.g. 80.2707"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Attach Image Evidence</label>
              <div style={styles.fileDropzone}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  style={styles.fileInputHidden}
                  id="image-file-upload"
                />
                <label htmlFor="image-file-upload" style={styles.fileDropzoneLabel}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)", marginBottom: "4px" }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>{imageFile ? imageFile.name : "Select or drag photo file to attach"}</span>
                </label>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.textarea}
                placeholder="Specify exact quantities, condition, access restrictions, or critical instructions..."
                rows={4}
                required
              />
            </div>

            <button type="submit" disabled={submitting} style={styles.submitButton}>
              {submitting ? "Submitting..." : "Submit Relief Request"}
            </button>
          </form>
        </div>

        {/* Feed Panel */}
        <div style={styles.panelCard}>
          <div style={styles.panelHeader}>
            <div style={styles.headerTitleGroup}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}>
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
              </svg>
              <h3 style={styles.panelTitle}>Active Requests Feed</h3>
            </div>
            <span style={styles.counterBadge}>{requests.length} Entries</span>
          </div>

          {loading ? (
            <div style={styles.emptyState}>
              <p style={{ color: "var(--text)", fontSize: "14px" }}>Fetching live records...</p>
            </div>
          ) : error ? (
            <div style={styles.errorBox}>{error}</div>
          ) : requests.length === 0 ? (
            <div style={styles.emptyState}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--secondary)", opacity: 0.5 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ margin: "8px 0 0", color: "var(--text)", fontSize: "14px" }}>No relief requests currently logged.</p>
            </div>
          ) : (
            <div style={styles.list}>
              {requests.map((req) => {
                let severityColor = "var(--success)";
                if (req.urgency === "medium") severityColor = "var(--warning)";
                if (req.urgency === "high") severityColor = "var(--danger)";

                return (
                  <div key={req._id} style={{ ...styles.requestCard, borderLeftColor: severityColor }}>
                    <div style={styles.cardTopRow}>
                      <span style={{ ...styles.categoryBadge, backgroundColor: `${severityColor}12`, color: severityColor }}>
                        {req.category}
                      </span>
                      <span style={{ ...styles.urgencyBadge, color: severityColor, backgroundColor: `${severityColor}10` }}>
                        Urgency: {req.urgency.toUpperCase()}
                      </span>
                    </div>

                    <p style={styles.descriptionText}>{req.description}</p>

                    {req.imageUrl && (
                      <div style={styles.imageContainer}>
                        <img src={`${backendUrl}${req.imageUrl}`} alt="Request Attachment" style={styles.cardImage} />
                      </div>
                    )}

                    <div style={styles.metaRow}>
                      <div style={styles.metaItem}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>{req.latitude && req.longitude ? `${req.latitude.toFixed(4)}, ${req.longitude.toFixed(4)}` : "Location Unspecified"}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>{req.createdBy}</span>
                      </div>
                    </div>

                    <div style={styles.cardFooter}>
                      <div style={styles.badgeGroup}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: req.status === "resolved" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                          color: req.status === "resolved" ? "var(--success)" : "var(--warning)"
                        }}>
                          Status: {req.status}
                        </span>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: req.verificationStatus === "verified" ? "rgba(2, 132, 199, 0.1)" : "rgba(239, 68, 68, 0.1)",
                          color: req.verificationStatus === "verified" ? "var(--primary)" : "var(--danger)"
                        }}>
                          {req.verificationStatus}
                        </span>
                      </div>

                      <div style={styles.actionButtonGroup}>
                        {req.verificationStatus !== "verified" && (
                          <button
                            onClick={() => handleUpdateVerification(req._id, "verified")}
                            style={styles.actionButton}
                          >
                            Verify
                          </button>
                        )}
                        {req.status !== "resolved" && (
                          <button
                            onClick={() => handleUpdateStatus(req._id, "resolved")}
                            style={{ ...styles.actionButton, color: "var(--success)", borderColor: "var(--success)" }}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "32px 24px",
    maxWidth: "1280px",
    margin: "0 auto",
    textAlign: "left",
    fontFamily: "var(--sans)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "28px",
    borderBottom: "1px solid var(--border)",
    paddingBottom: "20px",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  moduleBadge: {
    fontSize: "11px",
    fontWeight: 700,
    backgroundColor: "var(--primary)",
    color: "white",
    padding: "2px 8px",
    borderRadius: "4px",
    letterSpacing: "0.5px",
  },
  activeDisasterTag: {
    fontSize: "12px",
    color: "var(--text)",
    fontWeight: 500,
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "var(--text-h)",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: "4px 0 0",
    color: "var(--text)",
    fontSize: "14px",
  },
  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--border)",
    padding: "8px 16px",
    borderRadius: "6px",
    color: "var(--text-h)",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "13px",
    boxShadow: "var(--shadow)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "28px",
  },
  statCard: {
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "var(--shadow)",
  },
  iconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statLabel: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--text)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statVal: {
    margin: "2px 0 0",
    fontSize: "22px",
    fontWeight: 700,
    color: "var(--text-h)",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "28px",
  },
  panelCard: {
    backgroundColor: "var(--card-bg)",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    padding: "24px",
    boxShadow: "var(--shadow)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--border)",
    paddingBottom: "14px",
  },
  headerTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  panelTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "var(--text-h)",
  },
  counterBadge: {
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--text)",
    backgroundColor: "var(--code-bg)",
    padding: "3px 10px",
    borderRadius: "12px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-h)",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    fontSize: "14px",
    backgroundColor: "transparent",
    color: "var(--text-h)",
    outline: "none",
  },
  select: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    fontSize: "14px",
    backgroundColor: "var(--card-bg)",
    color: "var(--text-h)",
    outline: "none",
  },
  urgencySelector: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
  },
  urgencyBtn: {
    padding: "9px",
    borderRadius: "6px",
    border: "1px solid",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fileDropzone: {
    border: "1px dashed var(--border)",
    borderRadius: "6px",
    padding: "14px",
    textAlign: "center",
    backgroundColor: "var(--code-bg)",
    cursor: "pointer",
  },
  fileInputHidden: {
    display: "none",
  },
  fileDropzoneLabel: {
    cursor: "pointer",
    fontSize: "13px",
    color: "var(--text)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    fontWeight: 500,
  },
  textarea: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    fontSize: "14px",
    fontFamily: "var(--sans)",
    backgroundColor: "transparent",
    color: "var(--text-h)",
    resize: "vertical",
    outline: "none",
  },
  submitButton: {
    backgroundColor: "var(--primary)",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
  },
  emptyState: {
    padding: "36px 0",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    border: "1px solid var(--danger)",
    color: "var(--danger)",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "13px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    overflowY: "auto",
    maxHeight: "680px",
  },
  requestCard: {
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderLeftWidth: "4px",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cardTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    fontSize: "12px",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "4px",
  },
  urgencyBadge: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: "4px",
    letterSpacing: "0.5px",
  },
  descriptionText: {
    margin: 0,
    fontSize: "14px",
    color: "var(--text-h)",
    lineHeight: 1.4,
  },
  imageContainer: {
    width: "100%",
    maxHeight: "180px",
    overflow: "hidden",
    borderRadius: "6px",
    border: "1px solid var(--border)",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "var(--text)",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid var(--border)",
    paddingTop: "10px",
  },
  badgeGroup: {
    display: "flex",
    gap: "6px",
  },
  statusBadge: {
    fontSize: "10px",
    fontWeight: 700,
    padding: "3px 6px",
    borderRadius: "4px",
    textTransform: "uppercase",
  },
  actionButtonGroup: {
    display: "flex",
    gap: "6px",
  },
  actionButton: {
    padding: "5px 12px",
    borderRadius: "4px",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text-h)",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
