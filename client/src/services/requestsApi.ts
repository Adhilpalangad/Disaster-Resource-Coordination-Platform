import api from "./api.js";
import type { ReliefRequest } from "../types/index.js";
import type { RequestLocation } from "../types/index.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function extract<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

// ── Payload types ─────────────────────────────────────────────────────────────

export interface CreateRequestPayload {
  createdBy:      string;
  fullName:       string;
  mobileNumber:   string;
  peopleAffected: number;
  ageGroups:      string[];
  specialNeeds:   string[];
  disasterId?:    string;
  disasterName?:  string;
  category:       string;
  urgency:        string;
  description:    string;
  location:       RequestLocation;
  image?:         File;
}

export interface GetAllFilters {
  createdBy?:         string;
  status?:            string;
  urgency?:           string;
  category?:          string;
  districtId?:        string;
  assignedNGO?:       string;
  assignedVolunteer?: string;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const requestsApi = {

  getAll: (filters: GetAllFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    return api
      .get<{ data: ReliefRequest[] }>(`/requests?${params.toString()}`)
      .then(extract);
  },

  getById: (id: string) =>
    api.get<{ data: ReliefRequest }>(`/requests/${id}`).then(extract),

  create: (payload: CreateRequestPayload) => {
    const form = new FormData();
    form.append("createdBy",      payload.createdBy);
    form.append("fullName",       payload.fullName);
    form.append("mobileNumber",   payload.mobileNumber);
    form.append("peopleAffected", String(payload.peopleAffected));
    form.append("ageGroups",      JSON.stringify(payload.ageGroups));
    form.append("specialNeeds",   JSON.stringify(payload.specialNeeds));
    if (payload.disasterId)   form.append("disasterId",   payload.disasterId);
    if (payload.disasterName) form.append("disasterName", payload.disasterName);
    form.append("category",    payload.category);
    form.append("urgency",     payload.urgency);
    form.append("description", payload.description);
    form.append("location",    JSON.stringify(payload.location));
    if (payload.image) form.append("image", payload.image);

    return api
      .post<{ data: ReliefRequest }>("/requests", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(extract);
  },

  remove: (id: string) => api.delete(`/requests/${id}`),

  // ── NGO actions ─────────────────────────────────────────────────────────────
  accept:           (id: string)              => api.post<{ data: ReliefRequest }>(`/requests/${id}/accept`).then(extract),
  verify:           (id: string)              => api.post<{ data: ReliefRequest }>(`/requests/${id}/verify`).then(extract),
  reject:           (id: string, note: string)=> api.post<{ data: ReliefRequest }>(`/requests/${id}/reject`, { note }).then(extract),
  reserveResources: (id: string)              => api.post<{ data: ReliefRequest }>(`/requests/${id}/reserve-resources`).then(extract),
  assignVolunteer:  (id: string, payload: { volunteerId: string; volunteerName: string; estimatedArrival?: string }) =>
    api.post<{ data: ReliefRequest }>(`/requests/${id}/assign-volunteer`, payload).then(extract),

  // ── Volunteer actions ────────────────────────────────────────────────────────
  markInTransit: (id: string) => api.post<{ data: ReliefRequest }>(`/requests/${id}/in-transit`).then(extract),
  markDelivered: (id: string) => api.post<{ data: ReliefRequest }>(`/requests/${id}/delivered`).then(extract),

  // ── Citizen confirmation ─────────────────────────────────────────────────────
  confirmDelivery: (id: string, feedback?: string) =>
    api.post<{ data: ReliefRequest }>(`/requests/${id}/confirm`, { feedback }).then(extract),
};
