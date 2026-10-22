import type { Content } from "./model";

const categoryIds = {
  basketball: "00000000-0000-4000-8000-000000000003",
  tribune: "00000000-0000-4000-8000-000000000004",
  portrait: "00000000-0000-4000-8000-000000000005",
  football: "00000000-0000-4000-8000-000000000006",
  event: "00000000-0000-4000-8000-000000000002",
  community: "00000000-0000-4000-8000-000000000007",
} as const;

const demoProjects = [
  [
    "Maçın ritmi",
    "sessiz-zirveler",
    categoryIds.football,
    true,
    "Futbol · Yapay zekâ ile oluşturulmuş demo kare",
  ],
  [
    "Parkede son an",
    "kiyinin-otesinde",
    categoryIds.basketball,
    true,
    "Basketbol · Yapay zekâ ile oluşturulmuş demo kare",
  ],
  [
    "Tribünün sesi",
    "isik-ve-yapi",
    categoryIds.tribune,
    true,
    "Tribün & Stadyum · Yapay zekâ ile oluşturulmuş demo kare",
  ],
  [
    "Oyuncu portreleri",
    "oyuncu-portreleri",
    categoryIds.portrait,
    false,
    "Portre · Yapay zekâ ile oluşturulmuş demo kare",
  ],
  [
    "Maç günü",
    "mac-gunu",
    categoryIds.event,
    false,
    "Etkinlik · Yapay zekâ ile oluşturulmuş demo kare",
  ],
  [
    "Birlikte sahada",
    "birlikte-sahada",
    categoryIds.community,
    false,
    "Sosyal Sorumluluk · Yapay zekâ ile oluşturulmuş demo kare",
  ],
] as const;

const demoPhotos = [
  [
    "football",
    "Futbol karşılaşmasından örnek demo fotoğraf; gerçek ACPhotos işi değildir.",
  ],
  [
    "basketball",
    "Basketbol karşılaşmasından örnek demo fotoğraf; gerçek ACPhotos işi değildir.",
  ],
  [
    "tribune",
    "Tribün ve stadyumdan örnek demo fotoğraf; gerçek ACPhotos işi değildir.",
  ],
  [
    "portrait",
    "Sporcu portresinden örnek demo fotoğraf; gerçek ACPhotos işi değildir.",
  ],
  [
    "event",
    "Spor etkinliğinden örnek demo fotoğraf; gerçek ACPhotos işi değildir.",
  ],
  [
    "community",
    "Sosyal sorumluluk antrenmanından örnek demo fotoğraf; gerçek ACPhotos işi değildir.",
  ],
] as const;

export const fixtures: Content = {
  categories: [
    ["Futbol", "futbol", categoryIds.football],
    ["Basketbol", "basketbol", categoryIds.basketball],
    ["Tribün & Stadyum", "tribun-stadyum", categoryIds.tribune],
    ["Portre", "portre", categoryIds.portrait],
    ["Etkinlik", "etkinlik", categoryIds.event],
    ["Sosyal Sorumluluk", "sosyal-sorumluluk", categoryIds.community],
  ].map(([name, slug, id], sort_order) => ({
    id: id!,
    name: name!,
    slug: slug!,
    sort_order,
  })),
  projects: demoProjects.map(
    ([title, slug, category_id, featured, description], i) => ({
      id: `10000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      title,
      slug,
      description,
      category_id,
      status: "published",
      featured,
      sort_order: i,
      year: "",
      location: "",
    }),
  ),
  project_images: demoPhotos.map(([name, alt], i) => ({
    id: `20000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    project_id: `10000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    alt,
    paths: [480, 1000, 1800].map((width) => `/demo/${name}-${width}.webp`),
    width: name === "tribune" ? 1672 : name === "portrait" ? 1122 : 1536,
    height: name === "tribune" ? 941 : name === "portrait" ? 1402 : 1024,
    sort_order: 0,
    is_cover: true,
    deleting: false,
    fingerprint: `demo-${name}`,
  })),
  journal_posts: [],
  site_settings: [
    {
      id: "main",
      hero_title: "Oyunun kalbinde.\nAnın içinde.",
      hero_description:
        "Sahanın ritmini, tribünün sesini ve sporcunun içinden geçenleri fotoğraflıyoruz.",
      about:
        "Ben Arda Cesurtürk. Futbol, basketbol ve tribün kültürüne odaklanan fotoğraflarla oyunun içindeki anları kaydediyorum.",
      photographer_name: "Arda Cesurtürk",
      photographer_bio:
        "Ben Arda Cesurtürk. Futbol ve basketboldan tribün hikâyelerine uzanan anları fotoğraflıyorum. Oyunun hızını, bekleyişini ve duygusunu her karşılaşmanın içinden takip ediyorum.",
      phone: "+905315172842",
      email: "cesurturk16@hotmail.com",
      instagram: "https://www.instagram.com/acphotos.tr/",
      seo_description:
        "Arda Cesurtürk'ün futbol, basketbol, tribün, portre ve etkinlik fotoğrafları.",
      hero_image_id: "",
      logo_text: "ACPhotos",
    },
  ],
};
