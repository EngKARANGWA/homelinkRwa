"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Share, X } from "lucide-react";

const DISMISS_KEY = "homelink-install-dismissed-at";
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;
const INSTALLED_MESSAGE_MS = 6000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isDismissed(): boolean {
  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
  return Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
}

function isStandaloneDisplay(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

// Safari on iOS never fires `beforeinstallprompt` — Apple only exposes
// install through the manual Share sheet, with no way to trigger or even
// detect it from JS. So iOS gets a static instructional toast instead of
// the real one-click flow the other browsers get.
function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isWebkit = /webkit/i.test(ua);
  const isOtherIosBrowser = /crios|fxios|edgios|opios/i.test(ua);
  return isIos && isWebkit && !isOtherIosBrowser;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay() || isDismissed()) return;

    if (isIosSafari()) {
      setShowIosInstructions(true);
      setVisible(true);
      return;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      if (isDismissed()) return;
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    // Fires once the browser finishes the install, regardless of which UI
    // triggered it — the authoritative "it actually installed" signal, so
    // the on-screen confirmation below doesn't depend only on our own
    // prompt() call resolving.
    function handleAppInstalled() {
      setDeferredPrompt(null);
      setInstalled(true);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!installed) return;
    const timer = setTimeout(() => setVisible(false), INSTALLED_MESSAGE_MS);
    return () => clearTimeout(timer);
  }, [installed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      setInstalled(true);
    } else {
      setVisible(false);
    }
  };

  const handleLater = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  if (installed) {
    return (
      <div className="fixed inset-x-4 bottom-20 z-40 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-lg lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-96">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-emerald-800">Installed!</p>
          <p className="mt-0.5 text-xs text-emerald-700">
            HomeLink Rwanda is now on your home screen.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss"
          className="shrink-0 text-emerald-600 transition-colors hover:text-emerald-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

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
        {showIosInstructions ? (
          <p className="mt-0.5 text-xs text-slate-500">
            Tap <Share className="mb-0.5 inline h-3.5 w-3.5" /> Share, then{" "}
            <span className="font-medium text-navy">Add to Home Screen</span>.
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-slate-500">
            Add it to your home screen for quick, app-like access.
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          {!showIosInstructions && (
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-lg bg-gold px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gold/90"
            >
              Install Now
            </button>
          )}
          <button
            type="button"
            onClick={handleLater}
            className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-navy"
          >
            {showIosInstructions ? "Got it" : "Later"}
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
