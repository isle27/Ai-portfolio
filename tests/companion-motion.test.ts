import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRobot, neutralPose } from '../src/lib/robot-model';
import {
  apply,
  dot,
  sub,
  length,
  footTrack,
  v,
  damp,
} from '../src/lib/robot-spatial';

test('head, visor and body inherit one yaw without flat scaling or independent head turns', () => {
  for (let yaw = 0; yaw < Math.PI * 2; yaw += 0.19) {
    const frame = buildRobot({
      ...neutralPose,
      yaw,
      walk: 1,
      phase: 0.3,
      headPitch: 0.025,
      lookX: 3,
    });
    const front = apply(frame.bodyBasis, v(0, 0, 1)),
      headFront = apply(frame.headBasis, v(0, 0, 1));
    assert.ok(
      dot(front, headFront) > 0.998,
      'head turns away independently from torso',
    );
    for (const m of [frame.bodyBasis, frame.headBasis])
      for (const axis of [v(1, 0, 0), v(0, 1, 0), v(0, 0, 1)])
        assert.ok(
          Math.abs(length(apply(m, axis)) - 1) < 1e-10,
          'paper-like axis scaling',
        );
  }
});

test('all limbs retain their bone lengths across walking, waiting, waving, and full rotations', () => {
  for (const yaw of [0, 0.7, Math.PI / 2, Math.PI, Math.PI * 1.7])
    for (let phase = 0; phase < 1; phase += 0.07)
      for (const waiting of [false, true]) {
        const frame = buildRobot({
          ...neutralPose,
          yaw,
          phase,
          walk: 1,
          waiting,
          wave: waiting ? 0 : 0.8,
        });
        const j = frame.joints;
        for (let i = 0; i < 2; i++) {
          assert.ok(
            Math.abs(length(sub(j.hips[i], j.knees[i])) - 0.18) < 0.00003,
          );
          assert.ok(
            Math.abs(length(sub(j.knees[i], j.ankles[i])) - 0.18) < 0.00003,
          );
          assert.ok(
            Math.abs(length(sub(j.shoulders[i], j.elbows[i])) - 0.24) < 0.00003,
          );
          assert.ok(
            Math.abs(length(sub(j.elbows[i], j.wrists[i])) - 0.22) < 0.00003,
          );
        }
        assert.equal(
          new Set(frame.shapes.map((s) => s.id)).size,
          frame.shapes.length,
        );
        assert.ok(
          frame.shapes.every(
            (s) => !s.d.includes('NaN') && !s.d.includes('Infinity'),
          ),
        );
      }
});

test('supporting shoes stay on the floor and lifted recovery feet clear it', () => {
  for (let phase = 0; phase < 1; phase += 0.005) {
    const frame = buildRobot({ ...neutralPose, phase, walk: 1 });
    for (let i = 0; i < 2; i++) {
      const track = footTrack(phase + i * 0.5),
        r = Math.hypot(
          0.07 * Math.cos(track.pitch),
          0.165 * Math.sin(track.pitch),
        );
      const sole = frame.joints.ankles[i].y - r;
      assert.ok(Math.abs(sole - track.lift) < 1e-10);
      if (track.contact) assert.ok(Math.abs(sole) < 1e-10);
    }
  }
});

test('whole-body pivot retains a planted foot instead of sliding or flipping a flat drawing', () => {
  const start = buildRobot({
    ...neutralPose,
    yaw: 0,
    turning: true,
    turnProgress: 0,
  }).joints.ankles[0];
  for (let t = 0; t <= 1; t += 0.025) {
    const frame = buildRobot({
      ...neutralPose,
      yaw: Math.PI * t,
      turning: true,
      turnProgress: t,
    });
    assert.ok(length(sub(frame.joints.ankles[0], start)) < 1e-10);
    assert.ok(frame.joints.ankles[1].y >= 0.07 - 1e-10);
  }
});

test('waiting hands stay behind the torso in every orientation', () => {
  for (const yaw of [0, 0.6, Math.PI, 4]) {
    const frame = buildRobot({ ...neutralPose, yaw, waiting: true });
    const front = apply(frame.bodyBasis, v(0, 0, 1));
    for (let i = 0; i < 2; i++)
      assert.ok(
        dot(sub(frame.joints.wrists[i], frame.joints.shoulders[i]), front) <
          -0.1,
      );
  }
});

test('motion smoothing is frame-rate independent', () => {
  const advance = (fps: number) => {
    let value = 0;
    for (let i = 0; i < fps; i++) value = damp(value, 1, 8, 1 / fps);
    return value;
  };
  assert.ok(Math.abs(advance(30) - advance(120)) < 1e-10);
});
