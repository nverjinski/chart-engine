import type { Ref } from "react";
import type { MarketPoint } from "@/data";
import type { PanelViewport } from "@/chart-core";
import {
  ChartSurface,
  XAxis,
  YAxis,
  PriceSeries,
  Crosshair,
  Tooltip,
} from "@/chart";

type PricePanelProps = {
  viewport: PanelViewport;
  points: MarketPoint[];
  hoverPoint: MarketPoint | null;
  zoomRef: Ref<SVGGElement | null>;
  onPointerMove: (event: React.PointerEvent<SVGRectElement>) => void;
  onPointerLeave: () => void;
};

export function PricePanel(props: PricePanelProps) {
  const {
    viewport,
    points,
    hoverPoint,
    zoomRef,
    onPointerMove,
    onPointerLeave,
  } = props;

  return (
    <div className="chart-pane chart-pane--price">
      <ChartSurface width={viewport.size.width} height={viewport.size.height}>
        <defs>
          <clipPath id="plot-clip">
            <rect
              width={viewport.size.innerWidth}
              height={viewport.size.innerHeight}
            />
          </clipPath>
        </defs>
        <g
          transform={`translate(${viewport.size.margins.left}, ${viewport.size.margins.top})`}
        >
          <XAxis
            xScale={viewport.xScale}
            innerHeight={viewport.size.innerHeight}
          />
          <YAxis yScale={viewport.yScale} />

          <g clipPath="url(#plot-clip)">
            <PriceSeries
              points={points}
              xScale={viewport.xScale}
              yScale={viewport.yScale}
            />
          </g>

          <g ref={zoomRef}>
            <rect
              width={viewport.size.innerWidth}
              height={viewport.size.innerHeight}
              fill="transparent"
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
            />
          </g>
          {hoverPoint && (
            <>
              <Crosshair
                point={hoverPoint}
                xScale={viewport.xScale}
                yScale={viewport.yScale}
                innerHeight={viewport.size.innerHeight}
              />
              <Tooltip
                point={hoverPoint}
                xScale={viewport.xScale}
                yScale={viewport.yScale}
                innerWidth={viewport.size.innerWidth}
              />
            </>
          )}
        </g>
      </ChartSurface>
    </div>
  );
}
