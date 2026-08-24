import type { Ref } from "react";
import {
  ChartSurface,
  XAxis,
  YAxis,
  Crosshair,
  Tooltip,
  useChartContext,
  useScaleAxis,
} from "@/chart-react";
import { PriceSeries } from "@/renderers/svg";
import { type NumericDomain } from "@/chart-core";

type PricePanelProps = {
  zoomRef: Ref<SVGGElement | null>;
  onPointerMove: (event: React.PointerEvent<SVGRectElement>) => void;
  onPointerLeave: () => void;
  onYAxisDomainChange: (domain: NumericDomain) => void;
};

export function PricePanel(props: PricePanelProps) {
  const { zoomRef, onPointerMove, onPointerLeave, onYAxisDomainChange } = props;
  const { visiblePoints, priceViewport, selectedPoint } = useChartContext();

  const { size, xScale, yScale } = priceViewport;

  const {
    handlePointerDown: onYAxisPointerDown,
    handlePointerMove: onYAxisPointerMove,
    handlePointerUp: onYAxisPointerUp,
  } = useScaleAxis({
    domain: priceViewport.yDomain,
    orientation: "vertical",
    onDomainChange: onYAxisDomainChange,
  });

  return (
    <div className="chart-pane chart-pane--price">
      <ChartSurface width={size.width} height={size.height}>
        <defs>
          <clipPath id="plot-clip">
            <rect width={size.innerWidth} height={size.innerHeight} />
          </clipPath>
        </defs>
        <g transform={`translate(${size.margins.left}, ${size.margins.top})`}>
          <XAxis xScale={xScale} innerHeight={size.innerHeight} />
          <YAxis yScale={yScale} />
          <rect
            className="y-axis-hit"
            x={-size.margins.left}
            y={0}
            width={size.margins.left}
            height={size.innerHeight}
            fill="transparent"
            style={{ cursor: "ns-resize" }}
            onPointerDown={onYAxisPointerDown}
            onPointerMove={onYAxisPointerMove}
            onPointerUp={onYAxisPointerUp}
            onPointerCancel={onYAxisPointerUp}
          />

          <g clipPath="url(#plot-clip)">
            <PriceSeries
              points={visiblePoints}
              xScale={xScale}
              yScale={yScale}
            />
          </g>

          <g ref={zoomRef}>
            <rect
              width={size.innerWidth}
              height={size.innerHeight}
              fill="transparent"
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
            />
          </g>
          {selectedPoint && (
            <>
              <Crosshair
                point={selectedPoint}
                xScale={xScale}
                yScale={yScale}
                innerHeight={size.innerHeight}
              />
              <Tooltip
                point={selectedPoint}
                xScale={xScale}
                yScale={yScale}
                innerWidth={size.innerWidth}
              />
            </>
          )}
        </g>
      </ChartSurface>
    </div>
  );
}
