/**
 * Minimal continuous scale surface (linear, time, log, …).
 * Range orientation (e.g. Y as [height, 0] vs X as [0, width]) lives on the scale.
 */
export type PannableScale<DomainValue> = {
  range: () => Iterable<number>;
  invert: (pixel: number) => DomainValue;
};

/**
 * Translate a scale's domain by a pan in plot pixels (series follows the drag).
 *
 * Works for X or Y: pass the axis scale and the delta along that axis
 * (`dx` or `dy` from the pointer / d3 zoom transform). No separate orientation
 * flag — inverted Y ranges are already encoded in `scale.range()`.
 */
export function panDomainByScale<DomainValue>(
  scale: PannableScale<DomainValue>,
  deltaPx: number,
): [DomainValue, DomainValue] {
  const [r0, r1] = scale.range() as [number, number];

  if (deltaPx === 0) {
    return [scale.invert(r0), scale.invert(r1)];
  }

  return [scale.invert(r0 - deltaPx), scale.invert(r1 - deltaPx)];
}
