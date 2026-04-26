import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 15_000,
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 480, height: 854 },
    launchOptions: {
      executablePath: '/home/loic/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
  webServer: {
    command: 'pnpm dev --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env['CI'],
  },
})
