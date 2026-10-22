import type { Content } from "./model";
const cat = "00000000-0000-4000-8000-000000000001";
export const fixtures: Content = {
  categories: [
    ...[
      "Spor",
      "Futbol",
      "Basketbol",
      "Tribün & Stadyum",
      "Portre",
      "Etkinlik",
      "Sosyal Sorumluluk",
    ].map((name, i) => ({
      id: `00000000-0000-4000-8000-${String([1, 6, 3, 4, 5, 2, 7][i]).padStart(12, "0")}`,
      name,
      slug: [
        "spor",
        "futbol",
        "basketbol",
        "tribun-stadyum",
        "portre",
        "etkinlik",
        "sosyal-sorumluluk",
      ][i]!,
      sort_order: i,
    })),
  ],
  projects: [
    [
      "Örnek albüm: Spor",
      "sessiz-zirveler",
      "Örnek fotoğraflar; ACPhotos müşteri çalışması değildir.",
    ],
    [
      "Örnek albüm: Etkinlik",
      "kiyinin-otesinde",
      "Örnek fotoğraflar; ACPhotos müşteri çalışması değildir.",
    ],
    [
      "Örnek albüm: Portre",
      "isik-ve-yapi",
      "Örnek fotoğraflar; ACPhotos müşteri çalışması değildir.",
    ],
  ].map(([title, slug, description], i) => ({
    id: `10000000-0000-4000-8000-00000000000${i + 1}`,
    title: title!,
    slug: slug!,
    description: description!,
    category_id: [
      cat,
      "00000000-0000-4000-8000-000000000002",
      "00000000-0000-4000-8000-000000000005",
    ][i]!,
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
      "Örnek fotoğraf 1; ACPhotos çalışması değildir",
      "Örnek fotoğraf 2; ACPhotos çalışması değildir",
      "Örnek fotoğraf 3; ACPhotos çalışması değildir",
      "Örnek fotoğraf 4; ACPhotos çalışması değildir",
      "Örnek fotoğraf 5; ACPhotos çalışması değildir",
      "Örnek fotoğraf 6; ACPhotos çalışması değildir",
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
        "Arşiv başlıkları arasında Gebzespor, Bursaspor–Mardinspor, Bursaspor Tribün & Arena ve Bursaspor Basketbol çekimleri; PUGNOVERDE için 8 Mart Dünya Kadınlar Günü etkinliği (Enes Aydın) ve Batuhan Uzan ile Enes Çelik portreleri yer alıyor. Bu başlıklar kulüp veya marka onayı anlamına gelmez.",
      photographer_name: "Arda Cesurtürk",
      photographer_bio:
        "18 yaşındaki fotoğrafçı Arda Cesurtürk; futbol, basketbol, tribün ve stadyum, portre, etkinlik ve sosyal sorumluluk alanlarında fotoğraf üretiyor. Arşivinde Gebzespor, Bursaspor–Mardinspor, Bursaspor Tribün & Arena ve Bursaspor Basketbol çekimleri; PUGNOVERDE 8 Mart etkinliği (Enes Aydın) ile Batuhan Uzan ve Enes Çelik portreleri bulunuyor. Kulüp veya marka onayı ima edilmez.",
      phone: "+905315172842",
      email: "cesurturk16@hotmail.com",
      instagram: "https://www.instagram.com/acphotos.tr/",
      seo_description: "ACPhotos fotoğraf albümleri ve görsel hikâyeler.",
      hero_image_id: "",
      logo_text: "ACPhotos",
    },
  ],
};
