import { useId } from 'react';
import { buildRobot, neutralPose, type RobotShape } from '@/lib/robot-model';
export type BotExpression =
  | 'smile'
  | 'curious'
  | 'impressed'
  | 'happy'
  | 'thinking'
  | 'excited'
  | 'waiting';
export function robotPaint(name: string, prefix: string) {
  if (name === 'none') return 'none';
  const solids: Record<string, string> = {
    eye: '#7ce9db',
    white: '#edfffb',
    band: '#dba7be',
    pink: '#e4aac5',
    shadow: '#9e8794',
    glint: '#d5e4dc',
  };
  return solids[name] || `url(#${prefix}-${name})`;
}
export function RobotPath({
  shape,
  prefix,
}: {
  shape: RobotShape;
  prefix: string;
}) {
  return (
    <path
      data-part={shape.id}
      d={shape.d}
      fill={robotPaint(shape.paint, prefix)}
      opacity={shape.opacity}
      stroke={shape.stroke ? robotPaint(shape.stroke, prefix) : undefined}
      strokeWidth={shape.width}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
/** A single spatial skeleton, rendered as smooth vector forms. No flat-view swaps or bitmap assets. */
export function AiCompanion({
  expression = 'smile',
}: {
  expression?: BotExpression;
}) {
  const prefix = 'companion-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const frame = buildRobot({
    ...neutralPose,
    emotion: expression === 'smile' ? 'idle' : expression,
  });
  return (
    <svg
      className="ai-companion bot2"
      data-paint-prefix={prefix}
      data-face={expression === 'smile' ? 'idle' : expression}
      viewBox="0 0 240 320"
      fill="none"
      role="img"
      aria-label="Soft baby-pink robot with a rounded helmet, mint eyes, and articulated arms and legs"
    >
      <defs>
        <radialGradient id={prefix + '-helmet'} cx="32%" cy="20%" r="90%">
          <stop stopColor="#fff7fa" />
          <stop offset=".48" stopColor="#f7dfe8" />
          <stop offset=".82" stopColor="#dfb8ca" />
          <stop offset="1" stopColor="#c99cb4" />
        </radialGradient>
        <radialGradient id={prefix + '-shell'} cx="32%" cy="18%" r="90%">
          <stop stopColor="#fff6f9" />
          <stop offset=".6" stopColor="#f3d9e4" />
          <stop offset="1" stopColor="#d7afc2" />
        </radialGradient>
        <linearGradient
          id={prefix + '-armor'}
          x1="15%"
          y1="0"
          x2="90%"
          y2="90%"
        >
          <stop stopColor="#fff5f9" />
          <stop offset=".55" stopColor="#edd7e1" />
          <stop offset="1" stopColor="#c9a9ba" />
        </linearGradient>
        <radialGradient id={prefix + '-palm'} cx="30%" cy="20%" r="85%">
          <stop stopColor="#faedf3" />
          <stop offset="1" stopColor="#c8b0bd" />
        </radialGradient>
        <linearGradient id={prefix + '-joint'} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#dac8d1" />
          <stop offset="1" stopColor="#ac96a3" />
        </linearGradient>
        <radialGradient id={prefix + '-visor'} cx="78%" cy="18%" r="90%">
          <stop stopColor="#33413b" />
          <stop offset=".4" stopColor="#101d18" />
          <stop offset="1" stopColor="#06100c" />
        </radialGradient>
      </defs>
      <g className="bot-character">
        {frame.shapes.map((shape) => (
          <RobotPath key={shape.id} shape={shape} prefix={prefix} />
        ))}
      </g>
    </svg>
  );
}
