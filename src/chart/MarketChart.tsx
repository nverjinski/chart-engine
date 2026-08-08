import { useRef } from "react";
import { ChartSurface } from "./ChartSurface";
import { useContainerSize } from "./useContainerSize";

const PRICE_HEIGHT = 480;
const VOLUME_HEIGHT = 120;

/**
 * Top-level chart composition.
 */
export function MarketChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useContainerSize(containerRef);

  return (
    <div className="market-chart" ref={containerRef}>
      <div className="chart-pane chart-pane--price">
        <ChartSurface width={width} height={PRICE_HEIGHT} />
        <div className="chart-placeholder">Price pane ({PRICE_HEIGHT}px)</div>
      </div>
      <div className="chart-pane chart-pane--volume">
        <ChartSurface width={width} height={VOLUME_HEIGHT} />
        <div className="chart-placeholder">Volume pane ({VOLUME_HEIGHT}px)</div>
      </div>
    </div>
  );
}
