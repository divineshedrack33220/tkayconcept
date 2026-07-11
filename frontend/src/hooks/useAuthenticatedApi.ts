"use client";

import { useAuth } from "@clerk/nextjs";
import api from "@/lib/api";

export function useAuthenticatedApi() {
  const { getToken } = useAuth();

  const authApi = {
    async get(url: string) {
      const token = await getToken();
      return api.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    async post(url: string, data?: unknown) {
      const token = await getToken();
      return api.post(url, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    async put(url: string, data?: unknown) {
      const token = await getToken();
      return api.put(url, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    async delete(url: string) {
      const token = await getToken();
      return api.delete(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
  };

  return authApi;
}
