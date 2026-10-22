export {};
const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
const nav = document.querySelector<HTMLElement>("#navigation");
toggle?.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("open", open);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav?.classList.contains("open")) {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.focus();
  }
});
if (
  !matchMedia("(prefers-reduced-motion: reduce)").matches &&
  document.querySelector(".hero")
) {
  void import("gsap").then(({ gsap }) => {
    gsap.from(".hero-main", {
      opacity: 0.3,
      duration: 1.3,
      ease: "power2.out",
    });
    gsap.from(".hero-copy", { y: 16, duration: 1, ease: "power2.out" });
  });
}
const dialog = document.querySelector<HTMLDialogElement>("#lightbox");
let active = 0;
let opener: HTMLElement | null = null;
const items = () =>
  Array.from(document.querySelectorAll<HTMLButtonElement>("[data-full]"));
function show(index: number) {
  const all = items();
  if (!all.length) return;
  active = (index + all.length) % all.length;
  const item = all[active]!;
  const image = document.querySelector<HTMLImageElement>("#lightbox-image")!;
  image.src = item.dataset.full!;
  image.alt = item.dataset.alt ?? "";
  document.querySelector("#lightbox-caption")!.textContent = image.alt;
  document.querySelector("#lightbox-count")!.textContent =
    `${active + 1} / ${all.length}`;
}
document.addEventListener("click", (e) => {
  const target = (e.target as Element).closest<HTMLButtonElement>(
    "[data-full]",
  );
  if (target && dialog) {
    opener = target;
    show(items().indexOf(target));
    dialog.showModal();
    document.querySelector<HTMLButtonElement>("#lightbox-close")?.focus();
  }
});
document
  .querySelector("#lightbox-close")
  ?.addEventListener("click", () => dialog?.close());
document
  .querySelector("#lightbox-prev")
  ?.addEventListener("click", () => show(active - 1));
document
  .querySelector("#lightbox-next")
  ?.addEventListener("click", () => show(active + 1));
dialog?.addEventListener("close", () => opener?.focus());
dialog?.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    show(active - 1);
  }
  if (e.key === "ArrowRight") {
    e.preventDefault();
    show(active + 1);
  }
});
let startX = 0;
dialog?.addEventListener(
  "touchstart",
  (e) => {
    startX = e.changedTouches[0]?.clientX ?? 0;
  },
  { passive: true },
);
dialog?.addEventListener(
  "touchend",
  (e) => {
    const delta = (e.changedTouches[0]?.clientX ?? startX) - startX;
    if (Math.abs(delta) > 60) show(active + (delta < 0 ? 1 : -1));
  },
  { passive: true },
);
