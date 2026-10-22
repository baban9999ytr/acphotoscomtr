import { list, imageUrl, releaseImages } from "../lib/repository";
import { el, link, message } from "../lib/dom";
import { demoMode, type Project, type Photo } from "../lib/model";
const imageObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const img = entry.target as HTMLImageElement;
      imageObserver.unobserve(img);
      const path = img.dataset.path;
      if (path)
        imageUrl(path)
          .then((url) => {
            img.src = url;
          })
          .catch(() => {
            img.alt += " — görsel yüklenemedi";
          });
    }
  },
  { rootMargin: "200px" },
);
function picture(photo: Photo, variant = 1) {
  const img = el("img");
  img.alt = photo.alt;
  img.width = photo.width;
  img.height = photo.height;
  img.loading = "lazy";
  img.dataset.path = photo.paths[variant];
  if (photo.paths[variant]!.startsWith("/demo/")) {
    img.src = photo.paths[variant]!;
    img.srcset = `${photo.paths[0]} 480w, ${photo.paths[1]} 1000w, ${photo.paths[2]} 1800w`;
    img.sizes = "(max-width:700px) 92vw, 48vw";
  } else imageObserver.observe(img);
  return img;
}
function projectLink(p: Project) {
  return demoMode &&
    ["sessiz-zirveler", "kiyinin-otesinde", "isik-ve-yapi"].includes(p.slug)
    ? `/albumler/${p.slug}/`
    : `/albumler/goruntule/?slug=${encodeURIComponent(p.slug)}`;
}
function card(project: Project, photos: Photo[]) {
  const a = link("", projectLink(project), "album-card");
  a.dataset.category = project.category_id ?? "";
  const photo =
    photos.find((p) => p.project_id === project.id && p.is_cover) ??
    photos.find((p) => p.project_id === project.id);
  const frame = el("div", undefined, "photo-frame");
  if (photo) frame.append(picture(photo));
  else frame.append(el("p", "Fotoğraf eklenecek"));
  a.append(frame);
  const caption = el("div", undefined, "album-caption");
  caption.append(el("h3", project.title), el("span", "↗"));
  a.append(caption, el("p", project.description));
  return a;
}
function filters() {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-filter]");
  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const cards = document.querySelectorAll<HTMLElement>("[data-category]");
      let count = 0;
      cards.forEach((c) => {
        c.hidden =
          b.dataset.filter !== "all" && c.dataset.category !== b.dataset.filter;
        if (!c.hidden) count++;
      });
      const empty = document.querySelector<HTMLElement>("[data-empty]");
      if (empty) empty.hidden = count > 0;
    }),
  );
}
async function render() {
  const settings = (await list("site_settings"))[0];
  if (settings) {
    document
      .querySelectorAll(".brand")
      .forEach((n) => (n.textContent = settings.logo_text));
    document.querySelectorAll("[data-hero-title]").forEach((n) => {
      n.textContent = settings.hero_title;
      (n as HTMLElement).style.whiteSpace = "pre-line";
    });
    document
      .querySelectorAll("[data-hero-description]")
      .forEach((n) => (n.textContent = settings.hero_description));
    document
      .querySelectorAll("[data-about]")
      .forEach((n) => (n.textContent = settings.about));
    const contact = document.querySelector("[data-contact]");
    if (contact && (settings.phone || settings.email || settings.instagram)) {
      contact.replaceChildren(el("h2", "İletişime geçin"));
      if (settings.email)
        contact.append(link(settings.email, `mailto:${settings.email}`));
      if (settings.phone) {
        contact.append(
          link(settings.phone, `tel:${settings.phone}`),
          link("WhatsApp", `https://wa.me/${settings.phone.slice(1)}`),
        );
      }
      if (settings.instagram)
        contact.append(link("Instagram", settings.instagram));
    }
  }
  const grid = document.querySelector<HTMLElement>("[data-public-projects]");
  const detail = document.querySelector<HTMLElement>(
    "[data-project-slug], [data-dynamic-project]",
  );
  if (grid || detail || settings?.hero_image_id) {
    const [projects, photos, categories] = await Promise.all([
      list("projects"),
      list("project_images"),
      list("categories"),
    ]);
    if (settings?.hero_image_id) {
      const photo = photos.find((p) => p.id === settings.hero_image_id);
      if (photo) {
        let hero = document.querySelector<HTMLImageElement>(".hero-main");
        if (!hero) {
          hero = el("img", undefined, "hero-main");
          document.querySelector(".hero")?.append(hero);
        }
        hero.src = await imageUrl(photo.paths[1]!);
        hero.alt = photo.alt;
        hero.width = photo.width;
        hero.height = photo.height;
        hero.removeAttribute("srcset");
      }
    }
    if (grid) {
      grid.replaceChildren(
        ...projects
          .filter((p) => !grid.hasAttribute("data-featured") || p.featured)
          .map((p) => card(p, photos)),
      );
      if (!grid.children.length)
        grid.append(el("p", "Henüz yayımlanmış albüm bulunmuyor."));
      document.querySelector(".loading")?.remove();
      const filter = document.querySelector("[data-filters]");
      if (filter) {
        filter.replaceChildren();
        for (const c of [{ id: "all", name: "Tümü" }, ...categories]) {
          const b = el("button", c.name);
          b.dataset.filter = c.id;
          b.setAttribute("aria-pressed", String(c.id === "all"));
          filter.append(b);
        }
        filters();
      }
    }
    if (detail) {
      const slug =
        detail.dataset.projectSlug ??
        new URLSearchParams(location.search).get("slug");
      const project = projects.find((p) => p.slug === slug);
      if (!project) {
        detail.replaceChildren(
          el("h1", "Albüm bulunamadı."),
          el("p", "Bu albüm yayında değil veya kaldırılmış."),
          link("Albümlere dön", "/albumler/"),
        );
        return;
      }
      const title = detail.querySelector("h1");
      if (title) title.textContent = project.title;
      const desc = detail.querySelector(
        "[data-project-description], .page-intro p",
      );
      if (desc) desc.textContent = project.description;
      const gallery = detail.querySelector("[data-gallery]");
      if (gallery) {
        gallery.replaceChildren();
        for (const photo of photos.filter((p) => p.project_id === project.id)) {
          const b = el("button", undefined, "gallery-item");
          b.setAttribute("aria-label", `${photo.alt} — büyüt`);
          b.dataset.alt = photo.alt;
          b.append(picture(photo));
          if (photo.paths[2]!.startsWith("/demo/"))
            b.dataset.full = photo.paths[2];
          else
            b.addEventListener("click", async () => {
              if (b.dataset.full) return;
              b.disabled = true;
              try {
                b.dataset.full = await imageUrl(photo.paths[2]!);
                b.disabled = false;
                b.click();
              } catch {
                b.disabled = false;
                b.setAttribute(
                  "aria-label",
                  "Fotoğraf yüklenemedi. Yeniden deneyin.",
                );
              }
            });
          gallery.append(b);
        }
        if (!gallery.children.length)
          gallery.append(el("p", "Bu albüme henüz fotoğraf eklenmedi."));
      }
      document.title = `${project.title} | ACPhotos`;
    }
  }
  const postsNode = document.querySelector("[data-public-posts]");
  const postNode = document.querySelector("[data-dynamic-post]");
  if (postsNode || postNode) {
    const posts = await list("journal_posts");
    if (postsNode && posts.length) {
      postsNode.replaceChildren(
        ...posts.map((p) => {
          const a = link(
            "",
            `/blog/goruntule/?slug=${encodeURIComponent(p.slug)}`,
          );
          a.append(el("h2", p.title));
          return a;
        }),
      );
    }
    if (postNode) {
      const post = posts.find(
        (p) =>
          p.slug ===
          ((postNode as HTMLElement).dataset.postSlug ??
            new URLSearchParams(location.search).get("slug")),
      );
      postNode.querySelector("[data-post-title]")!.textContent =
        post?.title ?? "Yazı bulunamadı.";
      postNode.querySelector("[data-post-body]")!.textContent =
        post?.body ?? "Bu yazı yayında değil veya kaldırılmış.";
    }
  }
}
render().catch((error) => {
  document.querySelector(".loading")?.remove();
  const notice = el(
    "p",
    `${message(error)} Sayfayı yenileyerek tekrar deneyin.`,
    "error wrap",
  );
  notice.setAttribute("role", "alert");
  document.querySelector("main")?.prepend(notice);
});
window.addEventListener("pagehide", () => {
  imageObserver.disconnect();
  releaseImages();
});
