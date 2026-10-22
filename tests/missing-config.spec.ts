import { test, expect } from "@playwright/test";

test.skip(
  process.env.ACPHOTOS_MISSING_CONFIG_TEST !== "1",
  "Run with test:runtime missing configuration build.",
);

test("missing production config labels public preview and keeps admin writes disabled", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("[data-preview-fallback]")).toContainText(
    "Örnek içerik gösteriliyor",
  );
  await expect(page.locator("body")).toHaveAttribute(
    "data-mode",
    "preview-fallback",
  );
  await expect(page.locator(".album-card")).toHaveCount(3);
  await page.goto("/iletisim/");
  await expect(page.getByRole("button", { name: /Mesajı gönder/ })).toBeDisabled();
  await expect(page.locator("[data-contact-form-note]")).toContainText(
    "Supabase yapılandırıldığında",
  );
  await page.goto("/admin/");
  await expect(page.getByRole("button", { name: "Demoyu aç" })).toHaveCount(0);
  await expect(page.locator("#admin-root .preview-notice")).toContainText(
    "Yönetim oturumu ve kayıt işlemleri etkin değil",
  );
  await expect(page.locator("#admin-root")).toContainText("Canlı Yönetim");
});
