"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { API_URL } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface BackendStatusCtx {
  isOnline: boolean;
  isWakingUp: boolean;
  waitForBackend: () => Promise<boolean>;
}

const Ctx = createContext<BackendStatusCtx>({
  isOnline: true,
  isWakingUp: false,
  waitForBackend: async () => true,
});

export function useBackendStatus() {
  return useContext(Ctx);
}

export function BackendStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [wakeRetries, setWakeRetries] = useState(0);

  const checkBackend = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setIsOnline(true);
        setIsWakingUp(false);
        setWakeRetries(0);
        return true;
      }
    } catch {
      // offline
    }
    setIsOnline(false);
    return false;
  }, []);

  const waitForBackend = useCallback(async (): Promise<boolean> => {
    const online = await checkBackend();
    if (online) return true;

    setIsWakingUp(true);
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      setWakeRetries(i + 1);
      const ok = await checkBackend();
      if (ok) return true;
    }
    setIsWakingUp(false);
    return false;
  }, [checkBackend]);

  useEffect(() => {
    checkBackend();
    const id = setInterval(checkBackend, 60_000);
    return () => clearInterval(id);
  }, [checkBackend]);

  return (
    <Ctx.Provider value={{ isOnline, isWakingUp, waitForBackend }}>
      <AnimatePresence>
        {isWakingUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="mx-4 max-w-sm rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h2 className="mb-2 text-lg font-bold text-gray-900">Waking up our server</h2>
              <p className="mb-4 text-sm text-gray-500">
                Our server sleeps when nobody&apos;s around. It usually takes 30–60 seconds to wake up.
              </p>
              <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min((wakeRetries / 20) * 100, 95)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="mt-3 text-xs text-gray-400">
                {wakeRetries > 0 ? `Attempt ${wakeRetries}...` : "Connecting..."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </Ctx.Provider>
  );
}
