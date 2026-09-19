import api from "./api.js";

/**
 * Extract data payload from wrapped API response
 */
export function extractData<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

/**
 * Format filter options object into URLSearchParams string
 */
export function buildQueryParams(filters: Record<string, any> = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Factory for standard CRUD resource API calls
 */
export function createResourceApi<T, CreatePayload = Partial<T>, UpdatePayload = Partial<T>>(endpoint: string) {
  return {
    getAll: (filters: Record<string, any> = {}): Promise<T[]> =>
      api.get<{ data: T[] }>(`${endpoint}${buildQueryParams(filters)}`).then(extractData),

    getById: (id: string): Promise<T> =>
      api.get<{ data: T }>(`${endpoint}/${id}`).then(extractData),

    create: (payload: CreatePayload): Promise<T> =>
      api.post<{ data: T }>(endpoint, payload).then(extractData),

    update: (id: string, payload: UpdatePayload): Promise<T> =>
      api.put<{ data: T }>(`${endpoint}/${id}`, payload).then(extractData),

    remove: (id: string): Promise<{ success: boolean; message: string }> =>
      api.delete(`${endpoint}/${id}`).then((r) => r.data as { success: boolean; message: string }),
  };
}
