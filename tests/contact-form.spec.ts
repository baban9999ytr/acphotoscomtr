import { test, expect } from "@playwright/test";

test.skip(
  !process.env.ACPHOTOS_CONTACT_TEST,
  "Runs against a Supabase-configured test build with a mocked RPC.",
);

test("contact form submits validated fields through the Supabase RPC", async ({
  page,
}) => {
  let submitted: Record<string, string> | undefined;
  await page.route("https://demo.supabase.co/rest/v1/**", async (route) => {
    if (route.request().url().includes("/rpc/submit_contact_message")) {
      submitted = route.request().postDataJSON() as Record<string, string>;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "true",
      });
      return;
    }
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Test data reads are unavailable." }),
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/iletisim/");
  const form = page.locator("[data-contact-form]");
  await form.getByLabel("Adınız").fill("Ada Test");
  await form.getByLabel("E-posta adresiniz").fill("ada@example.com");
  await form
    .getByLabel("Mesajınız")
    .fill("Spor etkinliği fotoğrafları hakkında bilgi almak istiyorum.");
  await form.getByRole("button", { name: /Mesajı gönder/ }).click();

  await expect(page.locator("[data-contact-form-status]")).toHaveText(
    "Teşekkürler, mesajınız alındı.",
  );
  expect(submitted).toEqual({
    p_name: "Ada Test",
    p_email: "ada@example.com",
    p_message: "Spor etkinliği fotoğrafları hakkında bilgi almak istiyorum.",
    p_website: "",
  });
  await expect(form.getByLabel("Adınız")).toHaveValue("");
});
