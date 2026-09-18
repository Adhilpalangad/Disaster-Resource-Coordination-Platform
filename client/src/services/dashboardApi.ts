import api from "./api.js";

export interface DashboardStatsData {
  users: {
    total: number;
    citizens: number;
    volunteers: number;
    ngos: number;
    admins: number;
  };
  ngos: {
    total: number;
    active: number;
    pending: number;
  };
  disasters: {
    total: number;
    active: number;
    critical: number;
  };
  requests: {
    total: number;
    pending: number;
    completed: number;
    inTransit: number;
  };
  shelters: {
    total: number;
    capacity: number;
    occupancy: number;
  };
  inventory: {
    totalItems: number;
  };
  activity: Array<{
    type: string;
    message: string;
    time: string;
    status: string;
  }>;
}

function extract<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

export const dashboardApi = {
  getStats: () =>
    api.get<{ data: DashboardStatsData }>("/dashboard/stats").then(extract),
};
