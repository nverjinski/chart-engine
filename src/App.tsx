import { useMemo } from 'react'
import { MarketChart } from './chart/MarketChart'
import { generateMarketData } from './data/generateMarketData'
import './styles/chart.css'

function App() {
  // Seed once per mount so the series is stable across re-renders.
  const marketPoints = useMemo(() => generateMarketData({ count: 3000 }), [])
  const first = marketPoints[0]
  const last = marketPoints[marketPoints.length - 1]

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">AAPL</h1>
        <div className="app-controls">
          <span>Replay ▶</span>
          <span>1x</span>
        </div>
      </header>
      <MarketChart />
      <p className="chart-meta">
        {marketPoints.length} points · ${first?.price.toFixed(2)} → $
        {last?.price.toFixed(2)} · domain data only (no scales yet)
      </p>
    </div>
  )
}

export default App
