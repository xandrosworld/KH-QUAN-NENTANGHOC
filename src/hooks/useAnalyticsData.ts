"use client";

import { useEffect, useMemo, useState } from "react";
import { buildAnalyticsSearchParams } from "@/lib/analytics-filters";
import type { AnalyticsActiveFilters, AnalyticsPayload } from "@/lib/data-types";

export function useAnalyticsData(filters: AnalyticsActiveFilters = {}) {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const queryString = useMemo(() => {
    const params = buildAnalyticsSearchParams(filters);
    const query = params.toString();
    return query ? `?${query}` : "";
  }, [filters]);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/analytics${queryString}`)
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
  }, [queryString]);

  return data;
}
