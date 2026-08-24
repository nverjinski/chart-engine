import { useRef } from "react";
import type { NumericDomain, TimeDomain } from "@/chart-core";

type AxisDomain = NumericDomain | TimeDomain;

type UseScaleAxisArgs<T extends AxisDomain> = {
  domain: T | null;
  orientation: "vertical" | "horizontal";
  onDomainChange: (domain: T) => void;
  /** Larger = less sensitive. Default 120. */
  sensitivity?: number;
};

type DragState<T extends AxisDomain> = {
  startClient: number;
  domain: T;
};

function isTimeDomain(domain: AxisDomain): domain is TimeDomain {
  return domain[0] instanceof Date;
}

function rescaleAboutCenter<T extends AxisDomain>(
  domain: T,
  deltaPx: number,
  sensitivity: number,
): T {
  const factor = Math.exp(deltaPx / sensitivity);

  if (isTimeDomain(domain)) {
    const t0 = domain[0].getTime();
    const t1 = domain[1].getTime();
    const mid = (t0 + t1) / 2;
    const half = Math.max(((t1 - t0) / 2) * factor, 1);
    return [new Date(mid - half), new Date(mid + half)] as T;
  }

  const y0 = domain[0];
  const y1 = domain[1];
  const mid = (y0 + y1) / 2;
  const half = Math.max(((y1 - y0) / 2) * factor, 1e-6);
  return [mid - half, mid + half] as T;
}

/**
 * Drag-to-rescale an axis about its domain midpoint (TradingView-style).
 * Vertical → use clientY; horizontal → clientX.
 */
export function useScaleAxis<T extends AxisDomain>({
  domain,
  orientation,
  onDomainChange,
  sensitivity = 240,
}: UseScaleAxisArgs<T>) {
  const dragRef = useRef<DragState<T> | null>(null);
  const domainRef = useRef(domain);
  const onDomainChangeRef = useRef(onDomainChange);

  domainRef.current = domain;
  onDomainChangeRef.current = onDomainChange;

  function handlePointerDown(event: React.PointerEvent<SVGRectElement>) {
    const current = domainRef.current;
    if (!current) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startClient: orientation === "vertical" ? event.clientY : event.clientX,
      domain: current,
    };
  }

  function handlePointerMove(event: React.PointerEvent<SVGRectElement>) {
    const drag = dragRef.current;
    if (!drag) return;

    const client = orientation === "vertical" ? event.clientY : event.clientX;
    const delta = client - drag.startClient;
    onDomainChangeRef.current(
      rescaleAboutCenter(drag.domain, delta, sensitivity),
    );
  }

  function handlePointerUp(event: React.PointerEvent<SVGRectElement>) {
    if (
      dragRef.current &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
