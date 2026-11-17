'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AiCompanion } from './ai-companion';
import { createCompanionRig } from './companion-rig';

const reactions = {
  work: { emotion: 'curious', text: 'Ooh, something worth exploring.' },
  about: { emotion: 'happy', text: 'The human behind the AI.' },
  expertise: { emotion: 'thinking', text: 'Let’s put our minds to it.' },
  contact: { emotion: 'excited', text: 'A good conversation starts here.' },
} as const;
type Section = keyof typeof reactions;
const sectionIds = Object.keys(reactions) as Section[];
const IDLE_DELAY = 9000;

/** One persistent companion, portaled out of transformed page/reveal containers. */
export function ScrollCompanion() {
  const anchor = useRef<HTMLSpanElement>(null);
  const companion = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const element = companion.current;
    const origin = anchor.current;
    if (!mounted || !element || !origin) return;
    const controller = new AbortController();
    const { signal } = controller;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rig = createCompanionRig(element);
    let frame = 0;
    let lastFrame = 0;
    let lastScrollTime = performance.now();
    let sideY = 0;
    let idleTimer: ReturnType<typeof setTimeout>;
    let stopTimer: ReturnType<typeof setTimeout>;
    let lastY = window.scrollY;
    let following = lastY > 24;
    let waiting = false;
    let direction: 'rest' | 'up' | 'down' = 'rest';
    let hovered: Section | null = null;
    let projectHovered = false;
    let directionTravel = 0;
    let currentSection: Section | null = null;
    let pointer: { x: number; y: number } | null = null;
    let initialized = false;
    let companionSize = 132;
    const position = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    function refreshPose() {
      const section = hovered || currentSection;
      element!.dataset.mode = following ? 'following' : 'hero';
      element!.dataset.motion = waiting ? 'waiting' : direction;
      element!.dataset.emotion = waiting
        ? 'waiting'
        : projectHovered
          ? 'impressed'
          : section
            ? reactions[section].emotion
            : 'smile';
      element!.dataset.reacting = String(Boolean(section) || waiting);
      Object.assign(rig.intent, {
        direction,
        waiting,
        emotion: element!.dataset.emotion,
        hero: !following,
        attention: Boolean(hovered),
      });
      if (!frame) frame = requestAnimationFrame(animatePosition);
      if (bubble.current)
        bubble.current.textContent = waiting
          ? 'Take your time. I’m right here.'
          : section
            ? reactions[section].text
            : 'A little AI. A lot of possibility.';
    }

    function animatePosition(time: number) {
      frame = 0;
      const dt = Math.min(0.05, lastFrame ? (time - lastFrame) / 1000 : 1 / 60);
      lastFrame = time;
      const ease = reduced.matches ? 1 : 1 - Math.exp(-10 * dt);
      position.x += (target.x - position.x) * ease;
      position.y += (target.y - position.y) * ease;
      element!.style.transform = `translate3d(${position.x.toFixed(2)}px, ${position.y.toFixed(2)}px, 0)`;
      rig.intent.homeX = position.x;
      rig.update(dt, reduced.matches);
      if (
        !document.hidden &&
        (!reduced.matches ||
          Math.abs(target.x - position.x) + Math.abs(target.y - position.y) >
            0.15)
      )
        frame = requestAnimationFrame(animatePosition);
    }

    function updatePosition() {
      const small = window.innerWidth <= 600;
      const size = following
        ? small
          ? 76
          : 96
        : origin!.getBoundingClientRect().width;
      element!.style.setProperty('--companion-size', `${size}px`);
      companionSize = size;
      if (following) {
        target.x = Math.max(4, window.innerWidth - size - 8);
        target.y = Math.max(
          60,
          Math.min(
            sideY || window.innerHeight * 0.55,
            window.innerHeight - (size * 4) / 3 - 36,
          ),
        );
      } else {
        const rect = origin!.getBoundingClientRect();
        target.x = rect.left;
        target.y = rect.top;
      }
      if (!initialized || reduced.matches) {
        position.x = target.x;
        position.y = target.y;
        initialized = true;
      }
      if (!frame) frame = requestAnimationFrame(animatePosition);
      element!.dataset.ready = 'true';
    }

    function resetActivity() {
      clearTimeout(idleTimer);
      if (waiting) {
        waiting = false;
        refreshPose();
      }
      idleTimer = setTimeout(() => {
        if (document.hidden) return;
        waiting = true;
        direction = 'rest';
        following = true;
        updatePosition();
        refreshPose();
      }, IDLE_DELAY);
    }

    function findSection(targetElement: EventTarget | null): Section | null {
      if (!(targetElement instanceof Element)) return null;
      const section = targetElement.closest(
        '#work, #about, #expertise, #contact',
      );
      if (section) return section.id as Section;
      const link = targetElement.closest('a[href^="#"]');
      const id = link?.getAttribute('href')?.slice(1);
      return sectionIds.includes(id as Section) ? (id as Section) : null;
    }

    function onPointer(event: PointerEvent) {
      if (event.pointerType === 'touch') return;
      pointer = { x: event.clientX, y: event.clientY };
      resetActivity();
      const x = Math.max(
        -3.5,
        Math.min(3.5, (event.clientX - position.x - companionSize / 2) / 110),
      );
      const y = Math.max(
        -2.5,
        Math.min(
          2.5,
          (event.clientY - position.y - (companionSize * 4) / 9) / 130,
        ),
      );
      element!.style.setProperty('--bot-look-x', `${x}px`);
      element!.style.setProperty('--bot-look-y', `${y}px`);
      element!.style.setProperty('--bot-lean', `${x * 0.7}deg`);
      rig.intent.lookX = x;
      rig.intent.lookY = y;
      const next = findSection(event.target);
      const overProject =
        event.target instanceof Element &&
        Boolean(event.target.closest('.project-card'));
      if (next !== hovered || overProject !== projectHovered) {
        hovered = next;
        projectHovered = overProject;
        refreshPose();
      }
    }

    function onScroll() {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 1) return;
      resetActivity();
      const delta = y - lastY;
      const now = performance.now();
      rig.intent.speed = Math.min(
        1.35,
        0.85 + (Math.abs(delta) / Math.max(16, now - lastScrollTime)) * 0.045,
      );
      lastScrollTime = now;
      if (!following && y > 24)
        sideY = Math.max(
          window.innerHeight * 0.35,
          Math.min(position.y, window.innerHeight * 0.65),
        );
      sideY += Math.max(-18, Math.min(18, delta * 0.045));
      sideY = Math.max(
        window.innerHeight * 0.32,
        Math.min(window.innerHeight * 0.7, sideY),
      );
      following = y > 24;
      const nextDirection = y > lastY ? 'down' : 'up';
      if (nextDirection === direction) directionTravel = 0;
      else {
        directionTravel += delta;
        if (Math.abs(directionTravel) >= 8 || direction === 'rest') {
          direction = nextDirection;
          directionTravel = 0;
        }
      }
      lastY = y;
      hovered = pointer
        ? findSection(document.elementFromPoint(pointer.x, pointer.y))
        : null;
      projectHovered = Boolean(
        pointer &&
        document
          .elementFromPoint(pointer.x, pointer.y)
          ?.closest('.project-card'),
      );
      currentSection = null;
      for (const id of sectionIds) {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        if (
          rect &&
          rect.top < window.innerHeight * 0.65 &&
          rect.bottom > window.innerHeight * 0.3
        ) {
          currentSection = id;
          break;
        }
      }
      refreshPose();
      updatePosition();
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => {
        direction = 'rest';
        refreshPose();
      }, 320);
    }

    function onFocus(event: FocusEvent) {
      resetActivity();
      hovered = findSection(event.target);
      projectHovered =
        event.target instanceof Element &&
        Boolean(event.target.closest('.project-card'));
      refreshPose();
    }
    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        lastFrame = 0;
        clearTimeout(idleTimer);
        waiting = false;
        refreshPose();
      } else {
        resetActivity();
        updatePosition();
      }
    }
    function onLeave() {
      pointer = null;
      hovered = null;
      projectHovered = false;
      element!.style.setProperty('--bot-look-x', '0px');
      element!.style.setProperty('--bot-look-y', '0px');
      element!.style.setProperty('--bot-lean', '0deg');
      rig.intent.lookX = 0;
      rig.intent.lookY = 0;
      refreshPose();
    }

    const initialTarget =
      document.querySelector('.project-card:hover') ||
      document.querySelector(
        '#work:hover, #about:hover, #expertise:hover, #contact:hover',
      ) ||
      document.activeElement;
    hovered = findSection(initialTarget);
    projectHovered =
      initialTarget instanceof Element &&
      Boolean(initialTarget.closest('.project-card'));
    refreshPose();
    updatePosition();
    resetActivity();
    window.addEventListener('scroll', onScroll, { passive: true, signal });
    window.addEventListener('resize', updatePosition, {
      passive: true,
      signal,
    });
    window.addEventListener('pointermove', onPointer, {
      passive: true,
      signal,
    });
    window.addEventListener('pointerover', onPointer, {
      passive: true,
      signal,
    });
    window.addEventListener('pointerdown', resetActivity, {
      passive: true,
      signal,
    });
    window.addEventListener('keydown', resetActivity, { signal });
    window.addEventListener('wheel', resetActivity, { passive: true, signal });
    document.addEventListener('focusin', onFocus, { signal });
    document.addEventListener('visibilitychange', onVisibility, { signal });
    document.documentElement.addEventListener('pointerleave', onLeave, {
      signal,
    });
    reduced.addEventListener('change', updatePosition, { signal });
    const observer = new ResizeObserver(updatePosition);
    observer.observe(origin);
    return () => {
      controller.abort();
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
      clearTimeout(stopTimer);
    };
  }, [mounted]);

  return (
    <span ref={anchor} className="companion-anchor" aria-hidden="true">
      {mounted &&
        createPortal(
          <div
            ref={companion}
            className="site-companion"
            data-mode="hero"
            data-motion="rest"
            data-emotion="smile"
            aria-hidden="true"
          >
            <div className="companion-patrol">
              <AiCompanion />
            </div>
            <span ref={bubble} className="companion-bubble">
              A little AI. A lot of possibility.
            </span>
          </div>,
          document.body,
        )}
    </span>
  );
}
