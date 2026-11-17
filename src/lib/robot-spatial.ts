/** Small spatial math layer for the vector character. Units are character-sized, not pixels. */
export type V3 = { x: number; y: number; z: number };
export type M3 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];
export const v = (x = 0, y = 0, z = 0): V3 => ({ x, y, z });
export const add = (a: V3, b: V3) => v(a.x + b.x, a.y + b.y, a.z + b.z);
export const sub = (a: V3, b: V3) => v(a.x - b.x, a.y - b.y, a.z - b.z);
export const mul = (a: V3, s: number) => v(a.x * s, a.y * s, a.z * s);
export const dot = (a: V3, b: V3) => a.x * b.x + a.y * b.y + a.z * b.z;
export const cross = (a: V3, b: V3) =>
  v(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
export const length = (a: V3) => Math.hypot(a.x, a.y, a.z);
export const unit = (a: V3) => mul(a, 1 / Math.max(1e-9, length(a)));
export const clamp = (n: number, a: number, b: number) =>
  Math.max(a, Math.min(b, n));
export const damp = (a: number, b: number, k: number, dt: number) =>
  a + (b - a) * (1 - Math.exp(-k * dt));
export const smooth = (n: number) => {
  const t = clamp(n, 0, 1);
  return t * t * (3 - 2 * t);
};
export const identity: M3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
export function matrix(a: M3, b: M3): M3 {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
    const r = Math.floor(i / 3),
      c = i % 3;
    return a[r * 3] * b[c] + a[r * 3 + 1] * b[c + 3] + a[r * 3 + 2] * b[c + 6];
  }) as M3;
}
export const apply = (m: M3, p: V3) =>
  v(
    m[0] * p.x + m[1] * p.y + m[2] * p.z,
    m[3] * p.x + m[4] * p.y + m[5] * p.z,
    m[6] * p.x + m[7] * p.y + m[8] * p.z,
  );
export const rx = (a: number): M3 => [
  1,
  0,
  0,
  0,
  Math.cos(a),
  -Math.sin(a),
  0,
  Math.sin(a),
  Math.cos(a),
];
export const ry = (a: number): M3 => [
  Math.cos(a),
  0,
  Math.sin(a),
  0,
  1,
  0,
  -Math.sin(a),
  0,
  Math.cos(a),
];
export const rz = (a: number): M3 => [
  Math.cos(a),
  -Math.sin(a),
  0,
  Math.sin(a),
  Math.cos(a),
  0,
  0,
  0,
  1,
];
export const basis = (x: V3, y: V3, z: V3): M3 => [
  x.x,
  y.x,
  z.x,
  x.y,
  y.y,
  z.y,
  x.z,
  y.z,
  z.z,
];
export function joint(
  a: V3,
  b: V3,
  upper: number,
  lower: number,
  preference: V3,
) {
  const delta = sub(b, a),
    distance = clamp(length(delta), 0.0001, upper + lower - 0.00001),
    axis = unit(delta);
  let bend = sub(preference, mul(axis, dot(preference, axis)));
  if (length(bend) < 0.001) bend = cross(axis, v(1, 0, 0));
  const along =
    (upper * upper - lower * lower + distance * distance) / (2 * distance);
  return add(
    add(a, mul(axis, along)),
    mul(unit(bend), Math.sqrt(Math.max(0, upper * upper - along * along))),
  );
}
export function footTrack(phase: number, stride = 0.155) {
  const p = ((phase % 1) + 1) % 1;
  if (p <= 0.6) {
    const t = p / 0.6;
    return {
      z: stride * (1 - 2 * t),
      lift: 0,
      pitch:
        t < 0.18
          ? -0.12 * (1 - smooth(t / 0.18))
          : 0.22 * smooth((t - 0.76) / 0.24),
      contact: true,
    };
  }
  const t = (p - 0.6) / 0.4,
    m = ((-2 * stride) / 0.6) * 0.4;
  return {
    z:
      (2 * t ** 3 - 3 * t * t + 1) * -stride +
      (t ** 3 - 2 * t * t + t) * m +
      (-2 * t ** 3 + 3 * t * t) * stride +
      (t ** 3 - t * t) * m,
    lift: 0.075 * Math.sin(Math.PI * t) ** 1.5,
    pitch: 0.22 * (1 - smooth(t)) - 0.12 * smooth(t),
    contact: false,
  };
}
