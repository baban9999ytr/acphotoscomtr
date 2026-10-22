import { fixtures } from "./fixtures";
import { demoMode, schemas } from "./model";
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
  if (demoMode)
    return {
      settings: fixtures.site_settings[0]!,
      projects: fixtures.projects,
      posts: [],
    };
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw Error(
      "Production build requires PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  if (!key.startsWith("sb_publishable_")) {
    try {
      const p = JSON.parse(
        Buffer.from(key.split(".")[1]!, "base64url").toString(),
      );
      if (p.role !== "anon") throw Error("invalid");
    } catch {
      throw Error(
        "Build requires a public publishable/anon key; privileged keys are forbidden.",
      );
    }
  }
  async function query(path: string) {
    const r = await fetch(`${url}/rest/v1/${path}`, {
      headers: key.startsWith("sb_publishable_")
        ? { apikey: key }
        : { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!r.ok)
      throw Error("Published content could not be read. Build stopped.");
    return r.json();
  }
  const [settings, projects, posts] = await Promise.all([
    query("site_settings?id=eq.main&select=*"),
    query("projects?status=eq.published&select=slug"),
    query("journal_posts?status=eq.published&select=slug"),
  ]);
  return {
    settings: schemas.site_settings.parse(settings[0]),
    projects: projects as { slug: string }[],
    posts: posts as { slug: string }[],
  };
}
