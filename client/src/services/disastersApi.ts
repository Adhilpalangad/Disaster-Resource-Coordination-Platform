import api from "./api.js";
import { extractData, createResourceApi } from "./baseService.js";
import type { Disaster, VolunteerDisasterResponse } from "@disaster-platform/shared";

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

const baseDisasters = createResourceApi<Disaster, CreateDisasterPayload, UpdateDisasterPayload>("/disasters");

export const disastersApi = {
  ...baseDisasters,

  getActive: () => api.get<{ data: Disaster[] }>("/disasters/active").then(extractData),
  
  seed: () => api.post("/disasters/seed").then((r) => r.data as { success: boolean; message: string }),

  /** POST /disasters/:id/volunteer-response — volunteer opts in or out */
  respondToDisaster: (disasterId: string, status: "available" | "unavailable") =>
    api.post<{ data: VolunteerDisasterResponse }>(
      `/disasters/${disasterId}/volunteer-response`,
      { status }
    ).then(extractData),

  /** GET /disasters/:id/volunteer-responses — all responses for a disaster */
  getVolunteerResponses: (disasterId: string) =>
    api.get<{ data: VolunteerDisasterResponse[] }>(
      `/disasters/${disasterId}/volunteer-responses`
    ).then(extractData),
};
