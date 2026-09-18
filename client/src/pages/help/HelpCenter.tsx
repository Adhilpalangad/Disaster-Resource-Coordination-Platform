import React, { useState } from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  ArrowRight,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: "Relief Requests",
    question: "How do I submit an emergency relief request?",
    answer:
      "Navigate to 'New Request' from your dashboard sidebar. Select the request category (Food, Water, Medicine, Shelter, Rescue), fill in your location details down to the local body level, specify the number of affected individuals, and submit. The platform will automatically route your request to the nearest available NGO.",
  },
  {
    category: "Relief Requests",
    question: "What do the different request status levels mean?",
    answer:
      "• Pending: Request submitted and awaiting routing.\n• NGO Assigned: Automated engine assigned your request to a local NGO.\n• NGO Accepted & Verified: The assigned NGO verified authenticity.\n• Resources Reserved: Relief supplies reserved in inventory.\n• In Transit: Volunteer or NGO response team en route to deliver.\n• Delivered: Supplies arrived; awaiting your confirmation.",
  },
  {
    category: "NGO & Inventory",
    question: "How does NGO verification work?",
    answer:
      "NGO representatives register during signup. Platform administrators review organization credentials and verify official documentation before enabling full dispatch and resource allocation permissions.",
  },
  {
    category: "NGO & Inventory",
    question: "How do NGOs manage supply inventory and Excel imports?",
    answer:
      "NGO managers can add items individually or use the 'Bulk Import' feature to upload standardized Excel (.xlsx) templates. The platform validates quantities and categories before writing to the database.",
  },
  {
    category: "Shelters & Volunteers",
    question: "How can citizens find open relief shelters?",
    answer:
      "Visit the 'Shelters' page in the sidebar. You can search shelters by sector or district to view current occupancy rates, total capacity, manager contact details, and operational status.",
  },
  {
    category: "Shelters & Volunteers",
    question: "How do registered volunteers join disaster response operations?",
    answer:
      "Volunteers registered with 'Volunteer' role can access the Volunteer Dashboard, view active disaster incidents in their district, and click 'Opt-In to Respond' to join relief deployment rosters.",
  },
  {
    category: "Account & Security",
    question: "How is my personal and location data protected?",
    answer:
      "All requests and authentication data are encrypted using Supabase JWT tokens and HTTPS/TLS transport. Access to exact contact information is restricted strictly to assigned responders and verified NGOs.",
  },
];

export const HelpCenter: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Relief Requests", "NGO & Inventory", "Shelters & Volunteers", "Account & Security"];

  const filteredFaqs = FAQS.filter((faq) =>
    selectedCategory === "All" ? true : faq.category === selectedCategory
  );

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Help Center & Operating Guides"
        description="Explore platform documentation, request workflows, disaster response protocols, and emergency assistance."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Help Center" }]}
      />

      {/* Emergency Hotlines Banner */}
      <div
        style={{
          backgroundColor: "rgba(239, 68, 68, 0.08)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "14px",
          padding: "20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "var(--danger, #EF4444)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PhoneCall size={22} />
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-h, #0F172A)" }}>
              Emergency Hotline Quick Contacts
            </div>
            <div style={{ fontSize: "13px", color: "var(--secondary, #475569)" }}>
              State Disaster Control Room: <strong>1077</strong> | Police: <strong>112</strong> | Fire & Rescue: <strong>101</strong>
            </div>
          </div>
        </div>
        <Link
          to="/contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 16px",
            borderRadius: "10px",
            backgroundColor: "var(--danger, #EF4444)",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          Contact Support <ArrowRight size={14} />
        </Link>
      </div>

      {/* Category Pills */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 600,
              border: "1px solid var(--border, #E2E8F0)",
              cursor: "pointer",
              backgroundColor: selectedCategory === cat ? "var(--primary, #0284C7)" : "var(--card-bg, #FFFFFF)",
              color: selectedCategory === cat ? "#FFFFFF" : "var(--secondary, #64748B)",
              transition: "all 0.15s ease",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <Card title={`Frequently Asked Questions (${filteredFaqs.length})`}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  border: "1px solid var(--border, #E2E8F0)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  backgroundColor: "var(--bg, #F8FAFC)",
                }}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "var(--text-h, #0F172A)",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <HelpCircle size={16} color="var(--primary, #0284C7)" />
                    {faq.question}
                  </span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: "0 18px 16px 44px",
                      fontSize: "14px",
                      color: "var(--secondary, #475569)",
                      lineHeight: "1.6",
                      whiteSpace: "pre-line",
                      borderTop: "1px solid var(--border, #E2E8F0)",
                      paddingTop: "12px",
                      backgroundColor: "var(--card-bg, #FFFFFF)",
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </PageContainer>
  );
};

export default HelpCenter;
