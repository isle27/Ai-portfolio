import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:3107',
    trace: 'retain-on-failure',
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'node node_modules/next/dist/bin/next start -p 3107',
    url: 'http://localhost:3107',
    reuseExistingServer: false,
    timeout: 120000,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: 'mobile',
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
