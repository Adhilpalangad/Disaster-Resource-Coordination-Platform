import api from "./api.js";
import type { Disaster } from "../types/index.js";

function extract<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

export interface CreateDisasterPayload {
  title: string;
  type: string;
  severity: string;
  status: string;
  affectedDistrictIds: string[];
  affectedDistrictNames: string[];
  startedAt?: string;
  description: string;
}

export type UpdateDisasterPayload = Partial<CreateDisasterPayload>;

export const disastersApi = {
  getAll:   ()               => api.get<{ data: Disaster[] }>("/disasters").then(extract),
  getActive: ()              => api.get<{ data: Disaster[] }>("/disasters/active").then(extract),
  getById:  (id: string)     => api.get<{ data: Disaster }>(`/disasters/${id}`).then(extract),
  create:   (payload: CreateDisasterPayload) =>
    api.post<{ data: Disaster }>("/disasters", payload).then(extract),
  update:   (id: string, payload: UpdateDisasterPayload) =>
    api.put<{ data: Disaster }>(`/disasters/${id}`, payload).then(extract),
  remove:   (id: string) =>
    api.delete(`/disasters/${id}`).then((r) => r.data as { success: boolean; message: string }),
  seed:     () =>
    api.post("/disasters/seed").then((r) => r.data as { success: boolean; message: string }),
};
