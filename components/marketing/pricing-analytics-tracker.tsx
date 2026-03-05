"use client";

import { useEffect } from "react";
import { analyticsEvents } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";

export function PricingAnalyticsTracker() {
  useEffect(() => {
    trackEvent(analyticsEvents.VIEW_PRICING);
  }, []);

  return null;
}
