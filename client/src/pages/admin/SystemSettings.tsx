import React, { useEffect, useState } from "react";
import { Sliders, Save, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import { adminApi } from "../../services/adminApi.js";
import type { IDuplicateConfig } from "@disaster-platform/shared";

export const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<IDuplicateConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadConfig = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await adminApi.getDuplicateConfig();
      setConfig(data);
    } catch (err) {
      setErrorMsg("Failed to load duplicate detection configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const updated = await adminApi.updateDuplicateConfig(config);
      setConfig(updated);
      setSuccessMsg("Duplicate detection settings saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer maxWidth="840px">
      <PageHeader
        title="System Settings"
        description="Configure automated duplicate request detection algorithms, threshold limits, field weights, and system policies."
        breadcrumbs={[
          { label: "Admin Console", path: "/admin/dashboard" },
          { label: "System Settings" },
        ]}
      />

      {loading ? (
        <Card title="Loading Settings">
          <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary)" }}>
            Loading duplicate detection configuration...
          </div>
        </Card>
      ) : config ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Main Toggle Card */}
          <Card title="Duplicate Detection Engine Controls">
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px", borderRadius: "10px", backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-h)", fontSize: "14px" }}>Enable Duplicate Request Detection</div>
                  <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "2px" }}>
                    Automatically evaluate incoming citizen submissions against active requests.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  style={{ width: "20px", height: "20px", accentColor: "var(--primary)", cursor: "pointer" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px", borderRadius: "10px", backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-h)", fontSize: "14px" }}>Exact Category Match Only</div>
                  <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "2px" }}>
                    Only compare incoming requests against previous requests within the exact same category (e.g. food vs food).
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.exactCategoryMatchOnly}
                  onChange={(e) => setConfig({ ...config, exactCategoryMatchOnly: e.target.checked })}
                  style={{ width: "20px", height: "20px", accentColor: "var(--primary)", cursor: "pointer" }}
                />
              </div>
            </div>
          </Card>

          {/* Thresholds Card */}
          <Card title="Similarity Threshold Actions">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                  Warning Threshold (% Similarity)
                </label>
                <input
                  type="number"
                  min={50}
                  max={95}
                  value={config.thresholdActionMap.warnMinScore}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      thresholdActionMap: {
                        ...config.thresholdActionMap,
                        warnMinScore: parseInt(e.target.value, 10) || 70,
                      },
                    })
                  }
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
                <span style={{ fontSize: "11px", color: "var(--secondary)", marginTop: "4px", display: "block" }}>
                  Shows a confirmation warning modal but allows submission if confirmed.
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                  Blocking Threshold (% Similarity)
                </label>
                <input
                  type="number"
                  min={70}
                  max={100}
                  value={config.thresholdActionMap.blockMinScore}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      thresholdActionMap: {
                        ...config.thresholdActionMap,
                        blockMinScore: parseInt(e.target.value, 10) || 90,
                      },
                    })
                  }
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
                <span style={{ fontSize: "11px", color: "var(--secondary)", marginTop: "4px", display: "block" }}>
                  Blocks automatic submission and requires admin review.
                </span>
              </div>
            </div>
          </Card>

          {/* Field Weights Card */}
          <Card title="Multi-Field Scoring Weights">
            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--secondary)" }}>
              Weights assigned to each matching parameter (must sum to 1.0).
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                  Category Weight
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={config.weights.category}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weights: { ...config.weights, category: parseFloat(e.target.value) || 0.25 },
                    })
                  }
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                  Location Weight
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={config.weights.location}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weights: { ...config.weights, location: parseFloat(e.target.value) || 0.25 },
                    })
                  }
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                  Description Weight
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={config.weights.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weights: { ...config.weights, description: parseFloat(e.target.value) || 0.35 },
                    })
                  }
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
              </div>
            </div>
          </Card>

          {/* Temporal Decay Card */}
          <Card title="Temporal Decay & Token TTL">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                  Temporal Decay Window (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={config.temporalDecayDays}
                  onChange={(e) => setConfig({ ...config, temporalDecayDays: parseInt(e.target.value, 10) || 7 })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                  Warning Confirm Token TTL (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={config.confirmTokenTtlMinutes}
                  onChange={(e) => setConfig({ ...config, confirmTokenTtlMinutes: parseInt(e.target.value, 10) || 15 })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
              </div>
            </div>
          </Card>

          {successMsg && (
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(5,150,105,0.1)", color: "var(--success)", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.1)", color: "var(--danger)", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "10px", border: "none", backgroundColor: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer" }}>
              <Save size={16} /> {saving ? "Saving Settings..." : "Save Duplicate Settings"}
            </button>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
};

export default SystemSettings;
