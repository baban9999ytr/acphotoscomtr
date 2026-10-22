import { test, expect } from "@playwright/test";
for (const width of [360, 390, 768, 1024, 1440, 1920])
  test(`anasayfa ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Işığın izinde.");
    await expect(
      page.locator("[data-public-projects] .album-card"),
    ).toHaveCount(3);
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.screenshot({
      path: `output/playwright/home-${width}.png`,
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
test("mobil menü, filtre, galeri ve klavye", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menü" }).click();
  await page
    .locator("#navigation")
    .getByRole("link", { name: "Albümler", exact: true })
    .click();
  await page.getByRole("button", { name: "Mimari", exact: true }).click();
  await expect(page.locator(".album-card:visible")).toHaveCount(1);
  await page.getByRole("button", { name: "Tümü", exact: true }).click();
  await page.getByRole("link", { name: /Sessiz zirveler/ }).click();
  const opener = page.locator("[data-full]").first();
  await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#lightbox-count")).toHaveText("1 / 2");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#lightbox-count")).toHaveText("2 / 2");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(opener).toBeFocused();
});
test("sayfalar, SEO ve doğrulanmamış iletişim", async ({ page }) => {
  for (const route of [
    "/albumler/",
    "/hakkimizda/",
    "/blog/",
    "/iletisim/",
    "/404.html",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
      "href",
      `https://acphotos.com.tr${route}`,
    );
  }
  await page.goto("/iletisim/");
  await expect(page.locator('a[href^="tel:"],a[href^="mailto:"]')).toHaveCount(
    0,
  );
});
