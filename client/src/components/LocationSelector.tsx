import React, { useState, useCallback } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";
import {
  KERALA_DISTRICTS,
  getTaluks,
  getLocalBodies,
  getWards,
} from "../data/keralaLocations.js";

export interface LocationValue {
  stateId:       string;
  stateName:     string;
  districtId:    string;
  districtName:  string;
  talukId:       string;
  talukName:     string;
  localBodyId:   string;
  localBodyName: string;
  localBodyType: "panchayat" | "municipality" | "corporation";
  wardId?:       string;
  wardName?:     string;
  landmark?:     string;
  gpsLat?:       number;
  gpsLng?:       number;
}

interface Props {
  value:    LocationValue;
  onChange: (value: LocationValue) => void;
  errors?:  Partial<Record<keyof LocationValue, string>>;
}

const selectStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: "10px",
  border: "1px solid var(--border)", backgroundColor: "var(--bg)",
  fontSize: "14px", color: "var(--text-h)", boxSizing: "border-box",
  appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "36px",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "13px", fontWeight: 600,
  color: "var(--text-h)", marginBottom: "6px",
};

const errorStyle: React.CSSProperties = {
  fontSize: "12px", color: "var(--danger)", marginTop: "4px",
};

export const LocationSelector: React.FC<Props> = ({ value, onChange, errors = {} }) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError,   setGpsError]   = useState("");

  const districts  = KERALA_DISTRICTS.map(({ id, name }) => ({ id, name }));
  const taluks     = value.districtId ? getTaluks(value.districtId)         : [];
  const localBodies= value.talukId    ? getLocalBodies(value.talukId)       : [];
  const wards      = value.localBodyId? getWards(value.localBodyId)         : [];

  const update = (patch: Partial<LocationValue>) =>
    onChange({ ...value, ...patch });

  const handleDistrict = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id   = e.target.value;
    const name = KERALA_DISTRICTS.find((d) => d.id === id)?.name ?? "";
    onChange({
      ...value,
      districtId: id, districtName: name,
      talukId: "", talukName: "",
      localBodyId: "", localBodyName: "", localBodyType: "panchayat",
      wardId: "", wardName: "",
    });
  };

  const handleTaluk = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id   = e.target.value;
    const name = taluks.find((t) => t.id === id)?.name ?? "";
    onChange({
      ...value,
      talukId: id, talukName: name,
      localBodyId: "", localBodyName: "", localBodyType: "panchayat",
      wardId: "", wardName: "",
    });
  };

  const handleLocalBody = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const lb = localBodies.find((l) => l.id === id);
    onChange({
      ...value,
      localBodyId:   id,
      localBodyName: lb?.name ?? "",
      localBodyType: lb?.type ?? "panchayat",
      wardId: "", wardName: "",
    });
  };

  const handleWard = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id   = e.target.value;
    const name = wards.find((w) => w.id === id)?.name ?? "";
    update({ wardId: id, wardName: name });
  };

  const detectGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update({ gpsLat: pos.coords.latitude, gpsLng: pos.coords.longitude });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(
          err.code === 1
            ? "Location access denied. Please allow location access in your browser."
            : "Unable to determine location. Please try again."
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [value, onChange]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* State — fixed to Kerala */}
      <div>
        <label style={labelStyle}>State</label>
        <div style={{ ...selectStyle, backgroundColor: "var(--card-bg)", color: "var(--secondary)", cursor: "not-allowed", display: "flex", alignItems: "center" }}>
          Kerala (KL)
        </div>
      </div>

      {/* District */}
      <div>
        <label style={labelStyle}>
          District <span style={{ color: "var(--danger)" }}>*</span>
        </label>
        <select value={value.districtId} onChange={handleDistrict} style={selectStyle} required>
          <option value="">Select district…</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        {errors.districtId && <p style={errorStyle}>{errors.districtId}</p>}
      </div>

      {/* Taluk */}
      <div>
        <label style={labelStyle}>
          Taluk / Subdistrict <span style={{ color: "var(--danger)" }}>*</span>
        </label>
        <select
          value={value.talukId}
          onChange={handleTaluk}
          disabled={!value.districtId}
          style={{ ...selectStyle, opacity: value.districtId ? 1 : 0.5 }}
          required
        >
          <option value="">{value.districtId ? "Select taluk…" : "Select district first"}</option>
          {taluks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {errors.talukId && <p style={errorStyle}>{errors.talukId}</p>}
      </div>

      {/* Local Body */}
      <div>
        <label style={labelStyle}>
          Panchayat / Municipality / Corporation <span style={{ color: "var(--danger)" }}>*</span>
        </label>
        <select
          value={value.localBodyId}
          onChange={handleLocalBody}
          disabled={!value.talukId}
          style={{ ...selectStyle, opacity: value.talukId ? 1 : 0.5 }}
          required
        >
          <option value="">{value.talukId ? "Select local body…" : "Select taluk first"}</option>
          {localBodies.map((lb) => (
            <option key={lb.id} value={lb.id}>
              {lb.name} ({lb.type === "corporation" ? "Municipal Corp." : lb.type === "municipality" ? "Municipality" : "Grama Panchayat"})
            </option>
          ))}
        </select>
        {errors.localBodyId && <p style={errorStyle}>{errors.localBodyId}</p>}
      </div>

      {/* Ward — optional */}
      {wards.length > 0 && (
        <div>
          <label style={labelStyle}>Ward (Optional)</label>
          <select
            value={value.wardId ?? ""}
            onChange={handleWard}
            style={selectStyle}
          >
            <option value="">Select ward (optional)…</option>
            {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
      )}

      {/* Landmark */}
      <div>
        <label style={labelStyle}>Landmark / Nearby Building (Optional)</label>
        <div style={{ position: "relative" }}>
          <MapPin size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--secondary)" }} />
          <input
            type="text"
            value={value.landmark ?? ""}
            onChange={(e) => update({ landmark: e.target.value })}
            placeholder="e.g. Near St. John's Church, opposite community hall"
            style={{ ...selectStyle, paddingLeft: "34px" }}
          />
        </div>
      </div>

      {/* GPS Coordinates */}
      <div>
        <label style={labelStyle}>GPS Coordinates (Optional - improves routing)</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={value.gpsLat ?? ""}
              onChange={(e) => update({ gpsLat: parseFloat(e.target.value) || undefined })}
              placeholder="Latitude"
              step="any"
              style={selectStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              value={value.gpsLng ?? ""}
              onChange={(e) => update({ gpsLng: parseFloat(e.target.value) || undefined })}
              placeholder="Longitude"
              step="any"
              style={selectStyle}
            />
          </div>
          <button
            type="button"
            onClick={detectGPS}
            disabled={gpsLoading}
            title="Auto-detect location"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "10px 14px", borderRadius: "10px",
              border: "1px solid var(--border)", backgroundColor: gpsLoading ? "var(--bg)" : "var(--card-bg)",
              color: "var(--primary)", fontWeight: 600, fontSize: "13px",
              cursor: gpsLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
            }}
          >
            {gpsLoading
              ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              : <Navigation size={14} />}
            {gpsLoading ? "Detecting…" : "Auto Detect"}
          </button>
        </div>
        {value.gpsLat && value.gpsLng && (
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--success)", display: "flex", alignItems: "center", gap: "4px" }}>
            <Navigation size={11} /> Located: {value.gpsLat.toFixed(5)}, {value.gpsLng.toFixed(5)}
          </p>
        )}
        {gpsError && <p style={{ ...errorStyle, marginTop: "6px" }}>{gpsError}</p>}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LocationSelector;
