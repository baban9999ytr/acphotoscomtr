import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  PUBLIC_CONTENT_SOURCE: "supabase",
  PUBLIC_CONTENT_MODE: "",
  PUBLIC_SUPABASE_URL: "https://demo.supabase.co",
  PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    "sb_publishable_test_key_that_is_not_a_secret",
  PUBLIC_SUPABASE_ANON_KEY: "",
};
const missingConfigEnv = {
  ...env,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
};
for (const [command, args, extraEnv] of [
  [process.execPath, ["node_modules/astro/bin/astro.mjs", "build"], env],
  [
    process.execPath,
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      "--config=playwright.fallback.config.ts",
      "tests/fallback.spec.ts",
    ],
    { ...env, ACPHOTOS_FALLBACK_TEST: "1" },
  ],
  [process.execPath, ["node_modules/astro/bin/astro.mjs", "build"], env],
  [
    process.execPath,
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      "--config=playwright.fallback.config.ts",
      "tests/contact-form.spec.ts",
    ],
    { ...env, ACPHOTOS_CONTACT_TEST: "1" },
  ],
  [
    process.execPath,
    ["node_modules/astro/bin/astro.mjs", "build"],
    missingConfigEnv,
  ],
  [
    process.execPath,
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      "--config=playwright.fallback.config.ts",
      "tests/missing-config.spec.ts",
    ],
    { ...missingConfigEnv, ACPHOTOS_MISSING_CONFIG_TEST: "1" },
  ],
]) {
  const result = spawnSync(command, args, { stdio: "inherit", env: extraEnv });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
