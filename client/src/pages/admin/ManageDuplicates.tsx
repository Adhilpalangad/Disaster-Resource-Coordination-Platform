import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, RefreshCw, Eye, Check } from "lucide-react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import { adminApi } from "../../services/adminApi.js";
import type { DuplicateAttemptRecord } from "@disaster-platform/shared";

export const ManageDuplicates: React.FC = () => {
  const [logs, setLogs] = useState<DuplicateAttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [overrideModalLog, setOverrideModalLog] = useState<DuplicateAttemptRecord | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [submittingOverride, setSubmittingOverride] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await adminApi.getDuplicateLogs({
        action: actionFilter || undefined,
        limit: 50,
      });
      setLogs(res.data || []);
    } catch (err) {
      setErrorMsg("Failed to load duplicate attempt logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const handleOverrideSubmit = async () => {
    if (!overrideModalLog) return;
    setSubmittingOverride(true);
    setOverrideSuccess("");
    try {
      await adminApi.overrideDuplicateAttempt(overrideModalLog._id, overrideReason);
      setOverrideSuccess("Duplicate request overridden and submitted to routing pipeline.");
      setTimeout(() => {
        setOverrideModalLog(null);
        setOverrideReason("");
        setOverrideSuccess("");
        fetchLogs();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to override duplicate request.");
    } finally {
      setSubmittingOverride(false);
    }
  };

  return (
    <PageContainer maxWidth="1200px">
      <PageHeader
        title="Manage Duplicate Requests"
        description="Monitor automated duplicate detection logs, review similarity scores, and override false positives."
        breadcrumbs={[
          { label: "Admin Console", path: "/admin/dashboard" },
          { label: "Manage Duplicates" },
        ]}
      />

      {/* Filter Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", gap: "16px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--secondary)" }}>Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontSize: "13px" }}>
            <option value="">All Actions</option>
            <option value="blocked">Blocked Submissions</option>
            <option value="warning_ignored">Warning Ignored (User Proceeded)</option>
            <option value="overridden_by_admin">Overridden by Admin</option>
          </select>
        </div>

        <button
          onClick={fetchLogs}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh Logs
        </button>
      </div>

      <Card title={`Duplicate Submission Logs (${logs.length})`}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary)" }}>
            Loading duplicate detection logs...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary)" }}>
            No duplicate submission attempts found matching the selected filter.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--secondary)" }}>
                  <th style={{ padding: "12px" }}>Citizen</th>
                  <th style={{ padding: "12px" }}>Category & Need</th>
                  <th style={{ padding: "12px" }}>Match Score</th>
                  <th style={{ padding: "12px" }}>Breakdown (Cat / Loc / Text)</th>
                  <th style={{ padding: "12px" }}>Action</th>
                  <th style={{ padding: "12px" }}>Date</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const actionColor =
                    log.action === "blocked"
                      ? "var(--danger)"
                      : log.action === "warning_ignored"
                      ? "var(--warning)"
                      : "var(--success)";

                  return (
                    <tr key={log._id} style={{ borderBottom: "1px solid var(--border)", height: "60px" }}>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-h)" }}>{log.citizenName}</div>
                        <div style={{ fontSize: "11px", color: "var(--secondary)" }}>{log.citizenMobile}</div>
                      </td>
                      <td style={{ padding: "12px", maxWidth: "260px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-h)", textTransform: "capitalize" }}>
                          {log.attemptedPayload.category}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--secondary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                          {log.attemptedPayload.description}
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontWeight: 700,
                            fontSize: "12px",
                            backgroundColor: log.similarityScore >= 90 ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
                            color: log.similarityScore >= 90 ? "var(--danger)" : "var(--warning)",
                          }}>
                          {log.similarityScore}%
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontSize: "11px", color: "var(--secondary)" }}>
                          Cat: <strong>{log.breakdown?.categoryScore}%</strong> | Loc: <strong>{log.breakdown?.locationScore}%</strong> | Text: <strong>{log.breakdown?.descriptionScore}%</strong>
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            backgroundColor: `${actionColor}15`,
                            color: actionColor,
                          }}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "var(--secondary)", fontSize: "12px" }}>
                        {new Date(log.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {log.action === "blocked" && (
                          <button
                            onClick={() => {
                              setOverrideModalLog(log);
                              setOverrideReason("");
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: "var(--primary)",
                              color: "#fff",
                              fontWeight: 600,
                              fontSize: "12px",
                              cursor: "pointer",
                            }}>
                            Override & Submit
                          </button>
                        )}
                        {log.action === "overridden_by_admin" && (
                          <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>✓ Overridden</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Override Modal */}
      {overrideModalLog && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "500px", backgroundColor: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--text-h)" }}>
              Admin Override for Duplicate Request
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--secondary)", lineHeight: 1.5 }}>
              This request was blocked with a <strong>{overrideModalLog.similarityScore}% similarity match</strong>. By overriding, the request will be forcibly submitted and routed to NGOs.
            </p>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                Reason for Override <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Verified by phone call that this request is for a distinct household in the same neighborhood."
                rows={3}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>

            {overrideSuccess && (
              <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(5,150,105,0.1)", color: "var(--success)", fontSize: "13px", fontWeight: 600 }}>
                {overrideSuccess}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setOverrideModalLog(null)}
                style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={handleOverrideSubmit}
                disabled={submittingOverride || !overrideReason.trim()}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: submittingOverride || !overrideReason.trim() ? "not-allowed" : "pointer" }}>
                {submittingOverride ? "Overriding..." : "Confirm & Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ManageDuplicates;
