import { extent } from "d3";
import type { MarketPoint } from "@/data";
import type { NumericDomain } from "../viewport/viewportTypes";

export const EMPTY_NUMERIC_DOMAIN: NumericDomain = [0, 1];

export function getPriceDomain(points: MarketPoint[]): NumericDomain {
  if (!points.length) return EMPTY_NUMERIC_DOMAIN;

  const [min, max] = extent(points, (d) => d.price);

  if (min === undefined || max === undefined) {
    return EMPTY_NUMERIC_DOMAIN;
  }

  const pad = (max - min) * 0.05 || 1;

  return [min - pad, max + pad];
}
