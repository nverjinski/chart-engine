import type { ReactNode } from 'react'

type ChartSurfaceProps = {
  width: number
  height: number
  className?: string
  children?: ReactNode
}

/**
 * SVG viewport for a chart pane.
 * Later steps add margins and an inner plot group; for now we only establish size.
 */
export function ChartSurface({
  width,
  height,
  className,
  children,
}: ChartSurfaceProps) {
  if (width <= 0 || height <= 0) {
    return null
  }

  return (
    <svg
      className={className ? `chart-surface ${className}` : 'chart-surface'}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Market chart surface"
    >
      {children}
    </svg>
  )
}
