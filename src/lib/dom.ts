export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
  className?: string,
) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
export function link(text: string, href: string, className?: string) {
  const a = el("a", text, className);
  a.href = href;
  return a;
}
export function button(
  text: string,
  action: () => void | Promise<void>,
  className?: string,
) {
  const b = el("button", text, className);
  b.type = "button";
  b.addEventListener("click", () => void action());
  return b;
}
export function message(error: unknown) {
  if (error instanceof Error && error.name === "ZodError")
    return "Alanları kontrol edin: zorunlu alanları doldurun, uzunluk sınırlarına ve bağlantı biçimine uyun.";
  return error instanceof Error
    ? error.message
    : "İşlem tamamlanamadı. Yeniden deneyin.";
}
