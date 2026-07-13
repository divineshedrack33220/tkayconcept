"use client";

import { useAuth } from "@clerk/nextjs";
import api from "@/lib/api";

interface RequestOptions {
  signal?: AbortSignal;
}

export function useAuthenticatedApi() {
  const { getToken } = useAuth();

  const authApi = {
    async get(url: string, options?: RequestOptions) {
      const token = await getToken();
      return api.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: options?.signal,
      });
    },
    async post(url: string, data?: unknown) {
      const token = await getToken();
      if (data instanceof FormData) {
        return api.post(url, data, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 60000,
        });
      }
      return api.post(url, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    async put(url: string, data?: unknown) {
      const token = await getToken();
      if (data instanceof FormData) {
        return api.put(url, data, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 60000,
        });
      }
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
