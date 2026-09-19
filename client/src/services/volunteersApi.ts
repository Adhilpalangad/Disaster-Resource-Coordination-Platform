import api from "./api.js";

export interface VolunteerUser {
  _id: string;
  supabaseId: string;
  name: string;
  email: string;
  role: "volunteer";
  phone?: string;
  organizationName?: string;
  district?: string;
  profession?: string;
  createdAt: string;
  updatedAt: string;
}

function extract<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

export const volunteersApi = {
  getAll: (params?: { search?: string; district?: string }) =>
    api.get<{ data: VolunteerUser[] }>("/volunteers", { params }).then(extract),

  getById: (id: string) =>
    api.get<{ data: VolunteerUser }>(`/volunteers/${id}`).then(extract),

  update: (id: string, payload: Partial<Omit<VolunteerUser, "_id" | "supabaseId" | "role">>) =>
    api.patch<{ data: VolunteerUser }>(`/volunteers/${id}`, payload).then(extract),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/volunteers/${id}`).then((res) => res.data),
};
