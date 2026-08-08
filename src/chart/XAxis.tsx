import type { ScaleTime } from "d3";

type XAxisProps = {
  xScale: ScaleTime<number, number>;
  innerHeight: number;
};

export function XAxis({ xScale, innerHeight }: XAxisProps) {
  const ticks = xScale.ticks(6);
  return (
    <g transform={`translate(0, ${innerHeight})`} className="axis axis-x">
      <line x1={0} x2={xScale.range()[1]} y1={0} y2={0} stroke="currentColor" />
      {ticks.map((tick) => {
        const x = xScale(tick) ?? 0;
        return (
          <g key={tick.toISOString()} transform={`translate(${x}, 0)`}>
            <line y2={6} stroke="currentColor" />
            <text y={20} textAnchor="middle" fill="currentColor" fontSize={11}>
              {formatTick(tick, xScale)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function formatTick(tick: Date, xScale: ScaleTime<number, number>) {
  const [start, end] = xScale.domain();
  const span = end.getTime() - start.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (span > 14 * day) {
    return tick.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }
  return tick.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
  });
}
