import { uid, type Photo } from "./model";
import { list, save, storeFile, deleteFiles } from "./repository";
export async function optimize(file: File): Promise<{
  blobs: Blob[];
  width: number;
  height: number;
  fingerprint: string;
}> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw Error("Yalnızca JPEG, PNG ve WebP yüklenebilir.");
  if (file.size > 20 * 1024 * 1024)
    throw Error("Fotoğraf en fazla 20 MB olabilir.");
  const bytes = await file.arrayBuffer();
  const signature = new Uint8Array(bytes);
  const valid =
    (signature[0] === 0xff && signature[1] === 0xd8) ||
    (signature[0] === 0x89 && signature[1] === 0x50) ||
    (new TextDecoder().decode(signature.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(signature.slice(8, 12)) === "WEBP");
  if (!valid) throw Error("Dosyanın içeriği desteklenen bir fotoğraf değil.");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw Error("Fotoğraf okunamadı. Başka bir dosya seçin.");
  });
  try {
    if (bitmap.width * bitmap.height > 60_000_000)
      throw Error("Fotoğraf en fazla 60 megapiksel olabilir.");
    const blobs: Blob[] = [];
    for (const max of [480, 1000, 1800]) {
      const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw Error("Tarayıcı görsel işlemeyi desteklemiyor.");
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(Error("Görsel dönüştürülemedi."))),
          "image/webp",
          0.84,
        ),
      );
      if (blob.type !== "image/webp")
        throw Error("Tarayıcı WebP dönüştürmeyi desteklemiyor.");
      blobs.push(blob);
    }
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return {
      blobs,
      width: bitmap.width,
      height: bitmap.height,
      fingerprint: Array.from(new Uint8Array(hash), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join(""),
    };
  } finally {
    bitmap.close();
  }
}
export async function uploadPhoto(
  file: File,
  project_id: string,
  progress: (value: number) => void,
) {
  progress(5);
  const optimized = await optimize(file);
  const existing = await list("project_images", true);
  if (
    existing.some(
      (i) =>
        i.project_id === project_id && i.fingerprint === optimized.fingerprint,
    )
  )
    throw Error("Bu fotoğraf albümde zaten bulunuyor.");
  const id = uid();
  const paths = [480, 1000, 1800].map((w) => `${project_id}/${id}/${w}.webp`);
  const uploaded: string[] = [];
  try {
    for (const [i, blob] of optimized.blobs.entries()) {
      await storeFile(paths[i]!, blob);
      uploaded.push(paths[i]!);
      progress(20 + (i + 1) * 20);
    }
    const photo: Photo = {
      id,
      project_id,
      paths,
      alt: file.name.replace(/\.[^.]+$/, "").slice(0, 160) || "Fotoğraf",
      width: optimized.width,
      height: optimized.height,
      sort_order:
        Math.max(
          -1,
          ...existing
            .filter((p) => p.project_id === project_id)
            .map((p) => p.sort_order),
        ) + 1,
      is_cover: false,
      deleting: false,
      fingerprint: optimized.fingerprint,
    };
    await save("project_images", photo);
    progress(100);
  } catch (e) {
    // A lost response does not mean the database transaction failed.
    // Never delete files belonging to a possibly committed metadata record.
    if (uploaded.length === 3) {
      let persisted: Photo[];
      try {
        persisted = await list("project_images", true);
      } catch {
        throw Error(
          "Yükleme sonucu doğrulanamadı. Bağlantı gelince albümü kontrol edin; dosyalar güvenlik için korundu.",
        );
      }
      if (persisted.some((photo) => photo.id === id)) {
        progress(100);
        return;
      }
    }
    try {
      await deleteFiles(uploaded);
    } catch {
      throw Error(
        "Yükleme tamamlanamadı ve dosyalar temizlenemedi. Depolama uzlaştırma kılavuzunu uygulayın.",
      );
    }
    throw e;
  }
}
