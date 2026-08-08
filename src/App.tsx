import { MarketChart } from './chart/MarketChart'
import './styles/chart.css'

function App() {
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
        Scaffold: measured chart surface · D3 scales come next
      </p>
    </div>
  )
}

export default App
