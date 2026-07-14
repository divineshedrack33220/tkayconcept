import axios from "axios";
import { API_URL } from "./constants";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (!config || config._retry) {
      if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in";
        }
      }
      return Promise.reject(error);
    }

    const isNetworkError =
      !error.response &&
      (error.code === "ERR_NETWORK" ||
        error.code === "ERR_CONNECTION_CLOSED" ||
        error.code === "ERR_CONNECTION_RESET" ||
        error.message?.includes("Network Error") ||
        error.code === "ECONNABORTED");

    if (!isNetworkError) return Promise.reject(error);

    config._retry = true;
    config.timeout = 30000;

    await new Promise((r) => setTimeout(r, 5000));
    return api(config);
  }
);

export default api;
