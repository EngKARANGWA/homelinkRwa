"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

export function useIdleLogout(timeoutMs: number = IDLE_TIMEOUT_MS) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        router.push("/login");
      }, timeoutMs);
    }

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router, timeoutMs]);
}
