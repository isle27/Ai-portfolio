'use client';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion';
import { useId, type PointerEvent } from 'react';
export function Field() {
  const id = useId().replaceAll(':', '');
  const x = useMotionValue(0),
    y = useMotionValue(0),
    sx = useSpring(x, { stiffness: 45, damping: 24 }),
    sy = useSpring(y, { stiffness: 45, damping: 24 });
  const reduced = useReducedMotion();
  function move(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width - 0.5) * 9);
    y.set(((e.clientY - r.top) / r.height - 0.5) * 7);
  }
  return (
    <div
      className="field"
      aria-hidden="true"
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <span className="field-header">A study in considered systems</span>
      <motion.svg
        className="field-object"
        viewBox="0 0 500 510"
        fill="none"
        style={reduced ? {} : { x: sx, y: sy }}
      >
        <defs>
          <linearGradient
            id={id + 'paper'}
            x1="140"
            y1="180"
            x2="350"
            y2="240"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#fffdf7" />
            <stop offset=".54" stopColor="#eadfcd" />
            <stop offset=".78" stopColor="#c6b59c" />
            <stop offset="1" stopColor="#eee3d2" />
          </linearGradient>
          <linearGradient id={id + 'edge'} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#d7c8b2" />
            <stop offset="1" stopColor="#aa9275" />
          </linearGradient>
          <filter
            id={id + 'shadow'}
            x="-40%"
            y="-30%"
            width="190%"
            height="200%"
          >
            <feDropShadow
              dx="7"
              dy="12"
              stdDeviation="9"
              floodColor="#75685a"
              floodOpacity=".18"
            />
          </filter>
          <radialGradient id={id + 'ground'}>
            <stop stopColor="#8d7e6c" stopOpacity=".16" />
            <stop offset="1" stopColor="#8d7e6c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx="265"
          cy="429"
          rx="168"
          ry="34"
          fill={'url(#' + id + 'ground)'}
        />
        <g filter={'url(#' + id + 'shadow)'}>
          {Array.from({ length: 7 }, (_, i) => (
            <path
              key={i}
              d="M135 383V184C135 124 171 88 210 88C250 88 282 124 282 184V383L236 412V186C236 153 227 136 210 136C193 136 181 154 181 186V412Z"
              transform={
                'translate(' + (i * 17 - 30) + ' ' + (28 - i * 5) + ')'
              }
              fill={'url(#' + id + 'paper)'}
              stroke={'url(#' + id + 'edge)'}
              strokeWidth=".65"
            />
          ))}
        </g>
        <path d="M100 450H400" stroke="#b9afa2" strokeWidth=".5" />
        <path d="M100 447V453M400 447V453" stroke="#b9afa2" strokeWidth=".5" />
      </motion.svg>
      <div className="field-coordinate">
        <span>Form follows understanding.</span>
      </div>
    </div>
  );
}
