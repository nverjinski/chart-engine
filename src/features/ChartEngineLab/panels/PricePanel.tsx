import { useRef, useEffect } from "react";
import type { Ref } from "react";
import * as d3 from "d3";
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
import { type NumericDomain, findNearestByTime } from "@/chart-core";
import { type MarketPoint } from "@/data";

type PricePanelProps = {
  zoomRef: Ref<SVGGElement | null>;
  onYAxisDomainChange: (domain: NumericDomain) => void;
  onSelectedPointChange: (point: MarketPoint | null) => void;
};

export function PricePanel(props: PricePanelProps) {
  const { zoomRef, onYAxisDomainChange, onSelectedPointChange } = props;
  const pointerXRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
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

  function handlePointerMove(event: React.PointerEvent<SVGRectElement>) {
    if (!priceViewport) return;

    const xScale = priceViewport.xScale;
    pointerXRef.current = d3.pointer(event)[0];

    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const pointerX = pointerXRef.current;
      if (pointerX === null) return;

      const time = xScale.invert(pointerX);
      onSelectedPointChange(findNearestByTime(visiblePoints, time));
    });
  }

  function handlePointerLeave() {
    pointerXRef.current = null;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    onSelectedPointChange(null);
  }

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

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
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
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
