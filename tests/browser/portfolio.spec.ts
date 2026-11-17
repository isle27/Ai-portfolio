import { test, expect } from '@playwright/test';
import type { RigSvg } from '../../src/components/companion-rig';
import type { V3 } from '../../src/lib/robot-spatial';
test('home is responsive and filters project concepts', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Intelligence',
  );
  const portrait = page
    .locator('.hero')
    .getByRole('img', { name: 'Elsa Wubie, AI engineer', exact: true });
  await expect(portrait).toBeVisible();
  await expect
    .poll(() =>
      portrait.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await expect(page.getByRole('link', { name: /Atlas/ })).toBeVisible();
  await page.getByRole('button', { name: 'Agents', exact: true }).click();
  await expect(page.getByRole('link', { name: /Relay/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Atlas/ })).toHaveCount(0);
  await page.getByRole('button', { name: /All work/ }).click();
  await expect(page.getByRole('link', { name: /Atlas/ })).toBeVisible();
  if (testInfo.project.name === 'desktop') {
    const cards = page.locator('.project-card');
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    expect(first && second && Math.abs(first.y - second.y)).toBeLessThan(1);
    const stacks = page.locator('.project-stack');
    const leftStack = await stacks.nth(0).boundingBox();
    const rightStack = await stacks.nth(1).boundingBox();
    expect(
      leftStack && rightStack && Math.abs(leftStack.y - rightStack.y),
    ).toBeLessThan(1);
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page.screenshot({
    path: 'test-results/home-' + testInfo.project.name + '.png',
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test('case study and unknown route behave correctly', async ({ page }) => {
  await page.goto('/projects/atlas');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Atlas.');
  await expect(
    page.getByText('This is a sample project concept', { exact: false }),
  ).toBeVisible();
  const response = await page.goto('/projects/does-not-exist');
  // Next.js streamed not-found responses may be 200; robots must prevent indexing.
  expect([200, 404]).toContain(response?.status());
  await expect(
    page.locator('meta[name="robots"][content="noindex"]').first(),
  ).toHaveAttribute('content', 'noindex');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'off the map',
  );
});
test('contact reports unavailable database without claiming success', async ({
  page,
}) => {
  await page.goto('/#contact');
  await page.getByRole('tab', { name: 'Chatbot', exact: true }).click();
  await page
    .getByRole('tabpanel')
    .getByLabel('Your name', { exact: true })
    .fill('Alex Morgan');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page
    .getByRole('tabpanel')
    .getByLabel('Email address', { exact: true })
    .fill('alex@example.com');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page
    .getByRole('tabpanel')
    .getByLabel('A little about your idea', { exact: true })
    .fill('I would like to collaborate on a thoughtful AI product.');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByRole('status')).toContainText(
    'temporarily unavailable',
  );
});

test('email and chatbot remain separate, keyboard-accessible contact options', async ({
  page,
}) => {
  await page.goto('/#contact');
  const emailTab = page.getByRole('tab', { name: 'Email / contact form' });
  await expect(emailTab).toHaveAttribute('aria-selected', 'true');
  await page
    .getByRole('tabpanel')
    .getByLabel('Your name', { exact: true })
    .fill('Alex Morgan');
  await page
    .getByRole('tabpanel')
    .getByLabel('Email address', { exact: true })
    .fill('alex@example.com');
  await page
    .getByRole('tabpanel')
    .getByLabel('A little about your idea', { exact: true })
    .fill('A thoughtful collaboration on a useful AI system.');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByRole('status')).toContainText(
    'temporarily unavailable',
  );
  await emailTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('tab', { name: 'Chatbot', exact: true }),
  ).toBeFocused();
  await expect(page.getByRole('log')).toBeVisible();
  await page.getByRole('tab', { name: 'Email / contact form' }).click();
  await expect(
    page.getByRole('tabpanel').getByLabel('Your name', { exact: true }),
  ).toHaveValue('Alex Morgan');
});

