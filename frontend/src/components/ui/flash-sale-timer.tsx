"use client";

import { useEffect, useState } from "react";
import { Clock, Flame } from "lucide-react";

interface FlashSaleTimerProps {
  discountPercent: number;
  endDate?: string;
}

function getEndTime(endDate?: string): number {
  if (endDate) return new Date(endDate).getTime();
  // Default: 24 hours from midnight tonight
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

export function FlashSaleTimer({ discountPercent, endDate }: FlashSaleTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: true });

  useEffect(() => {
    const endTime = getEndTime(endDate);

    const tick = () => {
      const diff = Math.max(0, endTime - Date.now());
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (timeLeft.expired) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
      <Flame className="h-3 w-3 animate-pulse" />
      <span>-{discountPercent}%</span>
      <span className="mx-0.5 text-white/60">|</span>
      <Clock className="h-3 w-3" />
      <span className="tabular-nums">
        {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
