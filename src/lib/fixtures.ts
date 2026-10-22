import type { Content } from "./model";
const cat = "00000000-0000-4000-8000-000000000001";
export const fixtures: Content = {
  categories: [
    { id: cat, name: "Doğa", slug: "doga", sort_order: 0 },
    {
      id: "00000000-0000-4000-8000-000000000002",
      name: "Mimari",
      slug: "mimari",
      sort_order: 1,
    },
  ],
  projects: [
    [
      "Sessiz zirveler",
      "sessiz-zirveler",
      "Dağların çizgileri, bulutların ritmi.",
    ],
    ["Kıyının ötesinde", "kiyinin-otesinde", "Suyun ve ışığın değişen yüzü."],
    ["Işık ve yapı", "isik-ve-yapi", "Mekânın içinde saklı geometriler."],
  ].map(([title, slug, description], i) => ({
    id: `10000000-0000-4000-8000-00000000000${i + 1}`,
    title: title!,
    slug: slug!,
    description: description!,
    category_id: i === 2 ? "00000000-0000-4000-8000-000000000002" : cat,
    status: "published",
    featured: true,
    sort_order: i,
    year: "",
    location: "",
  })),
  project_images: Array.from({ length: 6 }, (_, i) => ({
    id: `20000000-0000-4000-8000-00000000000${i + 1}`,
    project_id: `10000000-0000-4000-8000-00000000000${Math.floor(i / 2) + 1}`,
    alt: [
      "Bulutların arasında dağ zirveleri",
      "Dağ gölü ve yansımalar",
      "Kayalık kıyıda dalgalar",
      "Denizin üzerinde gün ışığı",
      "Yapının geometrik çizgileri",
      "Mimari detay ve gölgeler",
    ][i]!,
    paths: [480, 1000, 1800].map((w) => `/demo/photo-${i + 1}-${w}.webp`),
    width: 1800,
    height: 1200,
    sort_order: i % 2,
    is_cover: i % 2 === 0,
    deleting: false,
    fingerprint: `demo-${i}`,
  })),
  journal_posts: [],
  site_settings: [
    {
      id: "main",
      hero_title: "Işığın izinde.\nAnın içinde.",
      hero_description:
        "Bir bakış, bir his, bir hikâye. Fotoğrafın içinden dünyaya açılan bir pencere.",
      about:
        "Her kare, başka bir bakış. ACPhotos albümlerini keşfedin; ışığın, mekânın ve anın bir araya geldiği hikâyelere yakından bakın.",
      phone: "",
      email: "",
      instagram: "",
      seo_description: "ACPhotos fotoğraf albümleri ve görsel hikâyeler.",
      hero_image_id: "",
      logo_text: "ACPhotos",
    },
  ],
};
