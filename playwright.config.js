import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/ui",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    browserName: "chromium",
    headless: true,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {},
    viewport: { width: 1440, height: 1000 },
  },
  reporter: "list",
});
