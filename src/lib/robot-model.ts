import {
  add,
  sub,
  mul,
  dot,
  cross,
  length,
  unit,
  apply,
  matrix,
  rx,
  ry,
  rz,
  basis,
  joint,
  footTrack,
  v,
  type V3,
  type M3,
} from './robot-spatial';
export type RobotPose = {
  yaw: number;
  time: number;
  phase: number;
  walk: number;
  waiting: boolean;
  emotion: string;
  lookX: number;
  lookY: number;
  wave: number;
  headPitch: number;
  turnProgress: number;
  turning: boolean;
};
export type RobotShape = {
  id: string;
  d: string;
  paint: string;
  depth: number;
  opacity: number;
  stroke?: string;
  width?: number;
};
const E = 0.24,
  C = Math.cos(E),
  S = Math.sin(E),
  SIZE = 108;
export const camera = v(0, S, C);
export function project(p: V3) {
  return {
    x: 120 + p.x * SIZE,
    y: 284 - (p.y * C - p.z * S) * SIZE,
    depth: dot(p, camera),
  };
}
const f = (n: number) => n.toFixed(3);
const path = (points: V3[], closed = true) =>
  points
    .map((p, i) => {
      const q = project(p);
      return `${i ? 'L' : 'M'}${f(q.x)} ${f(q.y)}`;
    })
    .join('') + (closed ? 'Z' : '');
const ring = (center: V3, radii: V3, m: M3, n = 36) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return add(
      center,
      apply(m, v(radii.x * Math.cos(a), radii.y * Math.sin(a), 0)),
    );
  });
