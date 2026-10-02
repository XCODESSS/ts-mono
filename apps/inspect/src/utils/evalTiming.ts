import type { EvalStats } from "@tsmono/inspect-common/types";

import { formatDateTime, formatDuration } from "./format";

interface EvalTiming {
  start: string;
  end: string;
  duration: string;
}

export function formatEvalTiming(
  stats: Pick<EvalStats, "started_at" | "completed_at"> | undefined
): EvalTiming {
  const start = stats?.started_at ? new Date(stats.started_at) : undefined;
  const end = stats?.completed_at ? new Date(stats.completed_at) : undefined;
  return {
    start: start ? formatDateTime(start) : "unavailable",
    end: end ? formatDateTime(end) : "unavailable",
    duration: start && end ? formatDuration(start, end) : "unavailable",
  };
}
