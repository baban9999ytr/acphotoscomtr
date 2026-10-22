import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 2,
  timeout: 45000,
  use: {
    baseURL: "http://127.0.0.1:4322",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/preview-static.mjs",
    url: "http://127.0.0.1:4322",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
