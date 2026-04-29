import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 15_000,
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 480, height: 854 },
    launchOptions: {
      executablePath: process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH"],
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--use-gl=swiftshader",
        "--enable-webgl",
      ],
    },
  },
  webServer: {
    command: "pnpm dev --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env["CI"],
  },
});
