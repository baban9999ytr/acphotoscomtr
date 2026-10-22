import { z } from "zod";
const id = z.uuid();
const title = z.string().trim().min(1, "Bu alan zorunludur.").max(160);
const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Yalnızca küçük harf, rakam ve tire kullanın.",
  )
  .max(120);
const status = z.enum(["draft", "published"]);
export const schemas = {
  categories: z.object({
    id,
    name: title,
    slug,
    sort_order: z.number().int().default(0),
  }),
  projects: z.object({
    id,
    title,
    slug,
    description: z.string().max(5000).default(""),
    category_id: id.nullable(),
    status,
    featured: z.boolean().default(false),
    sort_order: z.number().int().default(0),
    year: z
      .string()
      .regex(/^$|^[0-9]{4}$/, "Dört haneli bir yıl girin.")
      .default(""),
    location: z.string().max(160).default(""),
  }),
  project_images: z.object({
    id,
    project_id: id,
    alt: title,
    paths: z.array(z.string()).length(3),
    width: z.number().positive(),
    height: z.number().positive(),
    sort_order: z.number().int(),
    is_cover: z.boolean(),
    fingerprint: z.string(),
    deleting: z.boolean().default(false),
  }),
  journal_posts: z.object({
    id,
    title,
    slug,
    body: z.string().max(50000),
    status,
    sort_order: z.number().int().default(0),
  }),
  site_settings: z.object({
    id: z.literal("main"),
    hero_title: title,
    hero_description: z.string().max(500),
    about: z.string().max(5000),
    photographer_name: title,
    photographer_bio: z.string().max(5000),
    phone: z.string().regex(/^$|^\+[1-9][0-9]{7,14}$/),
    email: z.union([z.literal(""), z.email()]),
    instagram: z
      .string()
      .refine(
        (v) =>
          !v || /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/.test(v),
        "Geçerli bir Instagram profil adresi girin.",
      ),
    seo_description: z.string().max(300),
    hero_image_id: z.union([id, z.literal("")]).default(""),
    logo_text: title.default("ACPhotos"),
  }),
};
export type Table = keyof typeof schemas;
export type Rows = { [K in Table]: z.infer<(typeof schemas)[K]> };
export type Project = Rows["projects"];
export type Photo = Rows["project_images"];
export type Content = { [K in Table]: Rows[K][] };
export { runtimeContentConfig } from "./runtime-config.js";
import { runtimeContentConfig, demoAdminEnabled } from "./runtime-config.js";
export const contentConfig = runtimeContentConfig();
export const demoMode = demoAdminEnabled(contentConfig);
export const uid = () => crypto.randomUUID();
