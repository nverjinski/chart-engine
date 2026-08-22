import type { MarketPoint } from "@/data";
import type { PanelViewport } from "@/chart-core";
import { ChartSurface, XAxis, Crosshair, VolumeSeries } from "@/chart";

type VolumePanelProps = {
  viewport: PanelViewport;
  points: MarketPoint[];
  hoverPoint: MarketPoint | null;
};
export function VolumePanel(props: VolumePanelProps) {
  const { viewport, points, hoverPoint } = props;
  return (
    <div className="chart-pane chart-pane--volume">
      <ChartSurface width={viewport.size.width} height={viewport.size.height}>
        <defs>
          <clipPath id="volume-clip">
            <rect
              width={viewport.size.innerWidth}
              height={viewport.size.innerHeight}
            />
          </clipPath>
        </defs>
        <g
          transform={`translate(${viewport.size.margins.left}, ${viewport.size.margins.top})`}
        >
          <VolumeSeries
            points={points}
            xScale={viewport.xScale}
            yScale={viewport.yScale}
          />
          <XAxis
            xScale={viewport.xScale}
            innerHeight={viewport.size.innerHeight}
          />
          {hoverPoint && (
            <Crosshair
              point={hoverPoint}
              xScale={viewport.xScale}
              yScale={viewport.yScale}
              innerHeight={viewport.size.innerHeight}
              verticalOnly={true}
            />
          )}
        </g>
      </ChartSurface>
    </div>
  );
}
