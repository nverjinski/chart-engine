import type { ScaleTime } from "d3";

export function formatTime(tick: Date, scale: ScaleTime<number, number>) {
  const [start, end] = scale.domain();
  const span = end.getTime() - start.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (span > 14 * day) {
    return tick.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }
  return tick.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
  });
}
