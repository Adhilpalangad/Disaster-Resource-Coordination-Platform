import api from "./api.js";
import type { ReliefRequest, RequestStatus, UrgencyLevel, RequestCategory } from "../types/index.js";

export interface CreateRequestPayload {
    createdBy: string;
    createdByName?: string;
    category: RequestCategory;
    description: string;
    urgency: UrgencyLevel;
    location: string;
    contactNumber?: string;
    disasterId?: string;
    latitude?: number;
    longitude?: number;
    image?: File;
}

export interface UpdateRequestPayload {
    status?: RequestStatus;
    verificationNote?: string;
    assignedTo?: string;
    assignedToName?: string;
}

export interface RequestFilters {
    createdBy?: string;
    status?: RequestStatus;
    urgency?: UrgencyLevel;
    category?: RequestCategory;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

export const requestsApi = {
    async getAll(filters: RequestFilters = {}): Promise<ReliefRequest[]> {
        const params = new URLSearchParams();
        if (filters.createdBy) params.set("createdBy", filters.createdBy);
        if (filters.status) params.set("status", filters.status);
        if (filters.urgency) params.set("urgency", filters.urgency);
        if (filters.category) params.set("category", filters.category);

        const { data } = await api.get<ApiResponse<ReliefRequest[]>>(
            `/requests${params.toString() ? `?${params}` : ""}`
        );
        return data.data ?? [];
    },

    async getById(id: string): Promise<ReliefRequest> {
        const { data } = await api.get<ApiResponse<ReliefRequest>>(`/requests/${id}`);
        if (!data.data) throw new Error("Request not found");
        return data.data;
    },

    async create(payload: CreateRequestPayload): Promise<ReliefRequest> {
        const form = new FormData();
        form.append("createdBy", payload.createdBy);
        if (payload.createdByName) form.append("createdByName", payload.createdByName);
        form.append("category", payload.category);
        form.append("description", payload.description);
        form.append("urgency", payload.urgency);
        form.append("location", payload.location);
        if (payload.contactNumber) form.append("contactNumber", payload.contactNumber);
        if (payload.disasterId) form.append("disasterId", payload.disasterId);
        if (payload.latitude != null) form.append("latitude", String(payload.latitude));
        if (payload.longitude != null) form.append("longitude", String(payload.longitude));
        if (payload.image) form.append("image", payload.image);

        const { data } = await api.post<ApiResponse<ReliefRequest>>("/requests", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (!data.data) throw new Error(data.message ?? "Failed to create request");
        return data.data;
    },

    async update(id: string, payload: UpdateRequestPayload): Promise<ReliefRequest> {
        const { data } = await api.put<ApiResponse<ReliefRequest>>(`/requests/${id}`, payload);
        if (!data.data) throw new Error(data.message ?? "Failed to update request");
        return data.data;
    },

    async remove(id: string): Promise<void> {
        await api.delete(`/requests/${id}`);
    },

    async verify(id: string): Promise<ReliefRequest> {
        return requestsApi.update(id, { status: "verified" });
    },

    async reject(id: string, note: string): Promise<ReliefRequest> {
        return requestsApi.update(id, { status: "rejected", verificationNote: note });
    },
};
