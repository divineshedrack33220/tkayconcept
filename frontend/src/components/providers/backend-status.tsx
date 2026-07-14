"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { API_URL } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";

interface BackendStatusCtx {
  isOnline: boolean;
  isWakingUp: boolean;
  retryCount: number;
}

const Ctx = createContext<BackendStatusCtx>({
  isOnline: true,
  isWakingUp: false,
  retryCount: 0,
});

export function useBackendStatus() {
  return useContext(Ctx);
}

export function BackendStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);

  const checkBackend = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/health`, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        if (mountedRef.current) {
          setIsOnline(true);
          setIsWakingUp(false);
          setRetryCount(0);
        }
        return true;
      }
    } catch {
      // offline
    }
    if (mountedRef.current) setIsOnline(false);
    return false;
  }, []);

  const wakeUp = useCallback(async () => {
    setIsWakingUp(true);
    for (let i = 1; i <= 40; i++) {
      if (!mountedRef.current) return;
      setRetryCount(i);
      const ok = await checkBackend();
      if (ok) return;
      await new Promise((r) => setTimeout(r, i < 5 ? 2000 : 3000));
    }
    if (mountedRef.current) setIsWakingUp(false);
  }, [checkBackend]);

  useEffect(() => {
    mountedRef.current = true;
    let idleTimer: ReturnType<typeof setInterval>;

    const init = async () => {
      const ok = await checkBackend();
      if (!ok) wakeUp();

      idleTimer = setInterval(checkBackend, 4 * 60 * 1000);
    };

    init();

    return () => {
      mountedRef.current = false;
      clearInterval(idleTimer);
    };
  }, [checkBackend, wakeUp]);

  return (
    <Ctx.Provider value={{ isOnline, isWakingUp, retryCount }}>
      <AnimatePresence>
        {isWakingUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/90 backdrop-blur-md"
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
                Our server sleeps when nobody&apos;s around. It takes 30–60 seconds to wake up.
              </p>
              <div className="mx-auto mb-3 h-1.5 w-48 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min((retryCount / 20) * 100, 95)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {retryCount > 0 ? `Attempt ${retryCount}...` : "Connecting..."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </Ctx.Provider>
  );
}