function hull(points: { x: number; y: number }[]) {
  const p = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const cross2 = (
    a: (typeof p)[number],
    b: (typeof p)[number],
    c: (typeof p)[number],
  ) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const lower: typeof p = [],
    upper: typeof p = [];
  for (const q of p) {
    while (
      lower.length > 1 &&
      cross2(lower[lower.length - 2], lower[lower.length - 1], q) <= 0
    )
      lower.pop();
    lower.push(q);
  }
  for (const q of p.slice().reverse()) {
    while (
      upper.length > 1 &&
      cross2(upper[upper.length - 2], upper[upper.length - 1], q) <= 0
    )
      upper.pop();
    upper.push(q);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}
function roundedVolume(center: V3, core: V3, r: number, m: M3) {
  const corners: V3[] = [];
  for (const x of [-1, 1])
    for (const y of [-1, 1])
      for (const z of [-1, 1])
        corners.push(
          add(center, apply(m, v(x * core.x, y * core.y, z * core.z))),
        );
  const p = hull(corners.map(project));
  const normals = p.map((q, i) => {
    const next = p[(i + 1) % p.length],
      dx = next.x - q.x,
      dy = next.y - q.y,
      len = Math.hypot(dx, dy);
    return { x: dy / len, y: -dx / len };
  });
  const radius = r * SIZE;
  let d = '';
  p.forEach((q, i) => {
    const a = normals[(i + p.length - 1) % p.length],
      b = normals[i];
    const start = { x: q.x + a.x * radius, y: q.y + a.y * radius },
      end = { x: q.x + b.x * radius, y: q.y + b.y * radius };
    d += `${i ? 'L' : 'M'}${f(start.x)} ${f(start.y)}A${f(radius)} ${f(radius)} 0 0 1 ${f(end.x)} ${f(end.y)}`;
  });
  return d + 'Z';
}
function ellipse(center: V3, r: V3, m: M3) {
  const axes = [
    v(m[0] * r.x, m[3] * r.x, m[6] * r.x),
    v(m[1] * r.y, m[4] * r.y, m[7] * r.y),
    v(m[2] * r.z, m[5] * r.z, m[8] * r.z),
  ];
  let xx = 0,
    xy = 0,
    yy = 0;
  for (const a of axes) {
    const x = a.x * SIZE,
      y = -(a.y * C - a.z * S) * SIZE;
    xx += x * x;
    xy += x * y;
    yy += y * y;
  }
  const disc = Math.hypot(xx - yy, 2 * xy),
    a = Math.sqrt(Math.max(0.01, (xx + yy + disc) / 2)),
    b = Math.sqrt(Math.max(0.01, (xx + yy - disc) / 2)),
    angle = 0.5 * Math.atan2(2 * xy, xx - yy),
    q = project(center),
    dx = a * Math.cos(angle),
    dy = a * Math.sin(angle);
  return `M${f(q.x + dx)} ${f(q.y + dy)}A${f(a)} ${f(b)} ${f((angle * 180) / Math.PI)} 1 1 ${f(q.x - dx)} ${f(q.y - dy)}A${f(a)} ${f(b)} ${f((angle * 180) / Math.PI)} 1 1 ${f(q.x + dx)} ${f(q.y + dy)}Z`;
}
function capsule(a: V3, b: V3, r: number) {
  const p = project(a),
    q = project(b),
    dx = q.x - p.x,
    dy = q.y - p.y,
    len = Math.max(0.001, Math.hypot(dx, dy)),
    nx = (-dy / len) * r * SIZE,
    ny = (dx / len) * r * SIZE,
    R = r * SIZE;
  return `M${f(p.x + nx)} ${f(p.y + ny)}L${f(q.x + nx)} ${f(q.y + ny)}A${f(R)} ${f(R)} 0 0 1 ${f(q.x - nx)} ${f(q.y - ny)}L${f(p.x - nx)} ${f(p.y - ny)}A${f(R)} ${f(R)} 0 0 1 ${f(p.x + nx)} ${f(p.y + ny)}Z`;
}
function roundedFace(w: number, h: number, r: number) {
  const p: V3[] = [];
  for (const [x, y, start] of [
    [w - r, h - r, 0],
    [-w + r, h - r, Math.PI / 2],
    [-w + r, -h + r, Math.PI],
    [w - r, -h + r, Math.PI * 1.5],
  ])
    for (let i = 0; i <= 8; i++) {
      const a = start + ((i / 8) * Math.PI) / 2;
      p.push(v(x + r * Math.cos(a), y + r * Math.sin(a), 0));
    }
  return p;
}

/** All drawing points come from one articulated spatial character, projected into native 2D SVG. */
export function buildRobot(pose: RobotPose) {
  const shapes: RobotShape[] = [];
  const yaw = ry(pose.yaw),
    a = pose.phase * Math.PI * 2;
  const step = pose.walk;
  const compression = (-0.025 - 0.01 * Math.cos(a * 2)) * step;
  const breath = Math.sin(pose.time * 1.5) * 0.0015 * (1 - step);
  const pelvis = compression + breath;
  const roll = 0.014 * Math.sin(a) * step + pose.lookX * 0.002;
  const spine = matrix(rz(roll), rx(0.025 * step));
  // The character pivots about its planted left foot rather than sliding both feet.
  const pivot = sub(v(-0.18, 0, 0), apply(yaw, v(-0.18, 0, 0)));
  const rootPoint = (p: V3) => add(pivot, apply(yaw, p));
  const spineLocal = (p: V3) =>
    add(v(0, 0.43 + pelvis, 0), apply(spine, sub(p, v(0, 0.43, 0))));
  const bodyPoint = (p: V3) => rootPoint(spineLocal(p));
  const bodyBasis = matrix(yaw, spine);
  const neck = v(0, 1.0, 0);
  const headLocal = matrix(rx(pose.headPitch), rz(-pose.lookX * 0.004));
  const headPoint = (p: V3) =>
    bodyPoint(add(neck, apply(headLocal, sub(p, neck))));
  const headBasis = matrix(bodyBasis, headLocal);
  const center = headPoint(v(0, 1.52, 0));
  const visible = dot(apply(headBasis, v(0, 0, 1)), camera) > 0.045;
  const push = (
    id: string,
    d: string,
    paint: string,
    depth: number,
    opacity = 1,
    stroke?: string,
    width?: number,
  ) => shapes.push({ id, d, paint, depth, opacity, stroke, width });
  const ball = (id: string, p: V3, r: V3, m: M3, paint: string, offset = 0) =>
    push(id, ellipse(p, r, m), paint, project(p).depth + offset);
  const bone = (id: string, a: V3, b: V3, r: number, paint: string) =>
    push(
      id,
      capsule(a, b, r),
      paint,
      (project(a).depth + project(b).depth) / 2,
    );
  const shadowCenter = add(pivot, v(0, 0.001, 0));
  push(
    'shadow',
    path(
      Array.from({ length: 40 }, (_, i) =>
        add(
          shadowCenter,
          v(
            0.4 * Math.cos((i / 40) * Math.PI * 2),
            0,
            0.21 * Math.sin((i / 40) * Math.PI * 2),
          ),
        ),
      ),
    ),
    'shadow',
    -1000,
    0.16,
  );
  ball(
    'belly',
    bodyPoint(v(0, 0.72, 0)),
    v(0.375, 0.285, 0.27),
    bodyBasis,
    'shell',
  );
  ball(
    'neck',
    bodyPoint(v(0, 1.008, 0)),
    v(0.115, 0.055, 0.11),
    bodyBasis,
    'joint',
  );
  for (let segment = 0; segment < 8; segment++) {
    const points: V3[] = [];
    for (let i = 0; i <= 6; i++) {
      const t = ((segment + i / 6) / 8) * Math.PI * 2;
      points.push(
        bodyPoint(v(0.371 * Math.cos(t), 0.755, 0.267 * Math.sin(t))),
      );
    }
    const depth =
      points.reduce((sum, p) => sum + project(p).depth, 0) / points.length;
    push('band-' + segment, path(points, false), 'none', depth, 1, 'band', 1.5);
  }

  const ankles: V3[] = [],
    knees: V3[] = [],
    hips: V3[] = [];
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1,
      track = footTrack(pose.phase + i * 0.5, pose.waiting ? 0.105 : 0.155),
      lift = track.lift * step;
    const footPitch = track.pitch * step;
    const footRadiusY = Math.hypot(
      0.07 * Math.cos(footPitch),
      0.165 * Math.sin(footPitch),
    );
    const turnLift =
      pose.turning && i === 1
        ? 0.05 * Math.sin(Math.PI * pose.turnProgress)
        : 0;
    const ankle = v(side * 0.18, footRadiusY + lift + turnLift, track.z * step);
    const hip = v(side * 0.18, 0.43 + pelvis, 0);
    const knee = joint(hip, ankle, 0.18, 0.18, v(0, 0, 1));
    const worldHip = rootPoint(hip),
      worldKnee = rootPoint(knee),
      worldAnkle = rootPoint(ankle);
    hips.push(worldHip);
    knees.push(worldKnee);
    ankles.push(worldAnkle);
    ball(`hip-${i}`, worldHip, v(0.072, 0.072, 0.072), yaw, 'joint');
    bone(
      `thigh-${i}`,
      add(worldHip, mul(unit(sub(worldKnee, worldHip)), 0.032)),
      worldKnee,
      0.072,
      'armor',
    );
    ball(`knee-${i}`, worldKnee, v(0.061, 0.061, 0.061), yaw, 'joint');
    bone(
      `shin-${i}`,
      add(worldKnee, mul(unit(sub(worldAnkle, worldKnee)), 0.02)),
      worldAnkle,
      0.064,
      'armor',
    );
    ball(
      `boot-${i}`,
      worldAnkle,
      v(0.125, 0.07, 0.165),
      matrix(yaw, rx(footPitch)),
      'shell',
      0.001,
    );
  }
  const shoulders: V3[] = [],
    elbows: V3[] = [],
    wrists: V3[] = [];
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    const shoulder = v(side * 0.38, 0.88, 0);
    const swing = Math.sin(a + i * Math.PI) * step;
    const wave = i === 1 ? pose.wave : 0;
    const resting = v(side * 0.42, 0.46, 0);
    const walking = v(
      side * 0.43,
      0.46 + Math.cos(a * 2) * 0.008 * step,
      -swing * 0.13,
    );
    const waiting = v(side * 0.13, 0.54, -0.15);
    const target = pose.waiting
      ? waiting
      : add(mul(resting, 1 - step), mul(walking, step));
    const waving = v(0.75, 1.12, 0.1);
    const wrist = add(mul(target, 1 - wave), mul(waving, wave));
    const elbow = joint(shoulder, wrist, 0.24, 0.22, v(side, 0, -0.08));
    const s = bodyPoint(shoulder),
      e = bodyPoint(elbow),
      w = bodyPoint(wrist);
    shoulders.push(s);
    elbows.push(e);
    wrists.push(w);
    ball(`shoulder-${i}`, s, v(0.085, 0.085, 0.085), bodyBasis, 'joint');
    bone(
      `upper-arm-${i}`,
      add(s, mul(unit(sub(e, s)), 0.02)),
      e,
      0.078,
      'armor',
    );
    ball(`elbow-${i}`, e, v(0.062, 0.062, 0.062), bodyBasis, 'joint');
    bone(`forearm-${i}`, add(e, mul(unit(sub(w, e)), 0.015)), w, 0.07, 'armor');
    const handY = unit(sub(wrist, elbow));
    let handX = unit(sub(v(1, 0, 0), mul(handY, handY.x)));
    if (length(handX) < 0.1) handX = v(1, 0, 0);
    const handZ = unit(cross(handX, handY));
    let handLocal = basis(handX, handY, handZ);
    handLocal = matrix(handLocal, rz(wave * Math.sin(pose.time * 9) * 0.16));
    const handBasis = matrix(bodyBasis, handLocal);
    const handPoint = (p: V3) => bodyPoint(add(wrist, apply(handLocal, p)));
    ball(
      `palm-${i}`,
      handPoint(v(0, 0.042, 0)),
      v(0.085, 0.061, 0.031),
      handBasis,
      'palm',
    );
    for (let finger = 0; finger < 4; finger++) {
      const x = (finger - 1.5) * 0.037;
      const start = v(x, 0.073, 0),
        open = wave * 0.5;
      const tip = v(
        x + (finger - 1.5) * open * 0.024,
        0.073 + [0.06, 0.087, 0.083, 0.068][finger],
        -0.006,
      );
      bone(
        `finger-${i}-${finger}`,
        handPoint(start),
        handPoint(tip),
        0.0165,
        'palm',
      );
    }
    bone(
      `thumb-${i}`,
      handPoint(v(-0.065, 0.03, 0)),
      handPoint(v(-0.115, 0.08, 0.008)),
      0.023,
      'palm',
    );
  }

  push(
    'helmet',
    roundedVolume(center, v(0.37, 0.27, 0.22), 0.25, headBasis),
    'helmet',
    project(center).depth,
  );
  for (const side of [-1, 1]) {
    const p = headPoint(v(side * 0.635, 1.52, 0));
    ball(`ear-${side}`, p, v(0.075, 0.175, 0.17), headBasis, 'armor');
    const normal = apply(headBasis, v(side, 0, 0));
    const earCenter = headPoint(v(side * 0.703, 1.52, 0));
    const earVisible = dot(normal, camera) > 0;
    const earMatrix = matrix(headBasis, ry(Math.PI * 0.5));
    push(
      `ear-ring-${side}`,
      path(ring(earCenter, v(0.126, 0.126, 0), earMatrix)),
      'pink',
      project(earCenter).depth + 0.002,
      earVisible ? 1 : 0,
    );
    push(
      `ear-core-${side}`,
      path(
        ring(add(earCenter, mul(normal, 0.002)), v(0.087, 0.087, 0), earMatrix),
      ),
      'joint',
      project(earCenter).depth + 0.003,
      earVisible ? 1 : 0,
    );
    bone(
      `antenna-${side}`,
      headPoint(v(side * 0.635, 1.76, -0.02)),
      headPoint(v(side * 0.655, 1.98, -0.02)),
      0.018,
      'armor',
    );
    ball(
      `antenna-tip-${side}`,
      headPoint(v(side * 0.655, 1.98, -0.02)),
      v(0.027, 0.027, 0.027),
      headBasis,
      'shell',
    );
  }
  const faceZ = (x: number, y: number) =>
    0.475 - 0.075 * (x / 0.53) ** 4 - 0.035 * (y / 0.39) ** 4;
  const surface = (x: number, y: number, zOffset = 0) =>
    headPoint(v(x, 1.52 + y, faceZ(x, y) + zOffset));
  const frontDepth = project(center).depth + 0.49;
  push(
    'visor',
    path(roundedFace(0.525, 0.375, 0.22).map((p) => surface(p.x, p.y))),
    'visor',
    frontDepth,
    visible ? 1 : 0,
  );
  push(
    'visor-glint',
    path([
      surface(0.2, 0.31, 0.002),
      surface(0.4, 0.26, 0.002),
      surface(0.44, 0.09, 0.002),
      surface(0.36, 0.13, 0.002),
    ]),
    'glint',
    frontDepth + 0.001,
    visible ? 0.35 : 0,
  );
  const cycle = pose.time % 5.2,
    blink =
      cycle > 4.65 && cycle < 4.85
        ? Math.sin(((cycle - 4.65) / 0.2) * Math.PI) ** 2
        : 0;
  const eyeOpen = 1 - blink * 0.93;
  const expression = pose.emotion;
  const curious = expression === 'curious' || expression === 'impressed';
  const happy = expression === 'happy' || expression === 'excited';
  const ey = expression === 'waiting' ? 0.078 : curious ? 0.116 : 0.101;
  const eyeOffsetX = pose.lookX * 0.003,
    eyeOffsetY = -pose.lookY * 0.003;
  for (let i = 0; i < 2; i++) {
    const x = (i === 0 ? -1 : 1) * 0.205 + eyeOffsetX,
      y = 0.075 + eyeOffsetY;
    const points = Array.from({ length: 40 }, (_, j) => {
      const t = (j / 40) * Math.PI * 2;
      return surface(
        x + Math.cos(t) * (curious ? 0.08 : 0.073),
        y + Math.sin(t) * ey * eyeOpen,
        0.005,
      );
    });
    push(`eye-${i}`, path(points), 'eye', frontDepth + 0.005, visible ? 1 : 0);
    const shine = Array.from({ length: 20 }, (_, j) => {
      const t = (j / 20) * Math.PI * 2;
      return surface(
        x - 0.02 + 0.018 * Math.cos(t),
        y + 0.04 + 0.026 * Math.sin(t) * eyeOpen,
        0.007,
      );
    });
    push(
      `eye-shine-${i}`,
      path(shine),
      'white',
      frontDepth + 0.007,
      visible ? (curious ? 0.9 : 0.65) : 0,
    );
    const brow: V3[] = [];
    for (let j = 0; j <= 12; j++) {
      const t = j / 12;
      const raise = curious ? 0.24 : 0.21;
      brow.push(
        surface(
          x - 0.07 + 0.14 * t,
          raise + 0.026 * Math.sin(Math.PI * t),
          0.005,
        ),
      );
    }
    push(
      `brow-${i}`,
      path(brow, false),
      'none',
      frontDepth + 0.009,
      visible && (curious || expression === 'thinking') ? 1 : 0,
      'eye',
      2.1,
    );
  }
  const smile: V3[] = [];
  for (let j = 0; j <= 32; j++) {
    const t = j / 32;
    const width = curious ? 0.16 : happy ? 0.15 : 0.13;
    smile.push(
      surface(
        -width + 2 * width * t,
        -0.16 -
          (curious ? 0.105 : happy ? 0.105 : 0.07) * Math.sin(Math.PI * t),
        0.007,
      ),
    );
  }
  push(
    'mouth',
    path(smile, false),
    'none',
    frontDepth + 0.01,
    visible ? 1 : 0,
    'eye',
    curious ? 3.8 : 3.3,
  );
  shapes.sort((a, b) => a.depth - b.depth || a.id.localeCompare(b.id));
  return {
    shapes,
    joints: { hips, knees, ankles, shoulders, elbows, wrists },
    bodyBasis,
    headBasis,
    faceVisible: visible,
    rootYaw: pose.yaw,
    helmet: shapes.find((s) => s.id === 'helmet')!,
    pivot,
  };
}
export const neutralPose: RobotPose = {
  yaw: 0.15,
  time: 0,
  phase: 0,
  walk: 0,
  waiting: false,
  emotion: 'idle',
  lookX: 0,
  lookY: 0,
  wave: 0,
  headPitch: 0,
  turnProgress: 0,
  turning: false,
};
