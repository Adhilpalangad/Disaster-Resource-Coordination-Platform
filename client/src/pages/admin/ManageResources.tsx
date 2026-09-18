import React, { useState, useEffect, useCallback } from "react";
import { Package, RefreshCw, Trash2 } from "lucide-react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import SearchBar from "../../components/SearchBar.js";
import FilterBar from "../../components/FilterBar.js";
import { inventoryApi, type InventoryItem } from "../../services/inventoryApi.js";

export const ManageResources: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await inventoryApi.getAll();
      setItems(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load global resource inventory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove item "${name}" from inventory?`)) return;
    try {
      await inventoryApi.deleteItem(id);
      await fetchResources();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete item.");
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "food":
        return "Food Supplies";
      case "water":
        return "Drinking Water";
      case "medicine":
        return "Medical & Health";
      case "clothing":
        return "Apparel & Blankets";
      case "rescue_equipment":
        return "Rescue Equipment";
      default:
        return "General Supplies";
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Manage Resources"
        description="Global inventory audit, emergency supply stockpiles, and inter-agency resource transfers."
        breadcrumbs={[{ label: "Admin Console", path: "/admin/dashboard" }, { label: "Resources" }]}
        actions={
          <button
            onClick={() => fetchResources()}
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
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Audit
          </button>
        }
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search items by name, location, or notes..."
        />
        <FilterBar
          options={[
            { label: "All Categories", value: "all" },
            { label: "Food", value: "food" },
            { label: "Water", value: "water" },
            { label: "Medicine", value: "medicine" },
            { label: "Clothing", value: "clothing" },
            { label: "Rescue Equip.", value: "rescue_equipment" },
            { label: "Other", value: "other" },
          ]}
          selected={selectedCategory}
          onChange={(val) => setSelectedCategory(val)}
        />
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.1)", color: "var(--danger)", fontSize: "14px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      <Card title={`Global Resource Audit (${filteredItems.length} items)`}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary)", fontSize: "14px" }}>
            Loading global inventory audit...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary)", fontSize: "14px" }}>
            No stockpiles or resource inventory items found matching your filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--secondary)" }}>
                  <th style={{ padding: "12px" }}>Item Name</th>
                  <th style={{ padding: "12px" }}>Category</th>
                  <th style={{ padding: "12px" }}>Stock Quantity</th>
                  <th style={{ padding: "12px" }}>Storage Location</th>
                  <th style={{ padding: "12px" }}>NGO / Agency ID</th>
                  <th style={{ padding: "12px" }}>Expiry Date</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 12px", fontWeight: 700, color: "var(--text-h)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Package size={15} style={{ color: "var(--primary)" }} />
                        {item.name}
                      </div>
                    </td>
                    <td style={{ padding: "14px 12px", color: "var(--text-h)" }}>{getCategoryLabel(item.category)}</td>
                    <td style={{ padding: "14px 12px", fontWeight: 700, color: "var(--text-h)" }}>
                      {item.quantity} {item.unit}
                    </td>
                    <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>
                      {item.location || "Central Storage"}
                    </td>
                    <td style={{ padding: "14px 12px", color: "var(--secondary)", fontSize: "13px" }}>
                      {item.ngoId || "System Global"}
                    </td>
                    <td style={{ padding: "14px 12px", color: "var(--secondary)", fontSize: "13px" }}>
                      {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <button
                        onClick={() => handleDelete(item._id, item.name)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default ManageResources;
