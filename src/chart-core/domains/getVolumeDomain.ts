import { extent } from "d3";
import type { MarketPoint } from "@/data";
import type { NumericDomain } from "../viewport/viewportTypes";
import { EMPTY_NUMERIC_DOMAIN } from "./getPriceDomain";

export function getVolumeDomain(points: MarketPoint[]): NumericDomain {
  const [, max] = extent(points, (d) => d.volume);

  if (max === undefined) {
    return EMPTY_NUMERIC_DOMAIN;
  }

  return [0, max * 1.05];
}
