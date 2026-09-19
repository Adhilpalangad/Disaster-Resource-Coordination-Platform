import api from "./api.js";
import { extractData, createResourceApi } from "./baseService.js";
import type { ReliefRequest, RequestLocation } from "@disaster-platform/shared";

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

const baseRequests = createResourceApi<ReliefRequest, CreateRequestPayload, Partial<CreateRequestPayload>>("/requests");

export const requestsApi = {
  ...baseRequests,

  create: (payload: CreateRequestPayload, confirmToken?: string) => {
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
    if (confirmToken)  form.append("confirmToken", confirmToken);

    const headers: Record<string, string> = { "Content-Type": "multipart/form-data" };
    if (confirmToken) {
      headers["X-Confirm-Duplicate-Token"] = confirmToken;
    }

    return api
      .post<{ data: ReliefRequest }>("/requests", form, { headers })
      .then(extractData);
  },

  // ── NGO actions ─────────────────────────────────────────────────────────────
  accept:           (id: string)               => api.post<{ data: ReliefRequest }>(`/requests/${id}/accept`).then(extractData),
  verify:           (id: string)               => api.post<{ data: ReliefRequest }>(`/requests/${id}/verify`).then(extractData),
  reject:           (id: string, note: string) => api.post<{ data: ReliefRequest }>(`/requests/${id}/reject`, { note }).then(extractData),
  reserveResources: (id: string)               => api.post<{ data: ReliefRequest }>(`/requests/${id}/reserve-resources`).then(extractData),
  assignVolunteer:  (id: string, payload: { volunteerId: string; volunteerName: string; estimatedArrival?: string }) =>
    api.post<{ data: ReliefRequest }>(`/requests/${id}/assign-volunteer`, payload).then(extractData),

  // ── Volunteer actions ────────────────────────────────────────────────────────
  markInTransit: (id: string) => api.post<{ data: ReliefRequest }>(`/requests/${id}/in-transit`).then(extractData),
  markDelivered: (id: string) => api.post<{ data: ReliefRequest }>(`/requests/${id}/delivered`).then(extractData),

  // ── Citizen confirmation ─────────────────────────────────────────────────────
  confirmDelivery: (id: string, feedback?: string) =>
    api.post<{ data: ReliefRequest }>(`/requests/${id}/confirm`, { feedback }).then(extractData),
};
