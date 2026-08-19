export type ChartMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const PRICE_MARGINS: ChartMargins = {
  top: 16,
  right: 16,
  bottom: 28,
  left: 56,
};

export const VOLUME_MARGINS: ChartMargins = {
  top: 8,
  right: 16,
  bottom: 24,
  left: 56,
};

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
