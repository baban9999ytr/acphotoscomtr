import { test, expect } from "@playwright/test";

test.skip(
  process.env.ACPHOTOS_FALLBACK_TEST !== "1",
  "Run with test:runtime fallback build.",
);

test("Supabase read outage shows labelled local preview without demo admin login", async ({
  page,
}) => {
  await page.route("https://demo.supabase.co/**", async (route) =>
    route.fulfill({
      status: 401,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "*",
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: "Invalid API key" }),
    }),
  );
  await page.goto("/");
  await expect(page.locator("[data-preview-fallback]")).toContainText(
    "Örnek içerik gösteriliyor",
  );
  await expect(page.locator("body")).toHaveAttribute(
    "data-mode",
    "preview-fallback",
  );
  await expect(page.locator("body")).not.toContainText(
    "Supabase yapılandırması eksik veya geçersiz",
  );
  await expect(page.locator(".hero-main")).toBeVisible();
  await expect(page.locator("[data-public-projects] .album-card")).toHaveCount(
    3,
  );
  await expect(page.locator("[data-public-projects]")).toContainText(
    "Maçın ritmi",
  );
  await page.goto("/iletisim/");
  await expect(page.getByRole("button", { name: /Mesajı gönder/ })).toBeEnabled();
  await page.goto("/admin/");
  await expect(page.getByRole("button", { name: "Demoyu aç" })).toHaveCount(0);
  await expect(page.getByLabel("E-posta")).toBeVisible();
});
