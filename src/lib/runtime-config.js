/** Resolve public-only content configuration without ever throwing. */
export function resolveContentConfig({ source, legacyMode, url, key }) {
  const requested =
    source?.trim() ||
    (legacyMode?.trim() === "supabase" ? "supabase" : "local");
  if (requested === "local")
    return { mode: "local", requestedMode: "local", reason: null };
  if (requested !== "supabase")
    return {
      mode: "local",
      requestedMode: "invalid",
      reason: "PUBLIC_CONTENT_SOURCE yalnızca local veya supabase olabilir.",
    };

  const localFallback = (reason) => ({
    mode: "local",
    requestedMode: "supabase",
    reason,
  });
  const cleanUrl = url?.trim().replace(/\/+$/, "");
  const publicKey = key?.trim();
  if (!cleanUrl || !publicKey)
    return localFallback("Supabase URL veya herkese açık anahtar eksik.");
  try {
    const parsed = new URL(cleanUrl);
    const local =
      parsed.protocol === "http:" &&
      ["127.0.0.1", "localhost"].includes(parsed.hostname);
    if (
      (!local && parsed.protocol !== "https:") ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      parsed.pathname !== "/"
    )
      return localFallback("Supabase URL biçimi geçersiz.");
  } catch {
    return localFallback("Supabase URL biçimi geçersiz.");
  }
  if (
    publicKey.startsWith("sb_secret_") ||
    publicKey.startsWith("service_role")
  )
    return localFallback(
      "Gizli Supabase anahtarı tarayıcı ayarında kullanılamaz.",
    );
  if (publicKey.startsWith("sb_publishable_")) {
    if (publicKey.length < 24)
      return localFallback("Supabase yayımlanabilir anahtarı geçersiz.");
  } else {
    try {
      const payload = publicKey.split(".")[1];
      if (!payload) throw Error();
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(
        atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")),
      );
      if (decoded.role !== "anon") throw Error();
    } catch {
      return localFallback(
        "Yalnızca yayımlanabilir veya anon anahtar kullanılabilir.",
      );
    }
  }
  return {
    mode: "supabase",
    requestedMode: "supabase",
    url: cleanUrl,
    key: publicKey,
    reason: null,
  };
}

export function demoAdminEnabled(config) {
  return config.requestedMode === "local";
}

export function runtimeContentConfig() {
  return resolveContentConfig({
    source: import.meta.env?.PUBLIC_CONTENT_SOURCE,
    legacyMode: import.meta.env?.PUBLIC_CONTENT_MODE,
    url: import.meta.env?.PUBLIC_SUPABASE_URL,
    key:
      import.meta.env?.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env?.PUBLIC_SUPABASE_ANON_KEY,
  });
}
