import { test, expect } from '@playwright/test';
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

test('companion gestures and neural background animate, and respect reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const wave = page.locator('.hero .bot-wave');
  const head = page.locator('.hero .bot-head');
  await expect(wave).toHaveCSS('animation-name', 'companion-wave');
  await expect(head).toHaveCSS('animation-name', 'companion-head');
  const transforms = await page
    .locator('.hero .ai-companion')
    .evaluate((svg) => {
      const sample = (selector: string, times: number[]) => {
        const element = svg.querySelector(selector)!;
        const animation = element.getAnimations()[0];
        animation.pause();
        return times.map((time) => {
          animation.currentTime = time;
          return getComputedStyle(element).transform;
        });
      };
      return {
        wave: sample('.bot-wave', [0, 1100]),
        head: sample('.bot-head', [0, 2800, 8400]),
      };
    });
  expect(new Set(transforms.wave).size).toBe(2);
  expect(new Set(transforms.head).size).toBe(3);
  await expect(page.locator('.neural-wash')).toHaveCSS(
    'animation-name',
    'neural-drift',
  );
  await page.screenshot({ path: 'test-results/hero-motion.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(wave).toHaveCSS('animation-name', 'none');
  await expect(head).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.neural-wash')).toHaveCSS(
    'animation-name',
    'none',
  );
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
