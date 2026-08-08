import type { MarketPoint } from './types'

export type GenerateMarketDataOptions = {
  /** Number of points to generate. Default: 3000 */
  count?: number
  /** Starting price. Default: 200 */
  startPrice?: number
  /** Interval between points in milliseconds. Default: 60_000 (1 minute) */
  intervalMs?: number
  /** End of the series; earlier points walk backward from here. Default: now */
  endTime?: Date
  /** Seed for reproducible walks. Default: 1 */
  seed?: number
}

/**
 * Deterministic PRNG (mulberry32). Same seed → same series.
 * Keeps the generator pure/testable without Math.random().
 */
function createRng(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Synthetic market series: random walk with mild drift + positive volume noise.
 * Data lives in time/price/volume space only — no pixel coordinates.
 */
export function generateMarketData(
  options: GenerateMarketDataOptions = {},
): MarketPoint[] {
  const {
    count = 3000,
    startPrice = 200,
    intervalMs = 60_000,
    endTime = new Date(),
    seed = 1,
  } = options

  if (count < 1) {
    return []
  }

  const rng = createRng(seed)
  const startTime = endTime.getTime() - (count - 1) * intervalMs

  const points: MarketPoint[] = new Array(count)
  let price = startPrice

  for (let i = 0; i < count; i++) {
    // Mild upward drift + gaussian-ish noise via Box-Muller-lite (two uniforms).
    const u1 = rng()
    const u2 = rng()
    const noise = (u1 + u2 - 1) * 0.85
    const drift = 0.002
    price = Math.max(1, price + drift + noise)

    // Volume: base level with occasional spikes.
    const spike = rng() > 0.97 ? 3 + rng() * 4 : 1
    const volume = Math.round((800_000 + rng() * 1_200_000) * spike)

    points[i] = {
      timestamp: new Date(startTime + i * intervalMs),
      price: Math.round(price * 100) / 100,
      volume,
    }
  }

  return points
}
