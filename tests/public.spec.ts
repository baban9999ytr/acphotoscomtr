import { test, expect } from "@playwright/test";
for (const width of [390, 768, 1440])
  test(`anasayfa ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Oyunun kalbinde.");
    await expect(page.locator(".demo-disclosure")).toContainText(
      "Yapay zekâ ile oluşturulmuş demo görseller",
    );
    await expect(page.locator(".hero-main")).toBeVisible();
    await expect(page.locator(".about-photo img")).toBeVisible();
    await expect(page.locator(".contact-cta img")).toBeVisible();
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
  for (const category of [
    "Futbol",
    "Basketbol",
    "Tribün & Stadyum",
    "Portre",
    "Etkinlik",
    "Sosyal Sorumluluk",
  ])
    await expect(
      page.getByRole("button", { name: category, exact: true }),
    ).toBeVisible();
  await page.getByRole("button", { name: "Etkinlik", exact: true }).click();
  await expect(page.locator(".album-card:visible")).toHaveCount(1);
  await page.getByRole("button", { name: "Tümü", exact: true }).click();
  await page.getByRole("link", { name: /Maçın ritmi/ }).click();
  const opener = page.locator("[data-full]").first();
  await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#lightbox-count")).toHaveText("1 / 1");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#lightbox-count")).toHaveText("1 / 1");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(opener).toBeFocused();
});
test("sayfalar, SEO, iletişim ve hukuk taslakları", async ({ page }) => {
  for (const route of [
    "/albumler/",
    "/hakkimizda/",
    "/blog/",
    "/iletisim/",
    "/gizlilik-politikasi/",
    "/cerez-politikasi/",
    "/kullanim-kosullari/",
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
  await expect(page.locator('meta[itemprop="email"]')).toHaveAttribute(
    "content",
    "cesurturk16@hotmail.com",
  );
  await expect(page.locator('meta[itemprop="telephone"]')).toHaveAttribute(
    "content",
    "+905315172842",
  );
  await expect(
    page.locator('a[href="mailto:cesurturk16@hotmail.com"]').first(),
  ).toBeVisible();
  await expect(page.locator('a[href="tel:+905315172842"]')).toBeVisible();
  await expect(
    page.locator('a[href="https://wa.me/905315172842"]'),
  ).toBeVisible();
  await expect(
    page.locator('a[href="https://www.instagram.com/acphotos.tr/"]').first(),
  ).toBeVisible();
  await page.goto("/gizlilik-politikasi/");
  await expect(page.locator(".preview-notice")).toContainText("taslak");
});
