import * as d3 from "d3";
import { useEffect, useRef } from "react";
import type { ScaleTime } from "d3";
import type { TimeDomain } from "@/chart-core";

type UseChartZoomProps = {
  baseXScale: ScaleTime<number, number>;
  innerWidth: number;
  innerHeight: number;
  onXDomainChange: (xDomain: TimeDomain) => void;
  /** Pixel dy from d3 zoom pan (not wheel). Positive = pointer moved down. */
  onYPan: (dy: number) => void;
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
  onYPan,
}: UseChartZoomProps) {
  const zoomRef = useRef<SVGGElement | null>(null);
  const baseXScaleRef = useRef(baseXScale);
  const onXDomainChangeRef = useRef(onXDomainChange);
  const onYPanRef = useRef(onYPan);
  const lastXDomainRef = useRef<TimeDomain | null>(null);

  baseXScaleRef.current = baseXScale;
  onXDomainChangeRef.current = onXDomainChange;
  onYPanRef.current = onYPan;

  useEffect(() => {
    const element = zoomRef.current;

    if (!element || innerWidth <= 0 || innerHeight <= 0) return;

    let rafId: number | null = null;
    let latestXDomain: TimeDomain | null = null;
    let pendingYPan = 0;
    let lastTransformY = 0;

    const flush = () => {
      rafId = null;

      const nextX = latestXDomain;
      if (nextX && !domainsEqual(lastXDomainRef.current, nextX)) {
        lastXDomainRef.current = nextX;
        onXDomainChangeRef.current(nextX);
      }

      if (pendingYPan !== 0) {
        const dy = pendingYPan;
        pendingYPan = 0;
        onYPanRef.current(dy);
      }
    };

    const scheduleFlush = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(flush);
    };

    const zoom = d3
      .zoom<SVGGElement, unknown>()
      .scaleExtent([0.1, 40])
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])
      .on("start", (event) => {
        lastTransformY = event.transform.y;
      })
      .on("zoom", (event) => {
        const t = event.transform;
        const isWheel = event.sourceEvent?.type === "wheel";

        latestXDomain = t
          .rescaleX(baseXScaleRef.current)
          .domain() as TimeDomain;

        // Wheel also changes transform.y (zoom about cursor). Absorb it so we
        // don't pan Y, and so the next drag's dy isn't polluted.
        if (isWheel) {
          lastTransformY = t.y;
        } else {
          const dy = t.y - lastTransformY;
          lastTransformY = t.y;
          if (dy !== 0) pendingYPan += dy;
        }

        scheduleFlush();
      });

    const selection = d3.select<SVGGElement, unknown>(element);
    selection.call(zoom);

    return () => {
      selection.on(".zoom", null);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [innerWidth, innerHeight]);

  return { zoomRef };
}
