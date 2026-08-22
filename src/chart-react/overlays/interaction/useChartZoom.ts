import * as d3 from "d3";
import { useState, useEffect, useRef } from "react";
import type { ScaleTime } from "d3";
import type { TimeDomain } from "@/chart-core";

type UseChartZoomProps = {
  baseXScale: ScaleTime<number, number>;
  innerWidth: number;
  innerHeight: number;
};

function domainsEqual(a: TimeDomain | null, b: TimeDomain | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a[0].getTime() === b[0].getTime() && a[1].getTime() === b[1].getTime();
}

export function useChartZoom({
  baseXScale,
  innerWidth,
  innerHeight,
}: UseChartZoomProps) {
  const zoomRef = useRef<SVGGElement | null>(null);
  const [xDomain, setXDomain] = useState<TimeDomain | null>(null);

  useEffect(() => {
    const element = zoomRef.current;

    if (!element || innerWidth <= 0 || innerHeight <= 0) return;

    let rafId: number | null = null;
    let latestDomain: TimeDomain | null = null;

    const flushDomain = () => {
      rafId = null;
      const next = latestDomain;
      if (!next) return;
      setXDomain((prev) => (domainsEqual(prev, next) ? prev : next));
    };

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
        latestDomain = event.transform.rescaleX(baseXScale).domain() as TimeDomain;

        if (rafId !== null) return;
        rafId = requestAnimationFrame(flushDomain);
      });

    const selection = d3.select<SVGGElement, unknown>(element);
    selection.call(zoom);

    // Reset zoom when the base scale / size changes (resize, new data).
    // Identity transform fires a zoom event — cancel that rAF so it doesn't
    // overwrite the explicit null reset.
    selection.call(zoom.transform, d3.zoomIdentity);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    latestDomain = null;
    setXDomain(null);

    return () => {
      selection.on(".zoom", null);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [baseXScale, innerWidth, innerHeight]);

  return { zoomRef, xDomain };
}
