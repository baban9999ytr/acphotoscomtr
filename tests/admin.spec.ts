import { test, expect } from "@playwright/test";
test("mobil ayarlar, silme onayı ve kalıcılık", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/");
  await page.getByRole("button", { name: "Demoyu aç" }).click();
  await page
    .getByRole("button", { name: "Site Ayarları", exact: true })
    .click();
  await page
    .getByLabel("Hakkımızda", { exact: true })
    .fill("Kaydedilen tanıtım metni.");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(page.locator(".status")).toContainText("kaydedildi");
  await page.reload();
  await page.getByRole("button", { name: "Fotoğraflar", exact: true }).click();
  await page
    .locator(".photo-admin")
    .first()
    .getByRole("button", { name: "Sil", exact: true })
    .click();
  await page.getByRole("button", { name: "Vazgeç", exact: true }).click();
  await expect(page.locator(".photo-admin")).toHaveCount(2);
  await page
    .locator(".photo-admin")
    .first()
    .getByRole("button", { name: "Sil", exact: true })
    .click();
  await page.getByRole("button", { name: "Onayla", exact: true }).click();
  await expect(page.locator(".photo-admin")).toHaveCount(1);
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.screenshot({
    path: "output/playwright/admin-mobile.png",
    fullPage: true,
  });
  await page.goto("/hakkimizda/");
  await expect(page.locator("[data-about]")).toHaveText(
    "Kaydedilen tanıtım metni.",
  );
});
test("albüm, yükleme, kapak, sıralama, yayın ve kaldırma", async ({ page }) => {
  await page.goto("/admin/");
  await page.getByRole("button", { name: "Demoyu aç" }).click();
  await page.getByRole("button", { name: "Albümler", exact: true }).click();
  await page.getByRole("button", { name: "Albüm oluştur" }).click();
  await page.getByLabel("Başlık", { exact: true }).fill("Test albümü");
  await page.getByLabel(/Bağlantı adı/).fill("test-albumu");
  await page.getByLabel("Açıklama", { exact: true }).fill("Tarayıcı testi");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  const row = page.locator(".admin-row").filter({ hasText: "Test albümü" });
  await expect(row).toContainText("Taslak");
  await row.getByRole("button", { name: "Fotoğraflar", exact: true }).click();
  await page
    .getByLabel(/Fotoğraf yükle/)
    .setInputFiles([
      "public/demo/photo-1-480.webp",
      "public/demo/photo-3-480.webp",
    ]);
  await expect(page.locator(".photo-admin")).toHaveCount(2);
  await page
    .locator(".photo-admin")
    .last()
    .getByRole("button", { name: "Kapak yap" })
    .click();
  await expect(
    page.getByRole("button", { name: "Kapak fotoğrafı" }),
  ).toHaveCount(1);
  await page
    .locator(".photo-admin")
    .last()
    .getByRole("button", { name: "Öne taşı" })
    .click();
  await expect(
    page.locator(".photo-admin").first().getByLabel("Alternatif metin"),
  ).toHaveValue("photo-3-480");
  await page
    .locator(".photo-admin")
    .first()
    .getByLabel("Alternatif metin")
    .fill("Deniz fotoğrafı");
  await page
    .locator(".photo-admin")
    .first()
    .getByRole("button", { name: "Kaydet" })
    .click();
  await page.getByRole("button", { name: "Albümler", exact: true }).click();
  await row.getByRole("button", { name: "Yayınla", exact: true }).click();
  await page.getByRole("button", { name: "Onayla", exact: true }).click();
  await expect(row).toContainText("Yayında");
  await page.goto("/albumler/goruntule/?slug=test-albumu");
  await expect(page.locator("h1")).toHaveText("Test albümü");
  await expect(page.locator("[data-gallery] button")).toHaveCount(2);
  await expect(page.locator("[data-gallery] img").first()).toHaveAttribute(
    "alt",
    "Deniz fotoğrafı",
  );
  await page.locator("[data-gallery] button").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/admin/");
  await page.getByRole("button", { name: "Albümler", exact: true }).click();
  await row.getByRole("button", { name: "Yayından kaldır" }).click();
  await page.getByRole("button", { name: "Onayla" }).click();
  await expect(row).toContainText("Taslak");
  await page.goto("/albumler/goruntule/?slug=test-albumu");
  await expect(page.locator("h1")).toHaveText("Albüm bulunamadı.");
  await expect(page.locator("[data-gallery] img")).toHaveCount(0);
});
test("kategori, blog ve güvenli metin", async ({ page }) => {
  await page.goto("/admin/");
  await page.getByRole("button", { name: "Demoyu aç" }).click();
  await page.getByRole("button", { name: "Kategoriler", exact: true }).click();
  await page.getByRole("button", { name: "Kategori ekle" }).click();
  await page.getByLabel("Kategori adı").fill("Portre");
  await page.getByLabel(/Bağlantı adı/).fill("portre");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(
    page.locator(".admin-row").filter({ hasText: "Portre" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Blog", exact: true }).click();
  await page.getByRole("button", { name: "Yeni yazı" }).click();
  await page.getByLabel("Başlık", { exact: true }).fill("Bir not");
  await page.getByLabel(/Bağlantı adı/).fill("bir-not");
  await page.getByLabel(/Yazı metni/).fill("<img src=x onerror=alert(1)>");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await page.getByRole("button", { name: "Yayınla", exact: true }).click();
  await page.getByRole("button", { name: "Onayla" }).click();
  await page.goto("/blog/goruntule/?slug=bir-not");
  await expect(page.locator("[data-post-body]")).toHaveText(
    "<img src=x onerror=alert(1)>",
  );
  await expect(page.locator("[data-post-body] img")).toHaveCount(0);
});
test("yükleme doğrulama ve yinelenen fotoğraf", async ({ page }) => {
  await page.goto("/admin/");
  await page.getByRole("button", { name: "Demoyu aç" }).click();
  await page.getByRole("button", { name: "Fotoğraflar", exact: true }).click();
  await page.getByLabel(/Fotoğraf yükle/).setInputFiles({
    name: "fake.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("not a photo"),
  });
  await expect(page.locator(".upload-row")).toContainText(
    "desteklenen bir fotoğraf değil",
  );
  await page
    .getByLabel(/Fotoğraf yükle/)
    .setInputFiles("public/demo/photo-1-480.webp");
  await expect(page.locator(".photo-admin")).toHaveCount(3);
  await page
    .getByLabel(/Fotoğraf yükle/)
    .setInputFiles("public/demo/photo-1-480.webp");
  await expect(page.locator(".upload-row").last()).toContainText(
    "zaten bulunuyor",
  );
  await expect(page.locator(".photo-admin")).toHaveCount(3);
});
