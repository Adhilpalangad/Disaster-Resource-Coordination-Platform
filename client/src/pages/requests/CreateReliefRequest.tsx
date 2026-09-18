import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, AlertCircle, Upload, ChevronRight, ChevronLeft,
  Utensils, Droplets, HeartPulse, Home, AlertTriangle, Truck, Package,
  Users, Phone, User,
} from "lucide-react";
import { useAuth }         from "../../context/AuthContext.js";
import { requestsApi }     from "../../services/requestsApi.js";
import { disastersApi }    from "../../services/disastersApi.js";
import type {
  RequestCategory, UrgencyLevel, AgeGroup, SpecialNeed, Disaster,
} from "../../types/index.js";
import type { LocationValue } from "../../components/LocationSelector.js";
import PageContainer     from "../../components/PageContainer.js";
import PageHeader        from "../../components/PageHeader.js";
import Card              from "../../components/Card.js";
import StepIndicator     from "../../components/StepIndicator.js";
import LocationSelector  from "../../components/LocationSelector.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = ["Personal Info", "Request Details", "Location", "Review & Submit"];

const CATEGORIES: { value: RequestCategory; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "food",          label: "Food & Nutrition",      icon: Utensils,      desc: "Cooked meals, dry rations, infant food" },
  { value: "water",         label: "Clean Water",           icon: Droplets,      desc: "Drinking water, purification" },
  { value: "medicine",      label: "Medical Aid",           icon: HeartPulse,    desc: "First aid, prescription drugs, medical equipment" },
  { value: "shelter",       label: "Emergency Shelter",     icon: Home,          desc: "Temporary housing, tarpaulin, tents" },
  { value: "rescue",        label: "Rescue / Evacuation",   icon: AlertTriangle, desc: "Trapped persons, boat rescue, evacuation" },
  { value: "transportation",label: "Transportation",        icon: Truck,         desc: "Ambulance, vehicle, evacuation transport" },
  { value: "other",         label: "Other Assistance",      icon: Package,       desc: "Clothing, hygiene kits, other needs" },
];

const URGENCY_CONFIG: { value: UrgencyLevel; label: string; color: string; bg: string; desc: string }[] = [
  { value: "low",      label: "Low",      color: "var(--success)", bg: "rgba(5,150,105,0.08)",  desc: "Can wait 24–48 hours" },
  { value: "medium",   label: "Medium",   color: "var(--warning)", bg: "rgba(245,158,11,0.08)", desc: "Required today" },
  { value: "high",     label: "High",     color: "var(--danger)",  bg: "rgba(239,68,68,0.08)",  desc: "Within a few hours" },
  { value: "critical", label: "Critical", color: "#7c3aed",        bg: "rgba(124,58,237,0.08)", desc: "Life-threatening — immediate" },
];

const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: "child",   label: "Children (under 18)" },
  { value: "adult",   label: "Adults (18–60)"      },
  { value: "elderly", label: "Elderly (60+)"       },
];

const SPECIAL_NEEDS: { value: SpecialNeed; label: string }[] = [
  { value: "disabled",          label: "Physically disabled" },
  { value: "pregnant",          label: "Pregnant woman"      },
  { value: "medical_condition", label: "Chronic medical condition" },
  { value: "none",              label: "None"                },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1
  fullName:       string;
  mobileNumber:   string;
  peopleAffected: number;
  ageGroups:      AgeGroup[];
  specialNeeds:   SpecialNeed[];
  // Step 2
  disasterId:     string;
  disasterName:   string;
  category:       RequestCategory;
  urgency:        UrgencyLevel;
  description:    string;
  imageFile:      File | null;
  // Step 3
  location: LocationValue;
}

const BLANK_LOCATION: LocationValue = {
  stateId: "KL", stateName: "Kerala",
  districtId: "", districtName: "",
  talukId: "", talukName: "",
  localBodyId: "", localBodyName: "", localBodyType: "panchayat",
  wardId: "", wardName: "", landmark: "",
};

// ── Field styles ──────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: "10px",
  border: "1px solid var(--border)", backgroundColor: "var(--bg)",
  fontSize: "14px", color: "var(--text-h)", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "13px", fontWeight: 600,
  color: "var(--text-h)", marginBottom: "6px",
};

