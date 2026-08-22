import { ChartSurface, XAxis, Crosshair } from "@/chart-react";
import { VolumeSeries } from "@/renderers/svg";
import { useChartContext } from "@/chart-react";

export function VolumePanel() {
  const { volumeViewport, visiblePoints, selectedPoint } = useChartContext();

  return (
    <div className="chart-pane chart-pane--volume">
      <ChartSurface
        width={volumeViewport.size.width}
        height={volumeViewport.size.height}
      >
        <defs>
          <clipPath id="volume-clip">
            <rect
              width={volumeViewport.size.innerWidth}
              height={volumeViewport.size.innerHeight}
            />
          </clipPath>
        </defs>
        <g
          transform={`translate(${volumeViewport.size.margins.left}, ${volumeViewport.size.margins.top})`}
        >
          <VolumeSeries
            points={visiblePoints}
            xScale={volumeViewport.xScale}
            yScale={volumeViewport.yScale}
          />
          <XAxis
            xScale={volumeViewport.xScale}
            innerHeight={volumeViewport.size.innerHeight}
          />
          {selectedPoint && (
            <Crosshair
              point={selectedPoint}
              xScale={volumeViewport.xScale}
              yScale={volumeViewport.yScale}
              innerHeight={volumeViewport.size.innerHeight}
              verticalOnly={true}
            />
          )}
        </g>
      </ChartSurface>
    </div>
  );
}