test('the complete character turns with its face, retains volume, and walks in either direction', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const bot = page.locator('.site-companion');
  await expect(bot).toHaveAttribute('data-ready', 'true');
  await expect(bot.locator('image')).toHaveCount(0);
  const travel = (sign: number) =>
    page.evaluate(async (direction) => {
      let minAlignment = 1,
        minWidth = 1;
      const knees: string[] = [];
      for (let i = 0; i < 30; i++) {
        window.scrollBy({ top: direction * 22, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 75));
        const actor = document.querySelector<HTMLElement>('.site-companion')!;
        const svg = actor.querySelector<SVGSVGElement>(
          '.bot2',
        )! as SVGSVGElement & {
          robotFrame?: { bodyBasis: number[]; headBasis: number[] };
        };
        const frame = svg.robotFrame!;
        const body = frame.bodyBasis,
          head = frame.headBasis;
        minAlignment = Math.min(
          minAlignment,
          body[2] * head[2] + body[5] * head[5] + body[8] * head[8],
        );
        minWidth = Math.min(
          minWidth,
          actor.querySelector('[data-part="helmet"]')!.getBoundingClientRect()
            .width / svg.getBoundingClientRect().width,
        );
        knees.push(
          actor.querySelector('[data-part="knee-0"]')!.getAttribute('d')!,
        );
      }
      const actor = document.querySelector<HTMLElement>('.site-companion')!;
      return {
        facing: actor.dataset.facing,
        faceVisible: actor.dataset.faceVisible,
        minAlignment,
        minWidth,
        poses: new Set(knees).size,
      };
    }, sign);
  const down = await travel(1);
  expect(down.facing).toBe('front-three-quarter');
  expect(down.faceVisible).toBe('true');
  expect(down.poses).toBeGreaterThan(15);
  expect(down.minAlignment).toBeGreaterThan(0.998);
  expect(down.minWidth).toBeGreaterThan(0.35);
  await page.evaluate(() =>
    window.scrollTo({ top: 1400, behavior: 'instant' }),
  );
  const up = await travel(-1);
  expect(up.facing).toBe('back-three-quarter');
  expect(up.faceVisible).toBe('false');
  expect(up.minAlignment).toBeGreaterThan(0.998);
  expect(up.minWidth).toBeGreaterThan(0.35);
  await page.screenshot({
    path: 'test-results/coherent-turn-' + testInfo.project.name + '.png',
  });
  await expect(bot).toHaveAttribute('data-gait', 'planted', { timeout: 6000 });
  await expect(bot).toHaveAttribute('data-face-visible', 'true', {
    timeout: 6000,
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const still = await bot.locator('[data-part="helmet"]').getAttribute('d');
  await page.waitForTimeout(120);
  expect(await bot.locator('[data-part="helmet"]').getAttribute('d')).toBe(
    still,
  );
});

test('reversing scroll during a turn never starts walking in the wrong orientation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const bot = page.locator('.site-companion');
  await expect(bot).toHaveAttribute('data-ready', 'true');
  const result = await page.evaluate(async () => {
    window.scrollTo({ top: 1400, behavior: 'instant' });
    let interrupted = false;
    for (let i = 0; i < 35; i++) {
      window.scrollBy({ top: -12, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 55));
      if (
        document.querySelector<HTMLElement>('.site-companion')!.dataset
          .poseState === 'turning'
      ) {
        interrupted = true;
        break;
      }
    }
    for (let i = 0; i < 40; i++) {
      window.scrollBy({ top: 12, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 60));
    }
    const actor = document.querySelector<HTMLElement>('.site-companion')!;
    return {
      interrupted,
      motion: actor.dataset.motion,
      facing: actor.dataset.facing,
      bodyYaw: actor.dataset.bodyYaw,
      headYaw: actor.dataset.headYaw,
    };
  });
  expect(result.interrupted).toBe(true);
  expect(result.motion).toBe('down');
  expect(result.facing).toBe('front-three-quarter');
  expect(result.bodyYaw).toBe(result.headYaw);
});

