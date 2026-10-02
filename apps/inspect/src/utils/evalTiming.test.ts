import { describe, expect, it } from "vitest";

import { formatEvalTiming } from "./evalTiming";
import { formatDateTime, formatDuration } from "./format";

const start = "2025-01-15T10:00:00Z";
const end = "2025-01-15T10:05:00Z";

describe("formatEvalTiming", () => {
  it("preserves the existing formatting of completed evaluations", () => {
    expect(formatEvalTiming({ started_at: start, completed_at: end })).toEqual({
      start: formatDateTime(new Date(start)),
      end: formatDateTime(new Date(end)),
      duration: formatDuration(new Date(start), new Date(end)),
    });
  });

  it("keeps a known start without inventing an end or duration", () => {
    expect(formatEvalTiming({ started_at: start, completed_at: "" })).toEqual({
      start: formatDateTime(new Date(start)),
      end: "unavailable",
      duration: "unavailable",
    });
  });

  it("keeps a known end when no start is available", () => {
    expect(formatEvalTiming({ started_at: "", completed_at: end })).toEqual({
      start: "unavailable",
      end: formatDateTime(new Date(end)),
      duration: "unavailable",
    });
  });

  it.each([undefined, { started_at: "", completed_at: "" }])(
    "shows unavailable timing for absent statistics or empty times",
    (stats) => {
      expect(formatEvalTiming(stats)).toEqual({
        start: "unavailable",
        end: "unavailable",
        duration: "unavailable",
      });
    }
  );
});
