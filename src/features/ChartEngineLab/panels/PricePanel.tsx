import type { Ref } from "react";
import { ChartSurface, XAxis, YAxis, Crosshair, Tooltip } from "@/chart-react";
import { PriceSeries } from "@/renderers/svg";
import { useChartContext } from "@/chart-react";

type PricePanelProps = {
  zoomRef: Ref<SVGGElement | null>;
  onPointerMove: (event: React.PointerEvent<SVGRectElement>) => void;
  onPointerLeave: () => void;
};

export function PricePanel(props: PricePanelProps) {
  const { zoomRef, onPointerMove, onPointerLeave } = props;
  const { visiblePoints, priceViewport, selectedPoint } = useChartContext();

  return (
    <div className="chart-pane chart-pane--price">
      <ChartSurface
        width={priceViewport.size.width}
        height={priceViewport.size.height}
      >
        <defs>
          <clipPath id="plot-clip">
            <rect
              width={priceViewport.size.innerWidth}
              height={priceViewport.size.innerHeight}
            />
          </clipPath>
        </defs>
        <g
          transform={`translate(${priceViewport.size.margins.left}, ${priceViewport.size.margins.top})`}
        >
          <XAxis
            xScale={priceViewport.xScale}
            innerHeight={priceViewport.size.innerHeight}
          />
          <YAxis yScale={priceViewport.yScale} />

          <g clipPath="url(#plot-clip)">
            <PriceSeries
              points={visiblePoints}
              xScale={priceViewport.xScale}
              yScale={priceViewport.yScale}
            />
          </g>

          <g ref={zoomRef}>
            <rect
              width={priceViewport.size.innerWidth}
              height={priceViewport.size.innerHeight}
              fill="transparent"
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
            />
          </g>
          {selectedPoint && (
            <>
              <Crosshair
                point={selectedPoint}
                xScale={priceViewport.xScale}
                yScale={priceViewport.yScale}
                innerHeight={priceViewport.size.innerHeight}
              />
              <Tooltip
                point={selectedPoint}
                xScale={priceViewport.xScale}
                yScale={priceViewport.yScale}
                innerWidth={priceViewport.size.innerWidth}
              />
            </>
          )}
        </g>
      </ChartSurface>
    </div>
  );
}
