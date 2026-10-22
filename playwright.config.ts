import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  // Keep the local static preview deterministic on Windows, where two
  // browser workers caused navigation and image-upload timeouts under load.
  workers: 1,
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
