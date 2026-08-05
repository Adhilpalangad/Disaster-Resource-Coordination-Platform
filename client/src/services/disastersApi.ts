import api from "./api.js";
import type { Disaster } from "../types/index.js";

function extract<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

export const disastersApi = {
  getActive: () => api.get<{ data: Disaster[] }>("/disasters/active").then(extract),
  getAll:    () => api.get<{ data: Disaster[] }>("/disasters").then(extract),
  getById:   (id: string) => api.get<{ data: Disaster }>(`/disasters/${id}`).then(extract),
};
