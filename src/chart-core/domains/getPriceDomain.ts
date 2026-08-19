import { extent } from "d3";
import { type MarketPoint } from "../../data/types";

export function getPriceDomain(points: MarketPoint[]) {
  const [min, max] = extent(points, (d) => d.price);

  if (min === undefined || max === undefined) {
    throw new Error("getPriceDomain: empty data");
  }

  return [min, max];
}
