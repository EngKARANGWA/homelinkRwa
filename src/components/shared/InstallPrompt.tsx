"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const DISMISS_KEY = "homelink-install-dismissed-at";
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
      if (Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function handleAppInstalled() {
      setVisible(false);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setVisible(false);
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleLater = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-20 z-40 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-96">
      <Image
        src="/icons/icon-192.png"
        alt="HomeLink Rwanda"
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-lg"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-navy">Install HomeLink Rwanda</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Add it to your home screen for quick, app-like access.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-lg bg-gold px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gold/90"
          >
            Install Now
          </button>
          <button
            type="button"
            onClick={handleLater}
            className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-navy"
          >
            Later
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={handleLater}
        aria-label="Dismiss"
        className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
