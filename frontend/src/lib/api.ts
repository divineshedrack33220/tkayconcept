import axios from "axios";
import { API_URL } from "./constants";

let backendWakingUp = false;
let toastShown = false;

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
  (response) => {
    if (backendWakingUp) {
      backendWakingUp = false;
      toastShown = false;
      import("sonner").then(({ toast }) => {
        toast.success("Back online!", { duration: 2000 });
      });
    }
    return response;
  },
  (error) => {
    const isNetworkError = !error.response && (error.code === "ERR_NETWORK" || error.code === "ERR_CONNECTION_CLOSED" || error.message?.includes("Network Error"));

    if (isNetworkError && !toastShown) {
      backendWakingUp = true;
      toastShown = true;
      import("sonner").then(({ toast }) => {
        toast.info("Backend is waking up... This takes ~30 seconds on first visit.", {
          duration: 8000,
        });
      });
    }

    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
