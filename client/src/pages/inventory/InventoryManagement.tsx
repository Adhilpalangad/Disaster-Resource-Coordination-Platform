import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";

export const InventoryManagement: React.FC = () => {
  const inventoryItems = [
    { item: "Clean Drinking Water Cans (20L)", category: "Water", stock: "450 Cans", allocated: "300 Cans", status: "verified" },
    { item: "Ready-to-Eat Meal Packs", category: "Food", stock: "1,200 Units", allocated: "850 Units", status: "verified" },
    { item: "First Aid & Triage Medical Kits", category: "Medicine", stock: "15 Kits", allocated: "12 Kits", status: "pending" },
    { item: "Inflatable Emergency Rescue Boats", category: "Equipment", stock: "4 Units", allocated: "3 Units", status: "verified" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Inventory Stockpile Management"
        description="Track food, water, medical supplies, clothing, and rescue equipment across storage hubs."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Inventory" }]}
      />

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--secondary)" }}>
                <th style={{ padding: "12px" }}>Resource Item</th>
                <th style={{ padding: "12px" }}>Category</th>
                <th style={{ padding: "12px" }}>Total Stock</th>
                <th style={{ padding: "12px" }}>Allocated</th>
                <th style={{ padding: "12px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700, color: "var(--text-h)" }}>{row.item}</td>
                  <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>{row.category}</td>
                  <td style={{ padding: "14px 12px", fontWeight: 600 }}>{row.stock}</td>
                  <td style={{ padding: "14px 12px", color: "var(--secondary)" }}>{row.allocated}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <StatusBadge status={row.status} label={row.status === "verified" ? "In Stock" : "Low Stock Alert"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
};

export default InventoryManagement;
