import api from "./api.js";
import { extractData, createResourceApi } from "./baseService.js";
import type { NGOProfileData } from "@disaster-platform/shared";

export type { NGOProfileData };

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

const baseNgo = createResourceApi<NGOProfileData, CreateNGOPayload, Partial<Omit<CreateNGOPayload, "userId">>>("/ngos");

export const ngoApi = {
  ...baseNgo,

  getAll: (params?: { isActive?: boolean }) =>
    api.get<{ data: NGOProfileData[] }>("/ngos", { params }).then(extractData),

  getMyProfile: (userId: string) =>
    api.get<{ data: NGOProfileData }>(`/ngos/profile/${userId}`).then(extractData),

  toggle: (id: string) =>
    api.post<{ data: NGOProfileData }>(`/ngos/${id}/toggle`).then(extractData),
};