test('reference-style wave keeps five soft fingers attached to a coherent arm', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const bot = page.locator('.site-companion');
  await expect(bot).toHaveAttribute('data-ready', 'true');
  await page.clock.install();
  await page.mouse.move(20, 20);
  await page.clock.runFor(2100);
  await expect(bot).toHaveAttribute('data-hands', 'waving');
  await expect(bot.locator('[data-part^="finger-1-"]')).toHaveCount(4);
  await expect(bot.locator('[data-part="thumb-1"]')).toHaveCount(1);
  const geometry = await bot.evaluate((actor) => {
    const svg = actor.querySelector('.bot2')! as RigSvg;
    const frame = svg.robotFrame!;
    const distance = (a: V3, b: V3) =>
      Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    return {
      upper: distance(frame.joints.shoulders[1], frame.joints.elbows[1]),
      lower: distance(frame.joints.elbows[1], frame.joints.wrists[1]),
      visorMatches:
        actor.querySelector('[data-part="visor"]')!.getAttribute('d') ===
        frame.shapes.find((s) => s.id === 'visor')!.d,
    };
  });
  expect(geometry.upper).toBeCloseTo(0.24, 4);
  expect(geometry.lower).toBeCloseTo(0.22, 4);
  expect(geometry.visorMatches).toBe(true);
  await page.screenshot({
    path: 'test-results/new-reference-wave-' + testInfo.project.name + '.png',
  });
});

test('walking avoids forced layout reads and redundant SVG paint updates', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const bot = page.locator('.site-companion');
  await expect(bot).toHaveAttribute('data-ready', 'true');
  await page.clock.install();
  await page.mouse.move(20, 30);
  await page.clock.runFor(13000);
  const metrics = await bot.evaluate(async (actor) => {
    const scene = actor.querySelector('.bot-character')!;
    let layoutReads = 0,
      paintWrites = 0,
      movedNodes = 0;
    const original = actor.getBoundingClientRect;
    actor.getBoundingClientRect = function () {
      layoutReads++;
      return original.call(this);
    };
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'attributes' && record.attributeName !== 'd')
          paintWrites++;
        if (record.type === 'childList') movedNodes += record.addedNodes.length;
      }
    });
    observer.observe(scene, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    const start = performance.now();
    await new Promise<void>((resolve) => {
      let frames = 0;
      const tick = () => {
        if (++frames === 60) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    const elapsed = performance.now() - start;
    observer.disconnect();
    actor.getBoundingClientRect = original;
    return {
      layoutReads,
      paintWrites,
      movedNodes,
      elapsed,
      parts: scene.children.length,
    };
  });
  expect(metrics.layoutReads).toBe(0);
  expect(metrics.paintWrites).toBeLessThan(10);
  expect(metrics.movedNodes).toBeLessThan(metrics.parts * 30);
  await testInfo.attach('animation-work-per-60-frames', {
    body: JSON.stringify(metrics),
    contentType: 'application/json',
  });
});

test('animation recovers from refreshed character nodes without freezing', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const bot = page.locator('.site-companion');
  await expect(bot).toHaveAttribute('data-ready', 'true');
  await bot.evaluate((actor) => {
    const scene = actor.querySelector('.bot-character')!;
    const replacement = scene.cloneNode(true) as SVGGElement;
    replacement
      .querySelector('[data-part="helmet"]')!
      .setAttribute('d', 'M0 0L1 1');
    scene.replaceWith(replacement);
  });
  await expect(bot.locator('[data-part="helmet"]')).not.toHaveAttribute(
    'd',
    'M0 0L1 1',
  );
  const before = await bot.locator('[data-part="helmet"]').getAttribute('d');
  await page.mouse.move(10, 20);
  await page.waitForTimeout(250);
  expect(await bot.locator('[data-part="helmet"]').getAttribute('d')).not.toBe(
    before,
  );
});

test('mouse movement and section reactions keep the face on the helmet', async ({
  page,
}) => {
  await page.goto('/');
  const bot = page.locator('.site-companion');
  await expect(bot).toHaveAttribute('data-ready', 'true');
  await page.mouse.move(10, 20);
  const first = await bot.evaluate((el) =>
    el.style.getPropertyValue('--bot-look-y'),
  );
  await page.mouse.move(
    page.viewportSize()!.width - 10,
    page.viewportSize()!.height - 10,
  );
  expect(
    await bot.evaluate((el) => el.style.getPropertyValue('--bot-look-y')),
  ).not.toBe(first);
  for (const [section, emotion] of [
    ['work', 'curious'],
    ['about', 'happy'],
    ['expertise', 'thinking'],
    ['contact', 'excited'],
  ]) {
    await page.locator('#' + section + ' h2').hover();
    await expect(bot).toHaveAttribute('data-face', emotion);
    await expect(bot).toHaveAttribute('data-face-visible', 'true', {
      timeout: 6000,
    });
    await expect(bot.locator('[data-part="mouth"]')).toHaveAttribute(
      'opacity',
      '1',
    );
  }
});

