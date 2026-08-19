import { extent } from "d3";
import { type MarketPoint } from "../../data/types";

export function getVolumeDomain(points: MarketPoint[]): [number, number] {
  const [, max] = extent(points, (d) => d.volume);

  if (max === undefined) {
    throw new Error("getVolumeDomain: empty data");
  }

  return [0, max * 1.05];
}
