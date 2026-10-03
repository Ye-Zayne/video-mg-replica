export type Bezier = readonly [number, number, number, number];
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const cubic = (t: number, a: number, b: number) =>
  3 * (1-t) ** 2 * t * a + 3 * (1-t) * t * t * b + t ** 3;

// CSS cubic-bezier: invert x(t), then evaluate y(t). y can overshoot.
export function ease(progress: number, curve: Bezier = [0, 0, 1, 1]): number {
  if (!curve.every(Number.isFinite) || curve[0] < 0 || curve[0] > 1 || curve[2] < 0 || curve[2] > 1)
    throw new Error('Bezier x controls must lie in [0,1]; all controls must be finite');
  const p = clamp(progress);
  if (p === 0 || p === 1) return p;
  let lo = 0, hi = 1;
  for (let i = 0; i < 32; i++) {
    const t = (lo + hi) / 2;
    if (cubic(t, curve[0], curve[2]) < p) lo = t; else hi = t;
  }
  return cubic((lo + hi) / 2, curve[1], curve[3]);
}

export function tween(frame: number, start: number, end: number,
  from: number, to: number, curve?: Bezier): number {
  if (![frame, start, end, from, to].every(Number.isFinite) || end <= start)
    throw new Error('tween requires finite values and end > start');
  return from + (to-from) * ease((frame-start)/(end-start), curve);
}
