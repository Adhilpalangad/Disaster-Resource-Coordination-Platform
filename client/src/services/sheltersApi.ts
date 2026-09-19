import api from "./api.js";

export interface ShelterData {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  occupancy: number;
  status: "verified" | "in_progress" | "pending" | "resolved";
  manager: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShelterPayload {
  name: string;
  location: string;
  capacity: number;
  occupancy?: number;
  status?: "verified" | "in_progress" | "pending" | "resolved";
  manager: string;
  phone?: string;
  notes?: string;
}

function extract<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

export const sheltersApi = {
  getAll: (params?: { search?: string }) =>
    api.get<{ data: ShelterData[] }>("/shelters", { params }).then(extract),

  getById: (id: string) =>
    api.get<{ data: ShelterData }>(`/shelters/${id}`).then(extract),

  create: (payload: CreateShelterPayload) =>
    api.post<{ data: ShelterData }>("/shelters", payload).then(extract),

  update: (id: string, payload: Partial<CreateShelterPayload>) =>
    api.put<{ data: ShelterData }>(`/shelters/${id}`, payload).then(extract),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/shelters/${id}`).then((res) => res.data),
};