test('project cards trigger positive eyes, brows and smile after the whole body turns toward them', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.locator('.project-card').first().hover();
  const bot = page.locator('.site-companion');
  await expect(bot).toHaveAttribute('data-face', 'impressed');
  await expect(bot).toHaveAttribute('data-face-visible', 'true', {
    timeout: 6000,
  });
  for (const part of ['eye-0', 'eye-1', 'brow-0', 'brow-1', 'mouth'])
    await expect(bot.locator('[data-part="' + part + '"]')).toHaveAttribute(
      'opacity',
      '1',
    );
  await page.screenshot({
    path: 'test-results/positive-projects-' + testInfo.project.name + '.png',
  });
});

test('waiting pace keeps hands behind the body and resumes on activity', async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const bot = page.locator('.site-companion');
  await expect(bot).toHaveAttribute('data-ready', 'true');
  await page.clock.install();
  await page.mouse.move(20, 30);
  await page.clock.runFor(13500);
  await expect(bot).toHaveAttribute('data-motion', 'waiting');
  await expect(bot).toHaveAttribute('data-hands', 'behind-back');
  await expect(bot).toHaveAttribute('data-gait', 'walking');
  await expect(bot).toHaveAttribute('data-facing', 'profile');
  expect(Number(await bot.getAttribute('data-body-yaw'))).toBeCloseTo(
    -Math.PI / 2,
    2,
  );
  const outboundX = Number(await bot.getAttribute('data-patrol-x'));
  expect(outboundX).toBeLessThan(-50);
  const first = await bot.locator('[data-part="knee-0"]').getAttribute('d');
  await page.clock.runFor(500);
  expect(await bot.locator('[data-part="knee-0"]').getAttribute('d')).not.toBe(
    first,
  );
  await page.screenshot({
    path: 'test-results/coherent-waiting-' + testInfo.project.name + '.png',
  });
  await page.mouse.move(40, 45);
  await expect(bot).toHaveAttribute('data-motion', 'rest');
  await page.clock.runFor(100);
  await expect(bot).toHaveAttribute('data-patrol', 'returning');
  for (let i = 0; i < 12; i++) {
    await page.mouse.move(40 + i, 45);
    await page.clock.runFor(500);
  }
  await expect(bot).toHaveAttribute('data-patrol', 'home');
  expect(
    Math.abs(Number(await bot.getAttribute('data-patrol-x'))),
  ).toBeLessThan(0.5);
  await page.goto('/projects/atlas');
  await expect(bot).toHaveCount(0);
});

test('idle patrol crosses to the left screen edge and reverses in profile', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const bot = page.locator('.site-companion');
  await expect(bot).toHaveAttribute('data-ready', 'true');
  await page.clock.install();
  await page.mouse.move(20, 30);
  const width = page.viewportSize()!.width;
  await page.clock.runFor(9000 + (width / 33.6 + 4) * 1000);
  await expect(bot).toHaveAttribute('data-patrol', 'right');
  await expect(bot).toHaveAttribute('data-facing', 'profile');
  expect(Number(await bot.getAttribute('data-body-yaw'))).toBeCloseTo(
    Math.PI / 2,
    2,
  );
  const start = Number(await bot.getAttribute('data-patrol-x'));
  await page.clock.runFor(1000);
  expect(Number(await bot.getAttribute('data-patrol-x'))).toBeGreaterThan(
    start,
  );
  const bounds = await bot.locator('.companion-patrol').boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(8);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
});

test('mobile navigation supports escape and anchor selection', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const toggle = page.getByRole('button', { name: 'Open navigation' });
  await toggle.click();
  await expect(
    page.getByRole('navigation', { name: 'Mobile navigation' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('navigation', { name: 'Mobile navigation' }),
  ).toHaveCount(0);
  await toggle.click();
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: 'About' })
    .click();
  await expect(page).toHaveURL(/#about$/);
  await expect(
    page.getByRole('navigation', { name: 'Mobile navigation' }),
  ).toHaveCount(0);
});

test('narrow screens have no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
