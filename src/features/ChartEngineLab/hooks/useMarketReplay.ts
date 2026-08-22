import { useEffect, useMemo, useState } from "react";
import type { MarketPoint } from "@/data";

export const SPEEDS = [1, 2, 4, 8] as const;
export type ReplaySpeed = (typeof SPEEDS)[number];

/** Wall-clock ms between cursor advances at 1x */
const BASE_INTERVAL_MS = 250;

/** How many points are visible when replay starts / resets */
const INITIAL_VISIBLE = 200;

type UseMarketReplayArgs = {
  history: MarketPoint[];
  initialVisible?: number;
  showAll?: boolean;
};

export function useMarketReplay({
  history,
  initialVisible = INITIAL_VISIBLE,
}: UseMarketReplayArgs) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<ReplaySpeed>(1);
  const [cursor, setCursor] = useState(() =>
    Math.min(initialVisible, history.length),
  );

  // Keep cursor valid if history length changes
  useEffect(() => {
    setCursor((c) => Math.min(c, history.length));
  }, [history.length]);

  useEffect(() => {
    if (!playing) return;

    const id = window.setInterval(() => {
      setCursor((c) => {
        if (c >= history.length) {
          setPlaying(false);
          return c;
        }
        return c + 1;
      });
    }, BASE_INTERVAL_MS / speed);

    return () => clearInterval(id);
  }, [playing, speed, history.length]);

  const points = useMemo(() => history.slice(0, cursor), [history, cursor]);

  return {
    points,
    playing,
    speed,
    cursor,
    total: history.length,
    togglePause: () => setPlaying((p) => !p),
    showAll: () => {
      setCursor(history.length);
      setPlaying(false);
    },
    cycleSpeed: () =>
      setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]!),
    reset: () => {
      setPlaying(false);
      setCursor(Math.min(initialVisible, history.length));
    },
  };
}
