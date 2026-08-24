import * as d3 from "d3";
import { useEffect, useRef } from "react";
import type { ScaleTime } from "d3";
import type { TimeDomain } from "@/chart-core";

type UseChartZoomProps = {
  baseXScale: ScaleTime<number, number>;
  innerWidth: number;
  innerHeight: number;
  onXDomainChange: (xDomain: TimeDomain) => void;
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
  onXDomainChange,
}: UseChartZoomProps) {
  const zoomRef = useRef<SVGGElement | null>(null);
  const baseXScaleRef = useRef<ScaleTime<number, number> | null>(null);
  const onXDomainChangeRef = useRef(onXDomainChange);
  const lastDomainRef = useRef<TimeDomain | null>(null);

  onXDomainChangeRef.current = onXDomainChange;
  baseXScaleRef.current = baseXScale;

  useEffect(() => {
    const element = zoomRef.current;

    if (!element || innerWidth <= 0 || innerHeight <= 0) return;

    let rafId: number | null = null;
    let latestDomain: TimeDomain | null = null;

    const flushDomain = () => {
      rafId = null;
      const next = latestDomain;
      if (!next) return;
      if (domainsEqual(lastDomainRef.current, next)) return;
      lastDomainRef.current = next;
      onXDomainChangeRef.current(next);
    };

    const zoom = d3
      .zoom<SVGGElement, unknown>()
      .scaleExtent([0.1, 40])
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])
      .on("zoom", (event) => {
        latestDomain = event.transform
          .rescaleX(baseXScaleRef.current)
          .domain() as TimeDomain;

        if (rafId !== null) return;
        rafId = requestAnimationFrame(flushDomain);
      });

    const selection = d3.select<SVGGElement, unknown>(element);
    selection.call(zoom);

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    return () => {
      selection.on(".zoom", null);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [innerWidth, innerHeight]);

  return { zoomRef };
}
