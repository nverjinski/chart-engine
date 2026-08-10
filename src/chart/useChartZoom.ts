import * as d3 from "d3";
import { useState, useEffect, useRef } from "react";
import type { ScaleTime } from "d3";

type UseChartZoomProps = {
  baseXScale: ScaleTime<number, number>;
  innerWidth: number;
  innerHeight: number;
};

export function useChartZoom({
  baseXScale,
  innerWidth,
  innerHeight,
}: UseChartZoomProps) {
  const zoomRef = useRef<SVGGElement | null>(null);
  const [xDomain, setXDomain] = useState<[Date, Date] | null>(null);

  useEffect(() => {
    const element = zoomRef.current;

    if (!element || innerWidth <= 0 || innerHeight <= 0) return;

    const zoom = d3
      .zoom<SVGGElement, unknown>()
      .scaleExtent([1, 40])
      .translateExtent([
        [0, 0],
        [innerWidth, innerHeight],
      ])
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])
      .on("zoom", (event) => {
        const nextX = event.transform.rescaleX(baseXScale);
        const domain = nextX.domain() as [Date, Date];
        setXDomain(domain);
      });

    const selection = d3.select<SVGGElement, unknown>(element);
    selection.call(zoom);

    // Reset zoom when the base scale / size changes (resize, new data)
    selection.call(zoom.transform, d3.zoomIdentity);
    setXDomain(null);

    return () => {
      selection.on(".zoom", null);
    };
  }, [baseXScale, innerWidth, innerHeight]);

  return { zoomRef, xDomain };
}
