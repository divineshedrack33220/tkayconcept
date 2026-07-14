"use client";

import { useEffect, useRef, useState } from "react";
import { useBackendStatus } from "@/components/providers/backend-status";

export function useRefetchOnWakeUp() {
  const { isOnline } = useBackendStatus();
  const [refetchKey, setRefetchKey] = useState(0);
  const prevOnline = useRef(isOnline);

  useEffect(() => {
    if (!prevOnline.current && isOnline) {
      setRefetchKey((k) => k + 1);
    }
    prevOnline.current = isOnline;
  }, [isOnline]);

  return refetchKey;
}
