import { bisector } from "d3";
import type { MarketPoint } from "../data/types";

const bisectByTime = bisector((d: MarketPoint) => d.timestamp).center;

/**
 * Find the market point nearest to a timestamp.
 * Assumes points are sorted in ascending order by timestamp.
 */
export function findNearestPoint(
  points: MarketPoint[],
  time: Date,
): MarketPoint | null {
  if (points.length === 0) return null;
  const index = bisectByTime(points, time);
  return points[Math.max(0, Math.min(points.length - 1, index))] ?? null;
}
