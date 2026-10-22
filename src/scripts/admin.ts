import { contentConfig, demoMode, uid, type Rows } from "../lib/model";
import * as repo from "../lib/repository";
import { uploadPhoto } from "../lib/uploads";
import { el, button, link, message } from "../lib/dom";
const root = document.querySelector<HTMLElement>("#admin-root")!;
let section = "Genel Bakış";
let view: HTMLElement;
let feedback: HTMLElement;
let selectedAlbum = "";
function notify(text: string, error = false) {
  feedback.textContent = text;
  feedback.className = `status ${error ? "error" : "success"}`;
  feedback.setAttribute("role", error ? "alert" : "status");
}
async function run(action: () => Promise<void>) {
  try {
    await action();
  } catch (e) {
    notify(message(e), true);
  }
}
async function confirmAction(text: string) {
  return new Promise<boolean>((resolve) => {
    const d = el("dialog");
    d.setAttribute("aria-label", "İşlemi onaylayın");
    d.append(el("h2", "Emin misiniz?"), el("p", text));
    const controls = el("div", undefined, "form-actions");
    controls.append(
      button("Vazgeç", () => d.close()),
      button(
        "Onayla",
        () => {
          d.returnValue = "yes";
          d.close();
        },
        "danger",
      ),
    );
    d.append(controls);
    document.body.append(d);
    d.addEventListener(
      "close",
      () => {
        resolve(d.returnValue === "yes");
        d.remove();
      },
      { once: true },
    );
    d.showModal();
  });
}
function field(
  form: HTMLElement,
  label: string,
  name: string,
  value: string,
  type = "text",
  required = false,
) {
  const l = el("label", label);
  const input = type === "textarea" ? el("textarea") : el("input");
  input.name = name;
  input.value = value;
  input.required = required;
  if (input instanceof HTMLInputElement) input.type = type;
  input.maxLength =
    name === "body"
      ? 50000
      : name === "description" ||
          name === "about" ||
          name === "photographer_bio"
        ? 5000
        : 500;
  l.append(input);
  form.append(l);
  return input;
}
function select(
  form: HTMLElement,
  label: string,
  name: string,
  options: { value: string; label: string }[],
  value: string,
) {
  const l = el("label", label);
  const s = el("select");
  s.name = name;
  for (const o of options) {
    const option = el("option", o.label);
    option.value = o.value;
    s.append(option);
  }
  s.value = value;
  l.append(s);
  form.append(l);
  return s;
}
function checkbox(
  form: HTMLElement,
  label: string,
  name: string,
  checked: boolean,
) {
  const l = el("label", label);
  const i = el("input");
  i.type = "checkbox";
  i.name = name;
  i.checked = checked;
  l.append(i);
  form.append(l);
  return i;
}
function submit(
  form: HTMLFormElement,
  action: (data: FormData) => Promise<void>,
) {
  const b = el("button", "Kaydet", "primary");
  b.type = "submit";
  form.append(b);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    b.disabled = true;
    b.textContent = "Kaydediliyor…";
    try {
      await action(new FormData(form));
      notify("Değişiklikler kaydedildi.");
    } catch (error) {
      notify(message(error), true);
    } finally {
      b.disabled = false;
      b.textContent = "Kaydet";
    }
  });
}
async function loginScreen() {
  root.replaceChildren();
  const box = el("section", undefined, "login");
  box.append(el("h1", "Yönetim paneli"));
  box.append(
    el(
      "span",
      demoMode ? "Demo Modu" : "Canlı Yönetim",
      `admin-mode-indicator${demoMode ? " is-demo" : ""}`,
    ),
  );
  feedback = el("p", undefined, "status");
  feedback.setAttribute("aria-live", "polite");
  if (demoMode) {
    box.append(
      el(
        "p",
        "Yerel demo. Değişiklikler yalnızca bu tarayıcıda saklanır. Bu alan gerçek bir kimlik doğrulama sistemi değildir.",
      ),
      button(
        "Demoyu aç",
        async () => {
          sessionStorage.setItem("acphotos-demo-admin", "yes");
          await shell();
        },
        "primary",
      ),
    );
  } else {
    if (contentConfig.mode === "local")
      box.append(
        el(
          "p",
          `Canlı içerik kaynağı kullanılamıyor. Yönetim oturumu ve kayıt işlemleri etkin değil.${contentConfig.reason ? ` Tanılama: ${contentConfig.reason}` : ""}`,
          "preview-notice",
        ),
      );
    const form = el("form");
    field(form, "E-posta", "email", "", "email", true);
    const pass = field(form, "Şifre", "password", "", "password", true);
    pass.autocomplete = "current-password";
    const b = el("button", "Giriş yap", "primary");
    b.type = "submit";
    form.append(b);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      b.disabled = true;
      try {
        const data = new FormData(form);
        await repo.login(
          String(data.get("email")),
          String(data.get("password")),
        );
        await shell();
      } catch (err) {
        notify(message(err), true);
      } finally {
        b.disabled = false;
      }
    });
    box.append(
      el("p", "Yalnızca yetkilendirilmiş hesaplar giriş yapabilir."),
      form,
    );
  }
  box.append(feedback);
  root.append(box);
}
async function shell() {
  root.replaceChildren();
  const layout = el("div", undefined, "admin-layout wrap");
  const nav = el("nav", undefined, "admin-nav");
  nav.setAttribute("aria-label", "Yönetim bölümleri");
  view = el("section", undefined, "admin-content");
  feedback = el("p", undefined, "status");
  feedback.setAttribute("aria-live", "polite");
  for (const name of [
    "Genel Bakış",
    "Albümler",
    "Fotoğraflar",
    "Kategoriler",
    "Ana Sayfa",
    "Blog",
    "Site Ayarları",
  ]) {
    const b = button(name, async () => {
      section = name;
      nav
        .querySelectorAll("button")
        .forEach((x) => x.setAttribute("aria-current", String(x === b)));
      await run(render);
    });
    b.setAttribute("aria-current", String(section === name));
    nav.append(b);
  }
  nav.append(
    link("Siteyi görüntüle", "/"),
    button("Çıkış yap", () =>
      run(async () => {
        await repo.logout();
        await loginScreen();
      }),
    ),
  );
  const content = el("div");
  const notice = el(
    "p",
    demoMode
      ? "Demo Modu · Bu tarayıcıdaki değişiklikler ziyaretçi görünümüne yansır. Gerçek sunucuya veri gönderilmez."
      : "Canlı içerik · Yayınlama ve yayından kaldırma, ziyaretçilerin bir sonraki sayfa yüklemesine yansır.",
    `admin-notice${demoMode ? " is-demo" : ""}`,
  );
  content.append(notice, feedback, view);
  layout.append(nav, content);
  root.append(layout);
  await run(render);
}
async function render() {
  view.replaceChildren(el("h1", section));
  if (section === "Genel Bakış") {
    const [projects, photos] = await Promise.all([
      repo.list("projects", true),
      repo.list("project_images", true),
    ]);
    const stats = el("div", undefined, "admin-grid");
    for (const [name, value] of [
      ["Toplam albüm", projects.length],
      ["Toplam fotoğraf", photos.length],
      [
        "Yayındaki albümler",
        projects.filter((p) => p.status === "published").length,
      ],
      ["Taslaklar", projects.filter((p) => p.status === "draft").length],
    ]) {
      const n = el("div", undefined, "stat");
      n.append(el("strong", String(value)), el("p", String(name)));
      stats.append(n);
    }
    view.append(stats);
    if (demoMode)
      view.append(
        button("Demo verilerini sıfırla", () =>
          run(async () => {
            if (
              await confirmAction(
                "Bu tarayıcıdaki tüm demo değişiklikleri ve yüklenen fotoğraflar silinecek.",
              )
            ) {
              await repo.resetDemo();
              await render();
              notify("Demo sıfırlandı.");
            }
          }),
        ),
      );
    return;
  }
  if (section === "Fotoğraflar") {
    await photos();
    return;
  }
  if (section === "Ana Sayfa" || section === "Site Ayarları") {
    await settings();
    return;
  }
  const table =
    section === "Albümler"
      ? "projects"
      : section === "Kategoriler"
        ? "categories"
        : "journal_posts";
  const rows = await repo.list(table, true);
  view.append(
    button(
      section === "Albümler"
        ? "Albüm oluştur"
        : section === "Kategoriler"
          ? "Kategori ekle"
          : "Yeni yazı",
      () => run(() => editor(table)),
      "primary",
    ),
  );
  if (!rows.length)
    view.append(el("p", "Henüz kayıt yok. İlk kaydı ekleyin.", "empty"));
  for (const [index, row] of rows.entries()) {
    const line = el("div", undefined, "admin-row");
    const info = el("div");
    info.append(el("h2", "name" in row ? row.name : row.title));
    info.append(
      el(
        "small",
        "status" in row
          ? row.status === "published"
            ? "Yayında"
            : "Taslak"
          : row.slug,
      ),
    );
    const actions = el("div", undefined, "admin-row-actions");
    actions.append(
      button("Düzenle", () => run(() => editor(table, row))),
      button(
        "Sil",
        () =>
          run(async () => {
            if (await confirmAction("Bu kayıt kalıcı olarak silinecek.")) {
              await repo.remove(table, row.id);
              await render();
              notify("Kayıt silindi.");
            }
          }),
        "danger",
      ),
    );
    if ("status" in row)
      actions.append(
        button(row.status === "published" ? "Yayından kaldır" : "Yayınla", () =>
          run(async () => {
            if (
              await confirmAction(
                row.status === "published"
                  ? "İçerik ziyaretçilerden gizlenecek."
                  : "İçerik ziyaretçilere açılacak.",
              )
            ) {
              await repo.save(table, {
                ...row,
                status: row.status === "published" ? "draft" : "published",
              });
              await render();
              notify("Yayın durumu güncellendi.");
            }
          }),
        ),
      );
    if (table === "projects") {
      actions.append(
        button("Fotoğraflar", async () => {
          selectedAlbum = row.id;
          section = "Fotoğraflar";
          await run(render);
        }),
      );
      if (index > 0)
        actions.append(
          button("Yukarı taşı", () =>
            run(async () => {
              const ids = rows.map((p) => p.id);
              [ids[index - 1], ids[index]] = [ids[index]!, ids[index - 1]!];
              await repo.reorderProjects(ids);
              await render();
              notify("Albüm sırası güncellendi.");
            }),
          ),
        );
    }
    line.append(info, actions);
    view.append(line);
  }
}
type Editable = "projects" | "categories" | "journal_posts";
async function editor(table: Editable, row?: Rows[Editable]) {
  view.replaceChildren(el("h1", row ? "Kaydı düzenle" : "Yeni kayıt"));
  const form = el("form", undefined, "editor");
  field(
    form,
    table === "categories" ? "Kategori adı" : "Başlık",
    "title",
    row ? ("name" in row ? row.name : row.title) : "",
    "text",
    true,
  );
  field(
    form,
    "Bağlantı adı (ör. sessiz-zirveler)",
    "slug",
    row?.slug ?? "",
    "text",
    true,
  );
  if (table === "projects") {
    const p = row as Rows["projects"] | undefined;
    field(form, "Açıklama", "description", p?.description ?? "", "textarea");
    const cats = await repo.list("categories", true);
    select(
      form,
      "Kategori",
      "category_id",
      [
        { value: "", label: "Kategori yok" },
        ...cats.map((c) => ({ value: c.id, label: c.name })),
      ],
      p?.category_id ?? "",
    );
    field(form, "Yıl (isteğe bağlı)", "year", p?.year ?? "");
    field(form, "Konum (isteğe bağlı)", "location", p?.location ?? "");
    checkbox(form, "Ana sayfada öne çıkar", "featured", p?.featured ?? false);
  }
  if (table === "journal_posts")
    field(
      form,
      "Yazı metni (düz metin)",
      "body",
      (row as Rows["journal_posts"] | undefined)?.body ?? "",
      "textarea",
      true,
    );
  submit(form, async (data) => {
    const base = {
      id: row?.id ?? uid(),
      slug: String(data.get("slug")),
      sort_order: row?.sort_order ?? (await repo.list(table, true)).length,
    };
    if (table === "categories")
      await repo.save(table, { ...base, name: String(data.get("title")) });
    if (table === "projects")
      await repo.save(table, {
        ...base,
        title: String(data.get("title")),
        description: String(data.get("description")),
        category_id: String(data.get("category_id")) || null,
        featured: data.get("featured") === "on",
        year: String(data.get("year")),
        location: String(data.get("location")),
        status: (row as Rows["projects"] | undefined)?.status ?? "draft",
      });
    if (table === "journal_posts")
      await repo.save(table, {
        ...base,
        title: String(data.get("title")),
        body: String(data.get("body")),
        status: (row as Rows["journal_posts"] | undefined)?.status ?? "draft",
      });
    await render();
  });
  form.append(button("Vazgeç", () => run(render)));
  view.append(form);
}
async function settings() {
  const current = (await repo.list("site_settings", true))[0];
  if (!current)
    throw Error(
      "Site ayarları bulunamadı. Veritabanı başlangıç kaydını kontrol edin.",
    );
  const form = el("form", undefined, "editor");
  if (section === "Ana Sayfa") {
    field(
      form,
      "Hero başlığı",
      "hero_title",
      current.hero_title,
      "textarea",
      true,
    );
    field(
      form,
      "Hero açıklaması",
      "hero_description",
      current.hero_description,
      "textarea",
    );
    const photos = await repo.list("project_images", true);
    select(
      form,
      "Hero fotoğrafı (yayındaki albümden)",
      "hero_image_id",
      [
        { value: "", label: "Varsayılan / fotoğraf yok" },
        ...photos.map((p) => ({ value: p.id, label: p.alt })),
      ],
      current.hero_image_id,
    );
    form.append(
      el("p", "Öne çıkan albümleri Albümler bölümünden seçebilirsiniz."),
    );
  } else {
    field(form, "Metin logosu", "logo_text", current.logo_text, "text", true);
    field(
      form,
      "Fotoğrafçı adı",
      "photographer_name",
      current.photographer_name,
      "text",
      true,
    );
    field(
      form,
      "Fotoğrafçı tanıtımı",
      "photographer_bio",
      current.photographer_bio,
      "textarea",
    );
    field(form, "Hakkımızda", "about", current.about, "textarea");
    field(
      form,
      "Telefon (uluslararası, ör. +90…)",
      "phone",
      current.phone,
      "tel",
    );
    field(form, "E-posta", "email", current.email, "email");
    field(
      form,
      "Instagram profil adresi",
      "instagram",
      current.instagram,
      "url",
    );
    field(
      form,
      "SEO açıklaması",
      "seo_description",
      current.seo_description,
      "textarea",
    );
    form.append(
      el(
        "p",
        "Yalnızca doğrulanmış iletişim bilgilerini girin. SEO açıklamasının statik sayfalara işlenmesi için yeniden derleme gerekir.",
      ),
    );
  }
  submit(form, async (data) => {
    await repo.save("site_settings", {
      ...current,
      ...Object.fromEntries(data),
    });
    await render();
  });
  view.append(form);
}
async function photos() {
  const projects = await repo.list("projects", true);
  if (!projects.length) {
    view.append(el("p", "Fotoğraf yüklemek için önce bir albüm oluşturun."));
    return;
  }
  if (!projects.some((p) => p.id === selectedAlbum))
    selectedAlbum = projects[0]!.id;
  const selector = select(
    view,
    "Albüm",
    "album",
    projects.map((p) => ({ value: p.id, label: p.title })),
    selectedAlbum,
  );
  selector.addEventListener("change", () => {
    selectedAlbum = selector.value;
    void run(render);
  });
  const uploadLabel = el(
    "label",
    "Fotoğraf yükle · JPEG, PNG, WebP · En fazla 20 MB / 60 MP",
    "upload-label",
  );
  const input = el("input");
  input.type = "file";
  input.accept = "image/jpeg,image/png,image/webp";
  input.multiple = true;
  input.className = "visually-hidden";
  uploadLabel.append(input, el("span", "Fotoğraf seç", "file-picker"));
  view.append(uploadLabel);
  const queue = el("div");
  view.append(queue);
  input.addEventListener("change", async () => {
    const files = Array.from(input.files ?? []);
    input.disabled = true;
    selector.disabled = true;
    const album = selectedAlbum;
    for (const file of files) {
      const row = el("div", undefined, "upload-row");
      const label = el("p", `${file.name} hazırlanıyor…`);
      const bar = el("progress");
      bar.max = 100;
      bar.value = 0;
      bar.setAttribute("aria-label", `${file.name} yükleme aşaması`);
      row.append(label, bar);
      queue.append(row);
      const perform = async () => {
        try {
          await uploadPhoto(file, album, (v) => (bar.value = v));
          label.textContent = `${file.name} yüklendi`;
          row.querySelector("button")?.remove();
        } catch (e) {
          label.textContent = `${file.name}: ${message(e)}`;
          if (!row.querySelector("button"))
            row.append(button("Yeniden dene", perform));
        }
      };
      await perform();
    }
    input.disabled = false;
    selector.disabled = false;
    input.value = "";
    await renderPhotoGrid();
  });
  await renderPhotoGrid();
}
async function renderPhotoGrid() {
  view.querySelector(".photo-admin-grid")?.remove();
  const all = (await repo.list("project_images", true)).filter(
    (p) => p.project_id === selectedAlbum,
  );
  const projects = await repo.list("projects", true);
  const grid = el("div", undefined, "photo-admin-grid");
  for (const [index, photo] of all.entries()) {
    const box = el("div", undefined, "photo-admin");
    const img = el("img");
    img.alt = photo.alt;
    repo
      .imageUrl(photo.paths[0]!)
      .then((url) => (img.src = url))
      .catch(() => {
        img.alt = "Dosya bulunamadı; silme işlemini yeniden deneyin.";
      });
    box.append(img);
    const form = el("form");
    field(form, "Alternatif metin", "alt", photo.alt, "text", true);
    select(
      form,
      "Albüm",
      "project_id",
      projects.map((p) => ({ value: p.id, label: p.title })),
      photo.project_id,
    );
    submit(form, async (data) => {
      await repo.save("project_images", {
        ...photo,
        alt: String(data.get("alt")),
        project_id: String(data.get("project_id")),
        is_cover:
          String(data.get("project_id")) === photo.project_id
            ? photo.is_cover
            : false,
      });
      await renderPhotoGrid();
    });
    box.append(form);
    const actions = el("div", undefined, "form-actions");
    actions.append(
      button(photo.is_cover ? "Kapak fotoğrafı" : "Kapak yap", () =>
        run(async () => {
          await repo.cover(photo);
          await renderPhotoGrid();
          notify("Kapak güncellendi.");
        }),
      ),
      button(
        "Sil",
        () =>
          run(async () => {
            if (
              await confirmAction(
                "Fotoğraf ve tüm boyutları kalıcı olarak silinecek.",
              )
            ) {
              await repo.deletePhoto(photo);
              await renderPhotoGrid();
              notify("Fotoğraf silindi.");
            }
          }),
        "danger",
      ),
    );
    for (const [text, offset] of [
      ["Öne taşı", -1],
      ["Arkaya taşı", 1],
    ] as const) {
      const b = button(text, () =>
        run(async () => {
          const ids = all.map((p) => p.id);
          const other = index + offset;
          [ids[index], ids[other]] = [ids[other]!, ids[index]!];
          await repo.reorderImages(ids);
          await renderPhotoGrid();
          notify("Fotoğraf sırası kaydedildi.");
        }),
      );
      b.disabled = index + offset < 0 || index + offset >= all.length;
      actions.append(b);
    }
    box.append(actions);
    grid.append(box);
  }
  view.append(grid);
}
async function start() {
  try {
    if (await repo.isAdmin()) await shell();
    else await loginScreen();
    if (!demoMode)
      repo.supabase().auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") void loginScreen();
      });
  } catch (e) {
    await loginScreen();
    notify(message(e), true);
  }
}
void start();
