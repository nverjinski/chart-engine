import { scaleLinear, type ScaleLinear } from "d3";

export function createYScale(
  yDomain: [number, number],
  range: [number, number],
  options: { nice?: boolean } = { nice: true },
): ScaleLinear<number, number> {
  const scale = scaleLinear().domain(yDomain).range(range);
  return options.nice ? scale.nice() : scale;
}
