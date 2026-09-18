import React, { useState, useEffect, useCallback } from "react";
import { UserCheck, Phone, MapPin, Briefcase, Building2, Edit2, Trash2, RefreshCw } from "lucide-react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import SearchBar from "../../components/SearchBar.js";
import FilterBar from "../../components/FilterBar.js";
import { volunteersApi, type VolunteerUser } from "../../services/volunteersApi.js";

export const ManageVolunteers: React.FC = () => {
  const [volunteers, setVolunteers] = useState<VolunteerUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  // Edit Modal State
  const [editingVolunteer, setEditingVolunteer] = useState<VolunteerUser | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    phone: string;
    district: string;
    profession: string;
    organizationName: string;
  }>({ name: "", phone: "", district: "", profession: "", organizationName: "" });
  const [saving, setSaving] = useState<boolean>(false);

  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await volunteersApi.getAll({
        search: searchTerm || undefined,
        district: selectedDistrict !== "all" ? selectedDistrict : undefined,
      });
      setVolunteers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load volunteers roster.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedDistrict]);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  const handleEditClick = (vol: VolunteerUser) => {
    setEditingVolunteer(vol);
    setEditForm({
      name: vol.name || "",
      phone: vol.phone || "",
      district: vol.district || "",
      profession: vol.profession || "",
      organizationName: vol.organizationName || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingVolunteer) return;
    setSaving(true);
    try {
      await volunteersApi.update(editingVolunteer._id, editForm);
      setEditingVolunteer(null);
      await fetchVolunteers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update volunteer.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove volunteer "${name}"?`)) return;
    try {
      await volunteersApi.delete(id);
      await fetchVolunteers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete volunteer.");
    }
  };

  // Get list of unique districts for filter
  const districtsList = Array.from(
    new Set(volunteers.map((v) => v.district).filter((d): d is string => Boolean(d)))
  );

  return (
    <PageContainer>
      <PageHeader
        title="Manage Volunteers"
        description="Review volunteer profiles, skills, operational deployment status, and NGO affiliations."
        breadcrumbs={[{ label: "Admin Console", path: "/admin/dashboard" }, { label: "Volunteers" }]}
        actions={
          <button
            onClick={() => fetchVolunteers()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
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
        }
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search volunteer name, email, profession..."
        />
        {districtsList.length > 0 && (
          <FilterBar
            options={[
              { label: "All Districts", value: "all" },
              ...districtsList.map((d) => ({ label: d, value: d })),
            ]}
            selected={selectedDistrict}
            onChange={(val) => setSelectedDistrict(val)}
          />
        )}
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.1)", color: "var(--danger)", fontSize: "14px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      <Card title="Volunteer Network Roster">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary)", fontSize: "14px" }}>
            Loading volunteers roster...
          </div>
        ) : volunteers.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary)", fontSize: "14px" }}>
            No volunteers found matching your criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--secondary)" }}>
                  <th style={{ padding: "12px" }}>Volunteer</th>
                  <th style={{ padding: "12px" }}>Contact Information</th>
                  <th style={{ padding: "12px" }}>Location & District</th>
                  <th style={{ padding: "12px" }}>Profession / Skill</th>
                  <th style={{ padding: "12px" }}>Affiliation</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((vol) => (
                  <tr key={vol._id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 12px" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-h)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <UserCheck size={16} style={{ color: "var(--primary)" }} />
                        {vol.name}
                      </div>
                    </td>
                    <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>
                      <div>{vol.email}</div>
                      {vol.phone && (
                        <div style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                          <Phone size={12} /> {vol.phone}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 12px", color: "var(--text-h)" }}>
                      {vol.district ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={12} style={{ color: "var(--secondary)" }} /> {vol.district}
                        </span>
                      ) : (
                        <span style={{ color: "var(--secondary)", fontStyle: "italic" }}>Not specified</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 12px", color: "var(--text-h)" }}>
                      {vol.profession ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Briefcase size={12} style={{ color: "var(--secondary)" }} /> {vol.profession}
                        </span>
                      ) : (
                        <span style={{ color: "var(--secondary)", fontStyle: "italic" }}>General Volunteer</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>
                      {vol.organizationName ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Building2 size={12} /> {vol.organizationName}
                        </span>
                      ) : (
                        "Independent"
                      )}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <StatusBadge status="verified" label="Active" />
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleEditClick(vol)}
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
                          onClick={() => handleDelete(vol._id, vol.name)}
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
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Volunteer Modal */}
      {editingVolunteer && (
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
            if (e.target === e.currentTarget) setEditingVolunteer(null);
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
              Edit Volunteer Profile
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>District</label>
                <input
                  type="text"
                  value={editForm.district}
                  onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>Profession / Skillset</label>
                <input
                  type="text"
                  value={editForm.profession}
                  onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>Affiliation / NGO Name</label>
                <input
                  type="text"
                  value={editForm.organizationName}
                  onChange={(e) => setEditForm({ ...editForm, organizationName: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setEditingVolunteer(null)}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", fontSize: "13px", fontWeight: 600, color: "var(--secondary)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ManageVolunteers;
