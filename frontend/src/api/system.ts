import api from "./axios";

export const systemApi = {
  getHealth: async () => {
    const { data } = await api.get("/api/system/health");
    return data;
  },
};
