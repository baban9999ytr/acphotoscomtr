import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
const ids = [
  "photo-1464822759023-fed622ff2c3b",
  "photo-1470770841072-f978cf4d019e",
  "photo-1475924156734-496f6cac6ec1",
  "photo-1507525428034-b723cf961d3e",
  "photo-1487958449943-2429e8be8625",
  "photo-1511818966892-d7d671e672a2",
];
await mkdir("public/demo", { recursive: true });
for (const [i, id] of ids.entries()) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&h=1200&q=85`;
  const r = await fetch(url);
  if (!r.ok) throw Error(`${id}: ${r.status}`);
  const raw = Buffer.from(await r.arrayBuffer());
  for (const width of [480, 1000, 1800])
    await sharp(raw)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(`public/demo/photo-${i + 1}-${width}.webp`);
  console.log(`Demo photo ${i + 1} optimized`);
}
await writeFile(
  "public/demo/LICENSE.txt",
  `Demonstration photographs only. Not ACPhotos client work.\nLicense: https://unsplash.com/license\nSources:\n${ids.map((id) => `https://images.unsplash.com/${id}`).join("\n")}\nRetrieved 2026-10-22. Replace with client photographs before production.\n`,
);
