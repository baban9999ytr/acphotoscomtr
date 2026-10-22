import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  schemas,
  demoMode,
  type Table,
  type Rows,
  type Content,
  type Photo,
} from "./model";
import { fixtures } from "./fixtures";
import { contentConfig } from "./model";
let client: SupabaseClient | undefined;
export function supabase() {
  if (client) return client;
  if (
    contentConfig.mode !== "supabase" ||
    !contentConfig.url ||
    !contentConfig.key
  )
    throw Error("Supabase bağlantısı güvenli biçimde yapılandırılmamış.");
  return (client = createClient(contentConfig.url, contentConfig.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }));
}
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("acphotos-demo-v1", 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore("content");
      r.result.createObjectStore("files");
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () =>
      reject(
        Error("Yerel depolama açılamadı. Tarayıcı izinlerini kontrol edin."),
      );
  });
}
async function readLocal(): Promise<Content> {
  const db = await database();
  return new Promise((resolve, reject) => {
    let result: Content | undefined;
    const tx = db.transaction("content", "readwrite");
    const store = tx.objectStore("content");
    const r = store.get("main");
    r.onsuccess = () => {
      const stored = r.result as
        (Content & { _demoSeedVersion?: number }) | undefined;
      const data: Content = stored ?? structuredClone(fixtures);
      if ((stored?._demoSeedVersion ?? 0) < 2) {
        const firstSettings = data.site_settings?.[0] as
          (Rows["site_settings"] & Record<string, unknown>) | undefined;
        if (
          firstSettings &&
          !Object.hasOwn(firstSettings, "photographer_name")
        ) {
          data.site_settings = [
            {
              ...firstSettings,
              about: fixtures.site_settings[0]!.about,
              photographer_name: fixtures.site_settings[0]!.photographer_name,
              photographer_bio: fixtures.site_settings[0]!.photographer_bio,
              phone: fixtures.site_settings[0]!.phone,
              email: fixtures.site_settings[0]!.email,
              instagram: fixtures.site_settings[0]!.instagram,
            },
          ];
          data.projects = data.projects.map((project) => {
            const refreshed = fixtures.projects.find(
              (row) => row.id === project.id,
            );
            return refreshed
              ? {
                  ...project,
                  title: refreshed.title,
                  description: refreshed.description,
                  category_id: refreshed.category_id,
                }
              : project;
          });
          data.project_images = data.project_images.map((photo) => {
            const refreshed = fixtures.project_images.find(
              (row) => row.id === photo.id,
            );
            return refreshed ? { ...photo, alt: refreshed.alt } : photo;
          });
          const knownCategories = new Set(data.categories.map((row) => row.id));
          data.categories = data.categories.map((category) => {
            const refreshed = fixtures.categories.find(
              (row) => row.id === category.id,
            );
            return refreshed
              ? { ...category, name: refreshed.name, slug: refreshed.slug }
              : category;
          });
          data.categories.push(
            ...fixtures.categories.filter(
              (row) => !knownCategories.has(row.id),
            ),
          );
        }
        const demoCategoryIds = new Set(
          fixtures.categories.map((row) => row.id),
        );
        data.categories = data.categories.filter(
          (category) =>
            !(category.id.endsWith("000000000001") && category.name === "Spor"),
        );
        for (const category of fixtures.categories) {
          const existing = data.categories.find(
            (row) => row.id === category.id,
          );
          if (existing && demoCategoryIds.has(existing.id))
            Object.assign(existing, {
              name: category.name,
              slug: category.slug,
            });
          else if (!existing) data.categories.push(category);
        }
        for (const project of fixtures.projects) {
          const existing = data.projects.find((row) => row.id === project.id);
          if (!existing) data.projects.push(project);
          else if (existing.title.startsWith("Örnek albüm:"))
            Object.assign(existing, {
              title: project.title,
              slug: project.slug,
              description: project.description,
              category_id: project.category_id,
              featured: project.featured,
            });
        }
        for (const photo of fixtures.project_images) {
          const existing = data.project_images.find(
            (row) => row.id === photo.id,
          );
          if (!existing) data.project_images.push(photo);
          else if (
            existing.paths.some((path) => /^\/demo\/photo-\d+-/.test(path))
          )
            Object.assign(existing, photo, { deleting: existing.deleting });
        }
        const storedSettings = data.site_settings[0];
        if (
          storedSettings?.about.startsWith(
            "Arşiv başlıkları arasında Gebzespor,",
          )
        )
          storedSettings.about = fixtures.site_settings[0]!.about;
        if (
          storedSettings?.photographer_bio.startsWith(
            "18 yaşındaki fotoğrafçı Arda Cesurtürk;",
          )
        )
          storedSettings.photographer_bio =
            fixtures.site_settings[0]!.photographer_bio;
        (data as Content & { _demoSeedVersion: number })._demoSeedVersion = 2;
        store.put(data, "main");
      }
      result = data;
    };
    r.onerror = () => reject(r.error);
    tx.oncomplete = () => {
      db.close();
      if (result) resolve(result);
      else reject(Error("Yerel içerik okunamadı."));
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
async function mutateLocal(change: (data: Content) => void) {
  const db = await database();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("content", "readwrite");
    const s = tx.objectStore("content");
    const r = s.get("main");
    r.onsuccess = () => {
      const data: Content = r.result ?? structuredClone(fixtures);
      try {
        change(data);
        s.put(data, "main");
      } catch (e) {
        tx.abort();
        reject(e);
      }
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(Error("Kaydedilemedi. Tarayıcı depolama alanını kontrol edin."));
    };
  });
}
async function fileStore(
  action: "put" | "get" | "delete",
  path: string,
  blob?: Blob,
): Promise<Blob | undefined> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      "files",
      action === "get" ? "readonly" : "readwrite",
    );
    const s = tx.objectStore("files");
    const r =
      action === "put"
        ? s.put(blob, path)
        : action === "get"
          ? s.get(path)
          : s.delete(path);
    let result: Blob | undefined;
    r.onsuccess = () => {
      result = action === "get" ? r.result : undefined;
    };
    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onerror = () => {
      db.close();
      reject(Error("Fotoğraf depolama işlemi başarısız."));
    };
  });
}
export async function list<K extends Table>(
  table: K,
  admin = false,
): Promise<Rows[K][]> {
  let raw: unknown[];
  if (demoMode) {
    const data = await readLocal();
    raw = data[table];
    if (!admin) {
      if (table === "projects" || table === "journal_posts")
        raw = raw.filter((r) => (r as Rows["projects"]).status === "published");
      if (table === "project_images")
        raw = data.project_images.filter(
          (i) =>
            !i.deleting &&
            data.projects.some(
              (p) => p.id === i.project_id && p.status === "published",
            ),
        );
    }
  } else {
    try {
      let query = supabase()
        .from(table)
        .select(
          !admin && table === "project_images"
            ? "*, projects!inner(status)"
            : "*",
        )
        .order(table === "site_settings" ? "id" : "sort_order");
      if (!admin && (table === "projects" || table === "journal_posts"))
        query = query.eq("status", "published");
      if (!admin && table === "project_images")
        query = query.eq("projects.status", "published").eq("deleting", false);
      const { data, error } = await query;
      if (error)
        throw Error(
          "İçerik alınamadı. Bağlantınızı ve erişim izninizi kontrol edin.",
        );
      raw = data ?? [];
      if (!admin)
        window.dispatchEvent(new CustomEvent("acphotos:content-live"));
    } catch (error) {
      if (admin) throw error;
      if (import.meta.env.DEV)
        console.warn(
          "ACPhotos public content read failed; rendering marked demo fixtures.",
          error,
        );
      const data = structuredClone(fixtures);
      raw = data[table];
      if (table === "projects" || table === "journal_posts")
        raw = raw.filter((r) => (r as Rows["projects"]).status === "published");
      if (table === "project_images")
        raw = data.project_images.filter((i) =>
          data.projects.some(
            (p) => p.id === i.project_id && p.status === "published",
          ),
        );
      window.dispatchEvent(new CustomEvent("acphotos:preview-fallback"));
    }
  }
  return raw
    .map((r) => schemas[table].parse(r) as Rows[K])
    .sort((a, b) =>
      "sort_order" in a && "sort_order" in b
        ? Number(a.sort_order) - Number(b.sort_order)
        : 0,
    );
}
export async function save<K extends Table>(table: K, value: Rows[K]) {
  const row = schemas[table].parse(value) as Rows[K];
  if (demoMode) {
    await mutateLocal((data) => {
      const rows = data[table] as Rows[K][];
      if (
        "slug" in row &&
        rows.some((r) => r.id !== row.id && "slug" in r && r.slug === row.slug)
      )
        throw Error("Bu bağlantı adı zaten kullanılıyor.");
      const i = rows.findIndex((r) => r.id === row.id);
      if (i < 0) rows.push(row);
      else rows[i] = row;
    });
  } else {
    const { error, data } = await supabase()
      .from(table)
      .upsert(row)
      .select("id");
    if (error || !data?.length)
      throw Error(
        "Kaydedilemedi. Bağlantı adı, erişim yetkisi ve bağlantınızı kontrol edin.",
      );
  }
}
export async function remove(table: Table, id: string) {
  if (table === "projects") {
    const images = (await list("project_images", true)).filter(
      (i) => i.project_id === id,
    );
    if (images.length)
      throw Error(
        "Önce albümdeki fotoğrafları silin veya başka albüme taşıyın.",
      );
  }
  if (table === "project_images") {
    await deletePhoto(
      (await list("project_images", true)).find((i) => i.id === id)!,
    );
    return;
  }
  if (demoMode)
    await mutateLocal((data) => {
      if (
        table === "categories" &&
        data.projects.some((p) => p.category_id === id)
      )
        throw Error("Bu kategori bir albümde kullanılıyor.");
      (data[table] as { id: string }[]) = data[table].filter(
        (r) => r.id !== id,
      );
    });
  else {
    const { error, data } = await supabase()
      .from(table)
      .delete()
      .eq("id", id)
      .select("id");
    if (error || !data?.length)
      throw Error(
        "Silinemedi. Kullanılan kayıtları ve yetkinizi kontrol edin.",
      );
  }
}
export async function isAdmin() {
  if (demoMode) return sessionStorage.getItem("acphotos-demo-admin") === "yes";
  const {
    data: { user },
    error,
  } = await supabase().auth.getUser();
  if (error || !user) return false;
  const { data, error: err } = await supabase()
    .from("authorized_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return !err && !!data;
}
export async function login(email: string, password: string) {
  const { error } = await supabase().auth.signInWithPassword({
    email,
    password,
  });
  if (error)
    throw Error("Giriş yapılamadı. E-posta ve şifrenizi kontrol edin.");
  if (!(await isAdmin())) {
    await supabase().auth.signOut();
    throw Error("Bu hesabın yönetim yetkisi bulunmuyor.");
  }
}
export async function logout() {
  if (demoMode) sessionStorage.removeItem("acphotos-demo-admin");
  else {
    const { error } = await supabase().auth.signOut();
    if (error) throw Error("Çıkış yapılamadı. Yeniden deneyin.");
  }
}
export async function storeFile(path: string, blob: Blob) {
  if (demoMode) await fileStore("put", path, blob);
  else {
    const { error } = await supabase()
      .storage.from("photographs")
      .upload(path, blob, {
        contentType: "image/webp",
        upsert: false,
        cacheControl: "0",
      });
    if (error)
      throw Error(
        "Fotoğraf yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.",
      );
  }
}
export async function deleteFiles(paths: string[]) {
  if (demoMode) {
    for (const p of paths)
      if (!p.startsWith("/demo/")) await fileStore("delete", p);
  } else {
    const { error } = await supabase()
      .storage.from("photographs")
      .remove(paths);
    if (error)
      throw Error(
        "Depolama temizliği tamamlanamadı. Fotoğrafı yeniden silmeyi deneyin.",
      );
  }
}
const urls = new Map<string, string>();
export async function imageUrl(path: string) {
  if (path.startsWith("/demo/")) {
    if (!demoMode) throw Error("Örnek görsel üretimde kullanılamaz.");
    return path;
  }
  if (urls.has(path)) return urls.get(path)!;
  let blob: Blob | undefined;
  if (demoMode) blob = await fileStore("get", path);
  else {
    const { data, error } = await supabase()
      .storage.from("photographs")
      .download(path);
    if (error) throw Error("Fotoğraf görüntülenemiyor.");
    blob = data;
  }
  if (!blob) throw Error("Fotoğraf dosyası bulunamadı.");
  const url = URL.createObjectURL(blob);
  urls.set(path, url);
  return url;
}
export function releaseImages() {
  for (const url of urls.values()) URL.revokeObjectURL(url);
  urls.clear();
}
export async function deletePhoto(photo: Photo) {
  if (!photo) throw Error("Fotoğraf bulunamadı.");
  await save("project_images", { ...photo, deleting: true });
  await deleteFiles(photo.paths);
  if (demoMode)
    await mutateLocal((d) => {
      d.project_images = d.project_images.filter((i) => i.id !== photo.id);
    });
  else {
    const { error, data } = await supabase()
      .from("project_images")
      .delete()
      .eq("id", photo.id)
      .select("id");
    if (error || !data?.length)
      throw Error(
        "Dosya silindi ancak kayıt silinemedi. İşlemi yeniden deneyin.",
      );
  }
}
export async function cover(photo: Photo) {
  if (demoMode)
    await mutateLocal((d) => {
      d.project_images.forEach((i) => {
        if (i.project_id === photo.project_id) i.is_cover = i.id === photo.id;
      });
    });
  else {
    const { error } = await supabase().rpc("set_cover", { image_id: photo.id });
    if (error) throw Error("Kapak değiştirilemedi.");
  }
}
export async function reorderImages(ids: string[]) {
  if (demoMode)
    await mutateLocal((d) => {
      ids.forEach((id, i) => {
        const p = d.project_images.find((x) => x.id === id);
        if (p) p.sort_order = i;
      });
    });
  else {
    const { error } = await supabase().rpc("reorder_images", {
      image_ids: ids,
    });
    if (error) throw Error("Sıralama kaydedilemedi.");
  }
}
export async function resetDemo() {
  if (!demoMode) return;
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["content", "files"], "readwrite");
    tx.objectStore("content").clear();
    tx.objectStore("files").clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  releaseImages();
}
export async function reorderProjects(ids: string[]) {
  if (demoMode)
    await mutateLocal((d) => {
      ids.forEach((id, index) => {
        const p = d.projects.find((p) => p.id === id);
        if (p) p.sort_order = index;
      });
    });
  else {
    const { error } = await supabase().rpc("reorder_projects", {
      project_ids: ids,
    });
    if (error) throw Error("Albüm sırası kaydedilemedi.");
  }
}
