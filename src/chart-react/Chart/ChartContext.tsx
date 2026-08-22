import { createContext, useContext, type ReactNode } from "react";
import type { MarketPoint } from "@/data";
import type { PanelViewport } from "@/chart-core";

export type ChartContextValue = {
  visiblePoints: MarketPoint[];
  selectedPoint: MarketPoint | null;
  priceViewport: PanelViewport;
  volumeViewport: PanelViewport;
};

const ChartContext = createContext<ChartContextValue | null>(null);

export function ChartProvider({
  value,
  children,
}: {
  value: ChartContextValue;
  children: ReactNode;
}) {
  return <ChartContext.Provider value={value} children={children} />;
}

export function useChartContext() {
  const ctx = useContext(ChartContext);

  if (!ctx) {
    throw new Error("useChartContext must be used within ChartProvider");
  }

  return ctx;
}
