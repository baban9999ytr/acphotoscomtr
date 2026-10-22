import { submitContactMessage } from "../lib/repository";

const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
const status = document.querySelector<HTMLElement>("[data-contact-form-status]");
const submit = form?.querySelector<HTMLButtonElement>("[type=submit]");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity() || !status || !submit) return;

  const fields = new FormData(form);
  submit.disabled = true;
  submit.textContent = "Gönderiliyor…";
  status.textContent = "";

  try {
    const accepted = await submitContactMessage({
      name: String(fields.get("name") ?? ""),
      email: String(fields.get("email") ?? ""),
      message: String(fields.get("message") ?? ""),
      website: String(fields.get("website") ?? ""),
    });
    if (accepted) {
      form.reset();
      status.textContent = "Teşekkürler, mesajınız alındı.";
    } else {
      status.textContent =
        "Bu e-posta adresiyle kısa süre önce mesaj gönderilmiş olabilir. Biraz sonra tekrar deneyin veya e-posta ya da WhatsApp ile ulaşın.";
    }
  } catch (error) {
    console.error("ACPhotos contact form submission failed", error);
    status.textContent =
      error instanceof Error && error.message.startsWith("Lütfen")
        ? error.message
        : "Mesajınız gönderilemedi. Lütfen e-posta veya WhatsApp ile ulaşın.";
  } finally {
    submit.disabled = false;
    submit.textContent = "Mesajı gönder ↗";
  }
});
