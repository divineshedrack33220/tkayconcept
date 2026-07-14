"use client";

import { useEffect } from "react";
import api from "@/lib/api";

const PING_INTERVAL = 4 * 60 * 1000;

export function useKeepAlive() {
  useEffect(() => {
    const ping = () => {
      api.get("/health").catch(() => {});
    };

    ping();
    const id = setInterval(ping, PING_INTERVAL);
    return () => clearInterval(id);
  }, []);
}
