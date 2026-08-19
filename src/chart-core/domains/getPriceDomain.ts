import { extent } from "d3";
import { type MarketPoint } from "../../data/types";

export function getPriceDomain(points: MarketPoint[]): [number, number] {
  const [min, max] = extent(points, (d) => d.price);

  if (min === undefined || max === undefined) {
    throw new Error("getPriceDomain: empty data");
  }

  const pad = (max - min) * 0.05 || 1;

  return [min - pad, max + pad];
}
