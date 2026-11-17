import { buildRobot, type RobotPose } from '@/lib/robot-model';
import { damp, smooth, clamp } from '@/lib/robot-spatial';
import { robotPaint } from './ai-companion';
type Intent = {
  direction: 'rest' | 'up' | 'down';
  waiting: boolean;
  emotion: string;
  lookX: number;
  lookY: number;
  speed: number;
  hero: boolean;
  attention: boolean;
  homeX: number;
};
type State = 'idle' | 'walking' | 'braking' | 'settling' | 'turning';
type Frame = ReturnType<typeof buildRobot>;
export type RigSvg = SVGSVGElement & { robotFrame?: Frame };
/** One body yaw controls the complete skeleton. Face geometry is a child of the helmet frame. */
export function createCompanionRig(root: HTMLElement) {
  let svg = root.querySelector<RigSvg>('.bot2')!,
    scene = svg.querySelector('.bot-character')!;
  let prefix = svg.dataset.paintPrefix!;
  const readNodes = () =>
    new Map(
      [...scene.querySelectorAll<SVGPathElement>('[data-part]')].map((node) => [
        node.dataset.part!,
        node,
      ]),
    );
  let nodes = readNodes();
  const patrol = root.querySelector<HTMLElement>('.companion-patrol')!;
  const intent: Intent = {
    direction: 'rest',
    waiting: false,
    emotion: 'smile',
    lookX: 0,
    lookY: 0,
    speed: 1,
    hero: true,
    attention: false,
    homeX: 0,
  };
  let state: State = 'idle',
    phase = 0,
    walk = 0,
    yaw = 0.15,
    stopAt = 0;
  let turnFrom = 0.15,
    turnTo = 0.15,
    turnTime = 0,
    time = 0,
    cadence = 1,
    wasWaiting = false;
  let patrolDirection = -1;
  let returning = false;
  let lookX = 0,
    lookY = 0,
    headPitch = 0,
    wave = 0,
    patrolX = 0,
    lastOrder = '';
  // Keep unchanged SVG attributes out of the style/paint pipeline.
  const attributes = new WeakMap<Element, Map<string, string>>();
  function attribute(node: Element, name: string, value: string) {
    let previous = attributes.get(node);
    if (!previous) {
      previous = new Map();
      attributes.set(node, previous);
    }
    if (previous.get(name) === value) return;
    node.setAttribute(name, value);
    previous.set(name, value);
  }
  function beginTurn(target: number) {
    state = 'turning';
    turnFrom = yaw;
    turnTo = target;
    turnTime = 0;
  }
  return {
    intent,
    update(dt: number, reduced: boolean) {
      if (!svg.isConnected || !scene.isConnected) {
        const currentSvg = root.querySelector<RigSvg>('.bot2');
        const currentScene = currentSvg?.querySelector('.bot-character');
        if (!currentSvg || !currentScene) return;
        svg = currentSvg;
        scene = currentScene;
        prefix = svg.dataset.paintPrefix!;
        nodes = readNodes();
        lastOrder = '';
      }
      dt = clamp(dt, 0, 0.05);
      time += dt;
      if (intent.waiting && !wasWaiting) {
        patrolDirection = -1;
        returning = false;
      }
      if (!intent.waiting && wasWaiting && patrolX < -0.5) returning = true;
      wasWaiting = intent.waiting;
      const pacing = intent.waiting && !returning;
      const horizontal = pacing || returning;
      // Local forward is +Z: +/- pi/2 presents a genuine side profile.
      const targetYaw = horizontal
        ? returning || patrolDirection > 0
          ? Math.PI / 2
          : -Math.PI / 2
        : intent.direction === 'up'
          ? Math.PI + 0.15
          : 0.15;
      const aligned = Math.abs(yaw - targetYaw) < 0.01;
      const requested = !reduced && (intent.direction !== 'rest' || horizontal);
      if (reduced) {
        state = 'idle';
        walk = 0;
        yaw = 0.15;
        returning = false;
      } else {
        if (state === 'walking' && (!requested || !aligned)) {
          state = 'braking';
          stopAt = Math.ceil(phase * 2 + 0.0001) / 2;
        }
        if (state === 'idle' || state === 'settling') {
          if (requested && aligned) state = 'walking';
          else if (walk < 0.025 && Math.abs(yaw - targetYaw) > 0.01)
            beginTurn(targetYaw);
        }
        if (state === 'walking' || state === 'braking') {
          cadence = damp(
            cadence,
            returning ? 2.3 : pacing ? 0.65 : clamp(intent.speed, 0.86, 1.12),
            5,
            dt,
          );
          walk = damp(walk, pacing ? 0.8 : 1, 8, dt);
          phase += dt * cadence * smooth(walk / 0.7);
          if (state === 'braking' && phase >= stopAt) {
            phase = stopAt;
            state = 'settling';
          }
        } else if (state === 'settling' || state === 'idle') {
          walk = damp(walk, 0, 11, dt);
          if (walk < 0.025) {
            walk = 0;
            if (Math.abs(yaw - targetYaw) > 0.01) beginTurn(targetYaw);
            else state = 'idle';
          }
        }
        if (state === 'turning') {
          turnTime += dt;
          walk = 0;
          yaw = turnFrom + (turnTo - turnFrom) * smooth(turnTime / 0.44);
          if (turnTime >= 0.44) {
            yaw = turnTo;
            state =
              requested && Math.abs(yaw - targetYaw) < 0.01
                ? 'walking'
                : 'idle';
          }
        }
      }
      lookX = reduced ? 0 : damp(lookX, intent.lookX, 6, dt);
      lookY = reduced ? 0 : damp(lookY, intent.lookY, 6, dt);
      // Pitch/roll are tiny secondary actions; there is deliberately no independent head yaw.
      headPitch = reduced
        ? 0
        : damp(
            headPitch,
            -lookY * 0.006 + Math.sin(phase * Math.PI * 4) * walk * 0.008,
            9,
            dt,
          );
      const emotion = intent.waiting
        ? 'waiting'
        : intent.emotion === 'smile'
          ? walk > 0.1
            ? 'walking'
            : 'idle'
          : intent.emotion;
      const cycle = time % 10;
      const waveTarget =
        intent.hero &&
        !intent.waiting &&
        walk < 0.05 &&
        state === 'idle' &&
        cycle > 1 &&
        cycle < 4
          ? smooth((cycle - 1) / 0.6) * (1 - smooth((cycle - 3.2) / 0.8))
          : 0;
      wave = reduced ? 0 : damp(wave, waveTarget, 9, dt);
      const pose: RobotPose = {
        yaw,
        time,
        phase,
        walk,
        waiting: intent.waiting,
        emotion,
        lookX,
        lookY,
        wave,
        headPitch,
        turnProgress: clamp(turnTime / 0.44, 0, 1),
        turning: state === 'turning',
      };
      const frame = buildRobot(pose);
      svg.robotFrame = frame;
      if (frame.shapes.some((shape) => !nodes.get(shape.id)?.isConnected)) {
        nodes = readNodes();
        lastOrder = '';
      }
      for (const shape of frame.shapes) {
        const node = nodes.get(shape.id);
        if (!node) continue;
        attribute(node, 'd', shape.d);
        attribute(node, 'fill', robotPaint(shape.paint, prefix));
        attribute(node, 'opacity', String(shape.opacity));
        if (shape.stroke)
          attribute(node, 'stroke', robotPaint(shape.stroke, prefix));
        if (shape.width) attribute(node, 'stroke-width', String(shape.width));
      }
      const order = frame.shapes.map((s) => s.id).join('|');
      if (order !== lastOrder) {
        let next: SVGPathElement | null = null;
        for (let i = frame.shapes.length - 1; i >= 0; i--) {
          const node = nodes.get(frame.shapes[i].id);
          if (!node) continue;
          if (node.nextSibling !== next) scene.insertBefore(node, next);
          next = node;
        }
        lastOrder = order;
      }
      if (reduced) patrolX = 0;
      else if (horizontal && state === 'walking' && aligned && walk > 0.1) {
        // The controller already knows this position. Reading layout here,
        // after SVG writes, used to force a synchronous layout on every step.
        const leftEdge = -Math.max(0, intent.homeX - 12);
        const velocity = returning ? 190 : 42;
        patrolX = clamp(
          patrolX + (returning ? 1 : patrolDirection) * velocity * walk * dt,
          leftEdge,
          0,
        );
        if (returning && patrolX >= -0.1) {
          patrolX = 0;
          returning = false;
        } else if (pacing && (patrolX <= leftEdge + 0.1 || patrolX >= -0.1)) {
          patrolDirection *= -1;
        }
      }
      patrol.style.transform = `translate3d(${patrolX.toFixed(3)}px,0,0)`;
      root.dataset.patrol = returning
        ? 'returning'
        : pacing
          ? patrolDirection < 0
            ? 'left'
            : 'right'
          : 'home';
      root.dataset.patrolX = patrolX.toFixed(2);
      root.dataset.poseState = state;
      root.dataset.gait =
        state === 'turning'
          ? 'turning'
          : walk > 0.05
            ? state === 'walking' || state === 'braking'
              ? 'walking'
              : 'settling'
            : 'planted';
      root.dataset.facing =
        Math.cos(yaw) < -0.5
          ? 'back-three-quarter'
          : Math.abs(Math.sin(yaw)) > 0.6
            ? 'profile'
            : walk > 0.05
              ? 'front-three-quarter'
              : 'front';
      root.dataset.face = emotion;
      root.dataset.faceVisible = String(frame.faceVisible);
      svg.dataset.face = emotion;
      root.dataset.bodyYaw = yaw.toFixed(5);
      root.dataset.headYaw = yaw.toFixed(5);
      root.dataset.headView = frame.faceVisible ? 'front' : 'rear';
      root.dataset.hands = intent.waiting
        ? 'behind-back'
        : wave > 0.2
          ? 'waving'
          : 'relaxed';
    },
  };
}