// ── Component ─────────────────────────────────────────────────────────────────

export const CreateReliefRequest: React.FC = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [step,      setStep]      = useState(0);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [submitting,setSubmitting]= useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success,   setSuccess]   = useState(false);
  const [formData,  setFormData]  = useState<FormData>({
    fullName:       user?.name ?? "",
    mobileNumber:   user?.phone ?? "",
    peopleAffected: 1,
    ageGroups:      ["adult"],
    specialNeeds:   ["none"],
    disasterId:     "",
    disasterName:   "",
    category:       "food",
    urgency:        "medium",
    description:    "",
    imageFile:      null,
    location:       BLANK_LOCATION,
  });

  useEffect(() => {
    disastersApi.getActive().then(setDisasters).catch(() => setDisasters([]));
  }, []);

  const update = (patch: Partial<FormData>) =>
    setFormData((f) => ({ ...f, ...patch }));

  // Toggle array helpers
  const toggleAgeGroup = (v: AgeGroup) =>
    update({
      ageGroups: formData.ageGroups.includes(v)
        ? formData.ageGroups.filter((x) => x !== v)
        : [...formData.ageGroups, v],
    });

  const toggleSpecialNeed = (v: SpecialNeed) => {
    if (v === "none") { update({ specialNeeds: ["none"] }); return; }
    const next = formData.specialNeeds.filter((x) => x !== "none");
    update({
      specialNeeds: next.includes(v) ? next.filter((x) => x !== v) : [...next, v],
    });
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};

    if (s === 0) {
      if (!formData.fullName.trim())       e.fullName       = "Full name is required.";
      if (!formData.mobileNumber.trim())   e.mobileNumber   = "Mobile number is required.";
      if (formData.peopleAffected < 1)     e.peopleAffected = "At least 1 person must be affected.";
      if (formData.ageGroups.length === 0) e.ageGroups      = "Select at least one age group.";
    }
    if (s === 1) {
      if (!formData.description.trim())    e.description    = "Please describe the need in detail.";
    }
    if (s === 2) {
      if (!formData.location.districtId)   e.districtId  = "District is required.";
      if (!formData.location.talukId)      e.talukId     = "Taluk is required.";
      if (!formData.location.localBodyId)  e.localBodyId = "Panchayat / Municipality is required.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => { if (validateStep(step)) setStep((s) => s + 1); };
  const goBack = () => { setErrors({}); setStep((s) => s - 1); };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await requestsApi.create({
        createdBy:      user.id,
        fullName:       formData.fullName,
        mobileNumber:   formData.mobileNumber,
        peopleAffected: formData.peopleAffected,
        ageGroups:      formData.ageGroups,
        specialNeeds:   formData.specialNeeds,
        disasterId:     formData.disasterId || undefined,
        disasterName:   formData.disasterName || undefined,
        category:       formData.category,
        urgency:        formData.urgency,
        description:    formData.description,
        location:       formData.location,
        image:          formData.imageFile ?? undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate("/requests"), 2200);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <PageContainer maxWidth="520px">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "380px", textAlign: "center", gap: "18px", backgroundColor: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--border)", padding: "52px 40px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(5,150,105,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle size={32} color="var(--success)" />
          </div>
          <div>
            <h2 style={{ margin: "0 0 10px", color: "var(--text-h)", fontSize: "20px" }}>Request Submitted</h2>
            <p style={{ margin: 0, color: "var(--secondary)", fontSize: "14px", lineHeight: 1.6 }}>
              The system is automatically routing your request to the nearest eligible NGO in{" "}
              <strong>{formData.location.districtName}</strong>.
              You can track progress in <strong>My Requests</strong>.
            </p>
          </div>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--secondary)" }}>Redirecting in a moment…</p>
        </div>
      </PageContainer>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────────
  return (
    <PageContainer maxWidth="760px">
      <PageHeader
        title="Submit Relief Request"
        description="Provide accurate information so the system can route your request to the right NGO and volunteers."
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "My Requests", path: "/requests" },
          { label: "Submit Request" },
        ]}
      />

      <StepIndicator steps={STEPS} current={step} />

      {/* ── Step 1: Personal Information ──────────────────────────────────── */}
      {step === 0 && (
        <Card title="Personal Information">
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}><User size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />Full Name <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" value={formData.fullName} onChange={(e) => update({ fullName: e.target.value })}
                  placeholder="As per official records" style={inputStyle} />
                {errors.fullName && <p style={{ fontSize: "12px", color: "var(--danger)", margin: "4px 0 0" }}>{errors.fullName}</p>}
              </div>
              <div>
                <label style={labelStyle}><Phone size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />Mobile Number <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="tel" value={formData.mobileNumber} onChange={(e) => update({ mobileNumber: e.target.value })}
                  placeholder="+91 XXXXX XXXXX" style={inputStyle} />
                {errors.mobileNumber && <p style={{ fontSize: "12px", color: "var(--danger)", margin: "4px 0 0" }}>{errors.mobileNumber}</p>}
              </div>
            </div>

            <div>
              <label style={labelStyle}><Users size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />Number of People Affected <span style={{ color: "var(--danger)" }}>*</span></label>
              <input type="number" min={1} max={9999} value={formData.peopleAffected}
                onChange={(e) => update({ peopleAffected: parseInt(e.target.value, 10) || 1 })}
                style={{ ...inputStyle, maxWidth: "200px" }} />
              {errors.peopleAffected && <p style={{ fontSize: "12px", color: "var(--danger)", margin: "4px 0 0" }}>{errors.peopleAffected}</p>}
            </div>

            <div>
              <label style={labelStyle}>Age Groups Present <span style={{ color: "var(--danger)" }}>*</span></label>
              <p style={{ margin: "0 0 12px", fontSize: "12px", color: "var(--secondary)" }}>Select all that apply among the affected group.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {AGE_GROUPS.map(({ value: v, label }) => (
                  <label key={v} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px 14px", borderRadius: "9px", border: `1px solid ${formData.ageGroups.includes(v) ? "var(--primary)" : "var(--border)"}`, backgroundColor: formData.ageGroups.includes(v) ? "rgba(2,132,199,0.06)" : "var(--bg)" }}>
                    <input type="checkbox" checked={formData.ageGroups.includes(v)} onChange={() => toggleAgeGroup(v)}
                      style={{ width: "16px", height: "16px", accentColor: "var(--primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-h)" }}>{label}</span>
                  </label>
                ))}
              </div>
              {errors.ageGroups && <p style={{ fontSize: "12px", color: "var(--danger)", margin: "8px 0 0" }}>{errors.ageGroups}</p>}
            </div>

            <div>
              <label style={labelStyle}>Special Needs</label>
              <p style={{ margin: "0 0 12px", fontSize: "12px", color: "var(--secondary)" }}>Select any applicable conditions to prioritise your request.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {SPECIAL_NEEDS.map(({ value: v, label }) => (
                  <label key={v} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px 14px", borderRadius: "9px", border: `1px solid ${formData.specialNeeds.includes(v) ? "var(--primary)" : "var(--border)"}`, backgroundColor: formData.specialNeeds.includes(v) ? "rgba(2,132,199,0.06)" : "var(--bg)" }}>
                    <input type="checkbox" checked={formData.specialNeeds.includes(v)} onChange={() => toggleSpecialNeed(v)}
                      style={{ width: "16px", height: "16px", accentColor: "var(--primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-h)" }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </Card>
      )}

      {/* ── Step 2: Disaster & Request Details ────────────────────────────── */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Card title="Select Active Disaster (Optional)">
            <p style={{ margin: "0 0 14px", fontSize: "13px", color: "var(--secondary)" }}>
              Link your request to an active relief operation for faster routing.
            </p>
            {disasters.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--secondary)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                No active disaster operations are registered currently.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "12px 14px", borderRadius: "9px", border: `1px solid ${!formData.disasterId ? "var(--primary)" : "var(--border)"}`, backgroundColor: !formData.disasterId ? "rgba(2,132,199,0.06)" : "var(--bg)" }}>
                  <input type="radio" name="disaster" value="" checked={!formData.disasterId} onChange={() => update({ disasterId: "", disasterName: "" })}
                    style={{ accentColor: "var(--primary)" }} />
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-h)" }}>Not linked to a specific disaster</span>
                </label>
                {disasters.map((d) => (
                  <label key={d._id} style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", padding: "12px 14px", borderRadius: "9px", border: `1px solid ${formData.disasterId === d._id ? "var(--primary)" : "var(--border)"}`, backgroundColor: formData.disasterId === d._id ? "rgba(2,132,199,0.06)" : "var(--bg)" }}>
                    <input type="radio" name="disaster" value={d._id} checked={formData.disasterId === d._id}
                      onChange={() => update({ disasterId: d._id, disasterName: d.title })}
                      style={{ accentColor: "var(--primary)", marginTop: "3px" }} />
                    <div>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text-h)" }}>{d.title}</p>
                      <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--secondary)" }}>
                        {d.affectedDistrictNames.join(", ")} · Severity: {d.severity.toUpperCase()}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </Card>

          <Card title="What Kind of Help Do You Need?">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px" }}>
              {CATEGORIES.map(({ value: v, label, icon: Icon, desc }) => {
                const active = formData.category === v;
                return (
                  <button key={v} type="button" onClick={() => update({ category: v })}
                    title={desc}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "16px 10px", borderRadius: "10px", cursor: "pointer", border: `2px solid ${active ? "var(--primary)" : "var(--border)"}`, backgroundColor: active ? "rgba(2,132,199,0.08)" : "var(--bg)", color: active ? "var(--primary)" : "var(--text-h)", fontWeight: active ? 700 : 500, fontSize: "13px", transition: "border-color 0.15s, background-color 0.15s", textAlign: "center" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: active ? "rgba(2,132,199,0.15)" : "rgba(100,116,139,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={18} />
                    </div>
                    {label}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Urgency Level">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
              {URGENCY_CONFIG.map(({ value: v, label, color, bg, desc }) => {
                const active = formData.urgency === v;
                return (
                  <button key={v} type="button" onClick={() => update({ urgency: v })}
                    style={{ padding: "14px", borderRadius: "10px", cursor: "pointer", textAlign: "left", border: `2px solid ${active ? color : "var(--border)"}`, backgroundColor: active ? bg : "var(--bg)", transition: "border-color 0.15s, background-color 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, fontSize: "13px", color: active ? color : "var(--text-h)" }}>{label}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "11px", color: "var(--secondary)" }}>{desc}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Describe Your Need">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Detailed Description <span style={{ color: "var(--danger)" }}>*</span></label>
                <textarea value={formData.description} onChange={(e) => update({ description: e.target.value })}
                  rows={5} required
                  placeholder="Describe the situation clearly: quantities needed, medical conditions, access restrictions, road damage, number of meals required, specific medication names, etc. More detail = faster routing."
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--sans)", lineHeight: 1.6 }} />
                {errors.description && <p style={{ fontSize: "12px", color: "var(--danger)", margin: "4px 0 0" }}>{errors.description}</p>}
              </div>

              <div>
                <label style={labelStyle}>Photo Evidence (Optional)</label>
                <label htmlFor="req-image-upload"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", border: "2px dashed var(--border)", borderRadius: "12px", padding: "28px", backgroundColor: "var(--bg)", cursor: "pointer", textAlign: "center", transition: "border-color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
                  <Upload size={22} color="var(--primary)" />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>
                    {formData.imageFile ? formData.imageFile.name : "Click to attach a photo"}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--secondary)" }}>JPG, PNG, WEBP · Max 5 MB</span>
                </label>
                <input id="req-image-upload" type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => update({ imageFile: e.target.files?.[0] ?? null })}
                  style={{ display: "none" }} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Step 3: Location ──────────────────────────────────────────────── */}
      {step === 2 && (
        <Card title="Structured Location">
          <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--secondary)", lineHeight: 1.6 }}>
            Select your exact administrative location. The system uses this hierarchy to automatically find NGOs and volunteers operating in your area.
          </p>
          <LocationSelector
            value={formData.location}
            onChange={(loc) => update({ location: loc })}
            errors={{
              districtId:  errors.districtId,
              talukId:     errors.talukId,
              localBodyId: errors.localBodyId,
            }}
          />
        </Card>
      )}

      {/* ── Step 4: Review & Submit ────────────────────────────────────────── */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card title="Review Your Request">
            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--secondary)" }}>
              Please review all details before submitting. Once submitted, the system will automatically route this request to the nearest eligible NGO.
            </p>

            {/* Personal */}
            <Section label="Personal Information">
              <Row label="Full Name"           value={formData.fullName} />
              <Row label="Mobile"              value={formData.mobileNumber} />
              <Row label="People Affected"     value={String(formData.peopleAffected)} />
              <Row label="Age Groups"          value={formData.ageGroups.join(", ") || "—"} />
              <Row label="Special Needs"       value={formData.specialNeeds.join(", ") || "—"} />
            </Section>

            {/* Request */}
            <Section label="Request Details">
              {formData.disasterName && <Row label="Disaster"  value={formData.disasterName} />}
              <Row label="Category"  value={CATEGORIES.find((c) => c.value === formData.category)?.label ?? formData.category} />
              <Row label="Urgency"   value={formData.urgency.toUpperCase()} />
              <Row label="Description" value={formData.description} multiline />
              {formData.imageFile && <Row label="Photo" value={formData.imageFile.name} />}
            </Section>

            {/* Location */}
            <Section label="Location">
              <Row label="State"          value={formData.location.stateName || "Kerala"} />
              <Row label="District"       value={formData.location.districtName} />
              <Row label="Taluk"          value={formData.location.talukName} />
              <Row label="Local Body"     value={formData.location.localBodyName} />
              {formData.location.wardName   && <Row label="Ward"     value={formData.location.wardName} />}
              {formData.location.landmark   && <Row label="Landmark" value={formData.location.landmark} />}
              {formData.location.gpsLat     && <Row label="GPS"      value={`${formData.location.gpsLat.toFixed(5)}, ${formData.location.gpsLng?.toFixed(5)}`} />}
            </Section>
          </Card>

          {/* Info banner */}
          <div style={{ padding: "13px 16px", borderRadius: "10px", backgroundColor: "rgba(2,132,199,0.07)", border: "1px solid rgba(2,132,199,0.18)", display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <AlertCircle size={15} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-h)", lineHeight: 1.5 }}>
              On submission, the routing engine will scan NGOs covering <strong>{formData.location.districtName || "your location"}</strong> and automatically assign the best-matched organisation. You will be able to track the status in <strong>My Requests</strong>.
            </p>
          </div>

          {submitError && (
            <div style={{ padding: "13px 16px", borderRadius: "10px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", gap: "10px", color: "var(--danger)", fontSize: "13px" }}>
              <AlertCircle size={15} /> {submitError}
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        {step > 0 && (
          <button onClick={goBack}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "12px 20px", borderRadius: "10px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <button
          onClick={step < STEPS.length - 1 ? goNext : handleSubmit}
          disabled={submitting}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px 20px", borderRadius: "10px", border: "none", backgroundColor: submitting ? "var(--secondary)" : "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: submitting ? "not-allowed" : "pointer", transition: "background-color 0.15s" }}>
          {step < STEPS.length - 1
            ? (<>Next <ChevronRight size={16} /></>)
            : submitting ? "Submitting…" : "Submit Relief Request"}
        </button>
      </div>
    </PageContainer>
  );
};

export default CreateReliefRequest;

// ── Review helpers ────────────────────────────────────────────────────────────

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: "20px" }}>
    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
      {label}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{children}</div>
  </div>
);

const Row: React.FC<{ label: string; value: string; multiline?: boolean }> = ({ label, value, multiline }) => (
  <div style={{ display: multiline ? "block" : "flex", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--secondary)", whiteSpace: "nowrap", minWidth: "130px", flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: "13px", color: "var(--text-h)", wordBreak: "break-word", lineHeight: multiline ? 1.6 : 1.4, marginTop: multiline ? "4px" : undefined, display: multiline ? "block" : undefined }}>
      {value || <span style={{ color: "var(--secondary)" }}>—</span>}
    </span>
  </div>
);
