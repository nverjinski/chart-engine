import { type ChartMargins } from "./viewportTypes";

export function getInnerSize(
  width: number,
  height: number,
  margins: ChartMargins,
) {
  return {
    innerWidth: width - margins.left - margins.right,
    innerHeight: height - margins.top - margins.bottom,
  };
}
