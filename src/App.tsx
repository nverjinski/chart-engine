import { useMemo } from "react";
import { MarketChart } from "./chart/MarketChart";
import { generateMarketData } from "./data/generateMarketData";
import { useMarketReplay } from "./hooks/useMarketReplay";
import "./styles/chart.css";

function App() {
  const history = useMemo(() => generateMarketData({ count: 3000 }), []);
  const { points, playing, speed, cursor, total, toggle, cycleSpeed, reset } =
    useMarketReplay({ history });

  const first = points[0];
  const last = points[points.length - 1];

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">AAPL</h1>
        <div className="app-controls">
          <button type="button" onClick={toggle}>
            {playing ? "❚❚" : "Replay ▶"}
          </button>
          <button type="button" onClick={cycleSpeed}>
            {speed}x
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </div>
      </header>
      <MarketChart points={points} />
      <p className="chart-meta">
        {cursor}/{total} points · ${first?.price.toFixed(2)} → $
        {last?.price.toFixed(2)} · streaming via cursor
      </p>
    </div>
  );
}

export default App;
