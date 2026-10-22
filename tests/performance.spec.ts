import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
test("yerel performans ve masaüstü yönetim görünümü", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page
    .locator(".hero-main")
    .evaluate((img) => (img as HTMLImageElement).decode());
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "output/playwright/home-desktop-viewport.png",
  });
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];
    return {
      environment:
        "Local Chromium, no throttling; not a production Web Vitals score",
      domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
      loadMs: Math.round(nav.loadEventEnd),
      requests: resources.length,
      transferBytes: resources.reduce((n, r) => n + r.transferSize, 0),
      images: resources.filter((r) => r.initiatorType === "img").length,
      jsTransferBytes: resources
        .filter((r) => /\.js(?:\?|$)/.test(r.name))
        .reduce((n, r) => n + r.transferSize, 0),
    };
  });
  await mkdir("output/playwright", { recursive: true });
  await writeFile(
    "output/playwright/performance.json",
    JSON.stringify(metrics, null, 2),
  );
  expect(metrics.images).toBeLessThan(15);
  await page.goto("/admin/");
  await page.getByRole("button", { name: "Demoyu aç" }).click();
  await expect(page.locator(".stat")).toHaveCount(4);
  await page.screenshot({
    path: "output/playwright/admin-desktop.png",
    fullPage: true,
  });
});
