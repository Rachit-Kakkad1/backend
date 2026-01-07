import axios from "axios";

const fallbackBaseURL = (() => {
  const DEFAULT_PORT = 5000;
  return `http://localhost:${DEFAULT_PORT}`;
})();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || fallbackBaseURL,
  withCredentials: false, // ✅ JWT auth does NOT use cookies
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sentinai_token");

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.debug("[API REQUEST]", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.debug("[API RESPONSE]", {
      url: response.config?.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const msg = error?.response?.data?.message || error?.message;
    console.warn("[API ERROR]", { status, msg });
    return Promise.reject(error);
  }
);

export default api;
