import React, { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Edit2, Trash2, Home } from "lucide-react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import SearchBar from "../../components/SearchBar.js";
import { sheltersApi, type ShelterData, type CreateShelterPayload } from "../../services/sheltersApi.js";

export const ShelterManagement: React.FC = () => {
  const [shelters, setShelters] = useState<ShelterData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal State for Create & Edit
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingShelter, setEditingShelter] = useState<ShelterData | null>(null);
  const [formData, setFormData] = useState<CreateShelterPayload>({
    name: "",
    location: "",
    capacity: 100,
    occupancy: 0,
    status: "verified",
    manager: "",
    phone: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchShelters = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await sheltersApi.getAll({ search: searchTerm || undefined });
      setShelters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shelters data.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchShelters();
  }, [fetchShelters]);

  const handleOpenAddModal = () => {
    setEditingShelter(null);
    setFormData({
      name: "",
      location: "",
      capacity: 100,
      occupancy: 0,
      status: "verified",
      manager: "",
      phone: "",
      notes: "",
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (shelter: ShelterData) => {
    setEditingShelter(shelter);
    setFormData({
      name: shelter.name,
      location: shelter.location,
      capacity: shelter.capacity,
      occupancy: shelter.occupancy,
      status: shelter.status,
      manager: shelter.manager,
      phone: shelter.phone || "",
      notes: shelter.notes || "",
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.manager) {
      alert("Please fill in all required fields (Name, Location, Manager).");
      return;
    }
    setSubmitting(true);
    try {
      if (editingShelter) {
        await sheltersApi.update(editingShelter._id, formData);
      } else {
        await sheltersApi.create(formData);
      }
      setShowModal(false);
      await fetchShelters();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete shelter "${name}"?`)) return;
    try {
      await sheltersApi.delete(id);
      await fetchShelters();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete shelter.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Shelter Management"
        description="Monitor active shelter locations, total capacity, occupancy rates, and available emergency supplies."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Shelters" }]}
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => fetchShelters()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-h)",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={handleOpenAddModal}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 18px",
                borderRadius: "8px",
                backgroundColor: "var(--primary)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "13px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Plus size={16} /> Add Shelter
            </button>
          </div>
        }
      />

      <div style={{ marginBottom: "20px" }}>
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search shelters by name or sector..."
        />
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.1)", color: "var(--danger)", fontSize: "14px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      <Card>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary)", fontSize: "14px" }}>
            Loading shelters data...
          </div>
        ) : shelters.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary)", fontSize: "14px" }}>
            No emergency shelters found matching criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--secondary)" }}>
                  <th style={{ padding: "12px" }}>Shelter Name</th>
                  <th style={{ padding: "12px" }}>Location</th>
                  <th style={{ padding: "12px" }}>Capacity</th>
                  <th style={{ padding: "12px" }}>Occupancy</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Manager</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shelters.map((shelter) => {
                  const capacityRatio = shelter.capacity > 0 ? shelter.occupancy / shelter.capacity : 0;
                  const isNearCapacity = capacityRatio > 0.9;
                  return (
                    <tr key={shelter._id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 12px", fontWeight: 700, color: "var(--text-h)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Home size={15} style={{ color: "var(--primary)" }} />
                          {shelter.name}
                        </div>
                      </td>
                      <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>{shelter.location}</td>
                      <td style={{ padding: "14px 12px", fontWeight: 600 }}>{shelter.capacity} max</td>
                      <td style={{ padding: "14px 12px" }}>
                        <span style={{ fontWeight: 700, color: isNearCapacity ? "var(--danger)" : "var(--success)" }}>
                          {shelter.occupancy} ({Math.round(capacityRatio * 100)}%)
                        </span>
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <StatusBadge
                          status={isNearCapacity ? "rejected" : shelter.status}
                          label={isNearCapacity ? "Near Capacity" : shelter.status === "in_progress" ? "In Operation" : "Available"}
                        />
                      </td>
                      <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>{shelter.manager}</td>
                      <td style={{ padding: "14px 12px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleOpenEditModal(shelter)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid var(--border)",
                              background: "var(--bg)",
                              fontSize: "12px",
                              cursor: "pointer",
                              color: "var(--primary)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(shelter._id, shelter.name)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid rgba(239,68,68,0.2)",
                              background: "rgba(239,68,68,0.05)",
                              fontSize: "12px",
                              cursor: "pointer",
                              color: "var(--danger)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Shelter Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              borderRadius: "14px",
              border: "1px solid var(--border)",
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700, color: "var(--text-h)" }}>
              {editingShelter ? "Edit Shelter Details" : "Register New Relief Shelter"}
            </h3>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>
                  Shelter Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>
                  Location / Sector *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>
                    Total Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>
                    Current Occupancy
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.occupancy}
                    onChange={(e) => setFormData({ ...formData, occupancy: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>
                  Shelter Manager Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>
                  Operational Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                >
                  <option value="verified">Verified / Ready</option>
                  <option value="in_progress">In Operation</option>
                  <option value="pending">Pending Setup</option>
                  <option value="resolved">Decommissioned</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", fontSize: "13px", fontWeight: 600, color: "var(--secondary)", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                >
                  {submitting ? "Saving..." : editingShelter ? "Save Changes" : "Create Shelter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ShelterManagement;
