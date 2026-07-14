"use client";

import { useEffect } from "react";
import { API_URL } from "@/lib/constants";

const PING_INTERVAL = 4 * 60 * 1000;

export function useKeepAlive() {
  useEffect(() => {
    const ping = () => {
      fetch(`${API_URL}/health`, { method: "GET" }).catch(() => {});
    };

    ping();
    const id = setInterval(ping, PING_INTERVAL);
    return () => clearInterval(id);
  }, []);
}
