import api from "./api.js";
import { extractData } from "./baseService.js";
import type {
  IDuplicateConfig,
  DuplicateAttemptRecord,
  ReliefRequest,
} from "@disaster-platform/shared";

export const adminApi = {
  // Duplicate config settings
  getDuplicateConfig: () =>
    api.get<{ data: IDuplicateConfig }>("/config/duplicate").then(extractData),

  updateDuplicateConfig: (config: Partial<IDuplicateConfig>) =>
    api.put<{ data: IDuplicateConfig }>("/config/duplicate", config).then(extractData),

  // Duplicate logs & override
  getDuplicateLogs: (params?: { action?: string; citizenId?: string; page?: number; limit?: number }) =>
    api
      .get<{ data: DuplicateAttemptRecord[]; pagination: { page: number; limit: number; total: number; pages: number } }>(
        "/requests/duplicates/logs",
        { params }
      )
      .then((res) => res.data),

  overrideDuplicateAttempt: (logId: string, reason?: string) =>
    api
      .post<{ data: ReliefRequest }>(`/requests/duplicates/logs/${logId}/override`, { reason })
      .then(extractData),

  getRequestDuplicateLogs: (requestId: string) =>
    api
      .get<{ data: DuplicateAttemptRecord[] }>(`/requests/${requestId}/duplicates`)
      .then(extractData),
};
