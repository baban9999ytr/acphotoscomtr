import { fixtures } from "./fixtures";
import { contentConfig, demoMode, schemas } from "./model";

let content:
  | Promise<{
      settings: (typeof fixtures.site_settings)[number];
      projects: { slug: string }[];
      posts: { slug: string }[];
    }>
  | undefined;

export function buildContent() {
  return (content ??= load());
}

async function load() {
  const local = {
    settings: fixtures.site_settings[0]!,
    projects: fixtures.projects,
    posts: [],
  };
  if (demoMode) return local;
  try {
    if (contentConfig.mode !== "supabase") return local;
    const { url, key } = contentConfig;
    async function query(path: string) {
      const response = await fetch(`${url}/rest/v1/${path}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(3500),
      });
      if (!response.ok) throw Error("Content unavailable");
      return response.json();
    }
    const [settings, projects, posts] = await Promise.all([
      query("site_settings?id=eq.main&select=*&limit=1"),
      query("projects?status=eq.published&select=slug"),
      query("journal_posts?status=eq.published&select=slug"),
    ]);
    return {
      settings: schemas.site_settings.parse(settings[0]),
      projects: projects as { slug: string }[],
      posts: posts as { slug: string }[],
    };
  } catch {
    console.warn(
      "Supabase içeriği alınamadı; yerel önizleme içerikleri kullanılıyor.",
    );
    return local;
  }
}
