"use client";

import { useEffect, useState } from "react";
import type { AnalyticsPayload } from "@/lib/data-types";

export function useAnalyticsData() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/analytics")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted && payload) setData(payload);
      })
      .catch(() => {
        // Keep the current page usable if analytics is temporarily unavailable.
      });

    return () => {
      mounted = false;
    };
  }, []);

  return data;
}
