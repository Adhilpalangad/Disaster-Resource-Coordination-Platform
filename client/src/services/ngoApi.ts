import api from "./api.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NGOProfileData {
  _id:     string;
  userId:  string;
  orgName: string;
  email:   string;
  phone?:  string;
  isActive: boolean;
  serviceAreas: {
    districtIds:  string[];
    talukIds:     string[];
    localBodyIds: string[];
  };
  resourceCapacity:         number;
  currentWorkload:          number;
  acceptanceTimeoutMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNGOPayload {
  userId:       string;
  orgName:      string;
  email:        string;
  phone?:       string;
  serviceAreas: {
    districtIds:  string[];
    talukIds:     string[];
    localBodyIds: string[];
  };
  resourceCapacity?:         number;
  acceptanceTimeoutMinutes?: number;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function extract<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const ngoApi = {
  getAll: (params?: { isActive?: boolean }) =>
    api.get<{ data: NGOProfileData[] }>("/ngos", { params }).then(extract),

  getMyProfile: (userId: string) =>
    api.get<{ data: NGOProfileData }>(`/ngos/profile/${userId}`).then(extract),

  getById: (id: string) =>
    api.get<{ data: NGOProfileData }>(`/ngos/${id}`).then(extract),

  create: (payload: CreateNGOPayload) =>
    api.post<{ data: NGOProfileData }>("/ngos", payload).then(extract),

  update: (id: string, payload: Partial<Omit<CreateNGOPayload, "userId">>) =>
    api.put<{ data: NGOProfileData }>(`/ngos/${id}`, payload).then(extract),

  toggle: (id: string) =>
    api.post<{ data: NGOProfileData }>(`/ngos/${id}/toggle`).then(extract),
};
