import { test } from "node:test";
import assert from "node:assert/strict";
import {
  demoAdminEnabled,
  resolveContentConfig,
} from "../src/lib/runtime-config.js";

const validKey = "sb_publishable_012345678901234567890123";

test("local mode wins over configured credentials and legacy defaults local", () => {
  const explicitLocal = resolveContentConfig({
    source: "local",
    url: "https://demo.supabase.co",
    key: validKey,
  });
  assert.equal(explicitLocal.mode, "local");
  assert.equal(demoAdminEnabled(explicitLocal), true);
  const defaultLocal = resolveContentConfig({});
  assert.equal(defaultLocal.mode, "local");
  assert.equal(demoAdminEnabled(defaultLocal), true);
});

test("missing or invalid supabase configuration safely selects local mode", () => {
  for (const input of [
    { source: "supabase" },
    { source: "supabase", url: "not a url", key: validKey },
    { source: "supabase", url: "https://demo.supabase.co/path", key: validKey },
    {
      source: "supabase",
      url: "https://demo.supabase.co",
      key: "sb_secret_do_not_expose",
    },
    { source: "unexpected", url: "https://demo.supabase.co", key: validKey },
  ]) {
    const resolved = resolveContentConfig(input);
    assert.equal(resolved.mode, "local");
    assert.equal(demoAdminEnabled(resolved), false);
  }
});

test("valid HTTPS public key and local development endpoint select supabase", () => {
  assert.equal(
    resolveContentConfig({
      source: "supabase",
      url: "https://demo.supabase.co",
      key: validKey,
    }).mode,
    "supabase",
  );
  assert.equal(
    resolveContentConfig({
      source: "supabase",
      url: "http://127.0.0.1:54321",
      key: validKey,
    }).mode,
    "supabase",
  );
});
