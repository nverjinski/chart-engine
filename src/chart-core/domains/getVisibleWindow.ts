import { bisector } from "d3";

export type VisibleWindow<T> = {
  startIndex: number;
  endIndex: number;
  slice: T[];
};

export function getVisibleWindow<T extends { timestamp: Date }>(
  points: T[],
  xDomain: [Date, Date],
): VisibleWindow<T> {
  if (!points.length) return { startIndex: 0, endIndex: 0, slice: [] };

  const [x0, x1] = xDomain;
  const byTime = bisector<T, Date>((d) => d.timestamp);
  const startIndex = byTime.left(points, x0); // left: first index greater or equal to value
  const endIndex = byTime.right(points, x1); // right: first index greater than value

  return {
    slice: points.slice(startIndex, endIndex),
    startIndex,
    endIndex,
  };
}
