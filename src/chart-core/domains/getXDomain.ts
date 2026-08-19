import { extent } from "d3";
import { type MarketPoint } from "../../data/types";

export function getXDomain(points: MarketPoint[]): [Date, Date] {
  const [min, max] = extent(points, (d) => d.timestamp);

  if (min === undefined || max === undefined) {
    throw new Error("getXDomain: empty points");
  }

  return [min, max];
}
