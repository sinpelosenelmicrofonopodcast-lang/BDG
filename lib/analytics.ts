"use client";

import posthog from "posthog-js";

let initialized = false;

export function initAnalytics() {
  if (initialized) {
    return;
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: "identified_only"
    });
  }

  initialized = true;
}

export function trackEvent(eventName: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (posthogKey) {
    posthog.capture(eventName, props);
    return;
  }

  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const maybeWindow = window as Window & { plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void };
  if (plausibleDomain && typeof maybeWindow.plausible === "function") {
    maybeWindow.plausible(eventName, { props });
  }
}
