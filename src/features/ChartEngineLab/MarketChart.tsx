import * as d3 from "d3";
import { useState, useEffect, useMemo, useRef } from "react";

import type { MarketPoint } from "@/data";
import {
  createXScale,
  findNearestByTime,
  getInnerSize,
  getPriceDomain,
  getVolumeDomain,
  getXDomain,
  getVisibleWindow,
  type TimeDomain,
  type NumericDomain,
} from "@/chart-core";
import {
  PRICE_MARGINS,
  PRICE_HEIGHT,
  VOLUME_MARGINS,
  VOLUME_HEIGHT,
  PricePanel,
  VolumePanel,
} from "./panels";
import { buildSharedViewport, buildPanelViewport } from "@/chart-core/viewport";

import {
  useContainerSize,
  useChartZoom,
  ChartProvider,
  type ChartContextValue,
} from "@/chart-react";

type MarketChartProps = {
  points: MarketPoint[];
};

const PLACEHOLDER_X_DOMAIN: TimeDomain = [new Date(0), new Date(1)];

/**
 * Top-level chart composition.
 */
export function MarketChart({ points }: MarketChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<MarketPoint | null>(null);
  const [xDomain, setXDomain] = useState<TimeDomain | null>(null);
  const [priceYDomain, setPriceYDomain] = useState<NumericDomain | null>(null);
  const [volumeYDomain, setVolumeYDomain] = useState<NumericDomain | null>(
    null,
  );

  const didInitCamera = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const pointerXRef = useRef<number | null>(null);
  const { width } = useContainerSize(containerRef);

  useEffect(() => {
    if (didInitCamera.current || points.length === 0) return;
    setXDomain(getXDomain(points));
    setPriceYDomain(getPriceDomain(points));
    setVolumeYDomain(getVolumeDomain(points));
    didInitCamera.current = true;
  }, [points]);

  const pricePlotSize = useMemo(() => {
    const margins = PRICE_MARGINS;
    const height = PRICE_HEIGHT;
    return {
      ...getInnerSize(width, height, margins),
      width,
      height,
      margins,
    };
  }, [width]);

  const volumePlotSize = useMemo(() => {
    const margins = VOLUME_MARGINS;
    const height = VOLUME_HEIGHT;
    return {
      ...getInnerSize(width, height, margins),
      width,
      height,
      margins,
    };
  }, [width]);

  // Zoom transform is relative to this base. Keep it frozen to owned xDomain
  // (placeholder only until camera init; PricePanel is not mounted yet).
  const baseXScale = useMemo(() => {
    return createXScale(xDomain ?? PLACEHOLDER_X_DOMAIN, [
      0,
      Math.max(pricePlotSize.innerWidth, 1),
    ]);
  }, [xDomain, pricePlotSize.innerWidth]);

  const { zoomRef } = useChartZoom({
    baseXScale,
    innerWidth: pricePlotSize.innerWidth,
    innerHeight: pricePlotSize.innerHeight,
    onXDomainChange: setXDomain,
  });

  const camera = useMemo(() => {
    if (!xDomain || !priceYDomain || !volumeYDomain) return null;

    const sharedViewport = buildSharedViewport({
      xDomain,
      innerWidth: pricePlotSize.innerWidth,
    });

    return {
      sharedViewport,
      priceViewport: buildPanelViewport({
        shared: sharedViewport,
        size: pricePlotSize,
        yDomain: priceYDomain,
      }),
      volumeViewport: buildPanelViewport({
        shared: sharedViewport,
        size: volumePlotSize,
        yDomain: volumeYDomain,
      }),
      visiblePoints: getVisibleWindow(points, xDomain).slice,
    };
  }, [xDomain, priceYDomain, volumeYDomain, pricePlotSize, volumePlotSize, points]);

  const chartContextValue = useMemo((): ChartContextValue | null => {
    if (!camera) return null;
    return {
      visiblePoints: camera.visiblePoints,
      selectedPoint,
      priceViewport: camera.priceViewport,
      volumeViewport: camera.volumeViewport,
    };
  }, [camera, selectedPoint]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  function handlePointerMove(event: React.PointerEvent<SVGRectElement>) {
    if (!camera) return;

    const xScale = camera.sharedViewport.xScale;
    pointerXRef.current = d3.pointer(event)[0];

    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const pointerX = pointerXRef.current;
      if (pointerX === null) return;

      const time = xScale.invert(pointerX);
      setSelectedPoint(findNearestByTime(points, time));
    });
  }

  function handlePointerLeave() {
    pointerXRef.current = null;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    setSelectedPoint(null);
  }

  if (!chartContextValue) {
    return <div className="market-chart" ref={containerRef} />;
  }

  return (
    <div className="market-chart" ref={containerRef}>
      <ChartProvider value={chartContextValue}>
        <PricePanel
          zoomRef={zoomRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        />
        <VolumePanel />
      </ChartProvider>
    </div>
  );
}
