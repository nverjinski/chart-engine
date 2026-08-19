import { scaleTime, type ScaleTime } from "d3";

export function createXScale(
  xDomain: [Date, Date],
  range: [number, number],
): ScaleTime<number, number> {
  return scaleTime().domain(xDomain).range(range);
}
