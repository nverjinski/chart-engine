import { bisector } from "d3";

export const timestampBisector = bisector<{ timestamp: Date }, Date>(
  (d) => d.timestamp,
);

/**
 * Find the point nearest to a timestamp.
 * Assumes points are sorted in ascending order by timestamp.
 */
export function findNearestByTime<T extends { timestamp: Date }>(
  points: T[],
  time: Date,
): T | null {
  if (points.length === 0) return null;
  const index = timestampBisector.center(points, time);
  return points[Math.max(0, Math.min(points.length - 1, index))] ?? null;
}
