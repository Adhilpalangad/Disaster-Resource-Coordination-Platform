import React, { useState, useEffect, useCallback } from "react";
import { Edit2, RefreshCw } from "lucide-react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import SearchBar from "../../components/SearchBar.js";
import FilterBar from "../../components/FilterBar.js";
import api from "../../services/api.js";

export interface SystemUser {
  _id: string;
  supabaseId: string;
  name: string;
  email: string;
  role: "citizen" | "ngo" | "volunteer" | "admin";
  phone?: string;
  organizationName?: string;
  district?: string;
  profession?: string;
  createdAt: string;
  updatedAt: string;
}

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    role: "citizen" | "ngo" | "volunteer" | "admin";
    phone: string;
    district: string;
  }>({ name: "", role: "citizen", phone: "", district: "" });
  const [saving, setSaving] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<{ data: SystemUser[] }>("/auth/users", {
        params: {
          search: searchTerm || undefined,
          role: selectedRole !== "all" ? selectedRole : undefined,
        },
      });
      setUsers(res.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load platform users.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditClick = (user: SystemUser) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      role: user.role,
      phone: user.phone || "",
      district: user.district || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await api.put(`/auth/users/${editingUser._id}`, editForm);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const formatRoleLabel = (role: string) => {
    switch (role) {
      case "citizen":
        return "Citizen";
      case "ngo":
        return "NGO Admin";
      case "volunteer":
        return "Volunteer";
      case "admin":
        return "System Admin";
      default:
        return role;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Manage Platform Users"
        description="View registered citizens, volunteers, NGO representatives, and system administrators."
        breadcrumbs={[{ label: "Admin Console", path: "/admin/dashboard" }, { label: "Users" }]}
        actions={
          <button
            onClick={() => fetchUsers()}
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
          placeholder="Search user name, email, or role..."
        />
        <FilterBar
          options={[
            { label: "All Roles", value: "all" },
            { label: "Citizens", value: "citizen" },
            { label: "NGO Reps", value: "ngo" },
            { label: "Volunteers", value: "volunteer" },
            { label: "Admins", value: "admin" },
          ]}
          selected={selectedRole}
          onChange={(val) => setSelectedRole(val)}
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
            Loading platform users...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary)", fontSize: "14px" }}>
            No platform users found matching criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--secondary)" }}>
                  <th style={{ padding: "12px" }}>User ID</th>
                  <th style={{ padding: "12px" }}>Full Name</th>
                  <th style={{ padding: "12px" }}>Email</th>
                  <th style={{ padding: "12px" }}>Role</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 12px", fontWeight: 700, color: "var(--text-h)" }}>
                      {u._id.substring(u._id.length - 7).toUpperCase()}
                    </td>
                    <td style={{ padding: "14px 12px", fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>{u.email}</td>
                    <td style={{ padding: "14px 12px", color: "var(--text-h)" }}>{formatRoleLabel(u.role)}</td>
                    <td style={{ padding: "14px 12px" }}>
                      <StatusBadge status="verified" label="Active" />
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <button
                        onClick={() => handleEditClick(u)}
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
                        <Edit2 size={13} /> Edit User
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
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
            if (e.target === e.currentTarget) setEditingUser(null);
          }}
        >
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              borderRadius: "14px",
              border: "1px solid var(--border)",
              width: "100%",
              maxWidth: "480px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700, color: "var(--text-h)" }}>
              Edit User Account
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
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontSize: "14px" }}
                >
                  <option value="citizen">Citizen</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="ngo">NGO Admin</option>
                  <option value="admin">System Admin</option>
                </select>
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
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setEditingUser(null)}
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

export default ManageUsers;
