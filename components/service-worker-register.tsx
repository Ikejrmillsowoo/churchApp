// components/service-worker-register.tsx — registers the service worker on the client so
// the app is installable and works offline. Renders nothing.
"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration can fail (e.g. unsupported browser); the app still works without it.
      });
    }
  }, []);

  return null;
}
