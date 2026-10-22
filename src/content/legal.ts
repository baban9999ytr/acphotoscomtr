export type LegalDocument = {
  slug: string;
  title: string;
  description: string;
  sections: { heading: string; paragraphs: string[] }[];
};

const review =
  "Bu bölüm yayına alınmadan önce işletme sahibi tarafından doğrulanmalı ve gerekirse hukuk danışmanına inceletilmelidir.";

export const legalDocuments: LegalDocument[] = [
  {
    slug: "gizlilik-politikasi",
    title: "Gizlilik ve kişisel verilerin korunması",
    description:
      "ACPhotos web sitesinde kişisel verilerin işlenmesine ilişkin taslak bilgilendirme.",
    sections: [
      {
        heading: "Taslak ve veri sorumlusu",
        paragraphs: [
          "Bu metin düzenlenebilir bir taslaktır; tek başına KVKK uyumu veya hukuki uygunluk beyanı değildir. Veri sorumlusu olarak Arda Cesurtürk / ACPhotos bilgisi esas alınmıştır. Açık adres, hukuki statü, uygulanacak işleme şartları, veri saklama süreleri, barındırma ve alıcılar işletme sahibi tarafından kesinleştirilmelidir.",
          "İletişim: cesurturk16@hotmail.com · +90 531 517 28 42 · Instagram: acphotos.tr. Açık adres ve işletme unvanı: " +
            review,
        ],
      },
      {
        heading: "İşlenen bilgiler ve amaçlar",
        paragraphs: [
          "Kamuya açık portfolyo sayfalarında albüm ve fotoğraf içerikleri gösterilir. Ziyaretçi iletişim formu, üyelik, analitik veya reklam pikseli bulunmamaktadır. E-posta, telefon, WhatsApp veya Instagram üzerinden kullanıcı kendi isteğiyle iletişim kurarsa, ilgili iletişim kanalı üzerinden ilettiği bilgiler yanıt vermek amacıyla işlenebilir. Bu kanalların kendi gizlilik koşulları ayrıca geçerlidir.",
          "Site işletim kayıtlarının (ör. IP adresi ve istek zamanı) barındırma sağlayıcısı tarafından işlenip işlenmediği ve süresi sağlayıcı sözleşmesiyle doğrulanmalıdır: " +
            review,
        ],
      },
      {
        heading: "Tarayıcı depolaması",
        paragraphs: [
          "Yerel demo yönetimi düzenlemeleri IndexedDB'de, demo oturumu işareti sessionStorage'da tutar. Supabase Auth etkinleştirilmiş üretim yapılandırmasında istemci oturumunu tarayıcının localStorage alanında saklayabilir. Üçüncü taraf reklam/analitik izleyicisi kullanılmaz. Hosting sağlayıcısının zorunlu teknik depolama işlemleri: " +
            review,
        ],
      },
      {
        heading: "Hukuki sebep, aktarım ve süre",
        paragraphs: [
          "İşleme şartı, saklama süresi, yurt dışı aktarım durumu, barındırma sağlayıcısı ve hizmet sağlayıcı alıcıları canlı sistem ve sözleşmeler incelenerek doldurulmalıdır. Bu bilgiler doğrulanmadığı için burada süre veya uyum iddiası verilmemiştir. " +
            review,
        ],
      },
      {
        heading: "Haklar ve başvuru",
        paragraphs: [
          "İlgili kişi başvuruları ve KVKK kapsamındaki hakların kullanılma yöntemi, veri sorumlusu kimliği ve başvuru adresi kesinleştikten sonra bu alana eklenmelidir. Mevcut iletişim kanalları: cesurturk16@hotmail.com ve +90 531 517 28 42. Başvuru yöntemi ve yanıt süresi için: " +
            review,
        ],
      },
    ],
  },
  {
    slug: "cerez-politikasi",
    title: "Çerez ve tarayıcı depolama politikası",
    description:
      "ACPhotos sitesindeki IndexedDB, sessionStorage ve Supabase oturum depolamasına ilişkin taslak.",
    sections: [
      {
        heading: "Kullanılan depolama",
        paragraphs: [
          "Bu site analitik veya reklam çerezi kurmaz. Yerel demo yönetimi içerikleri ve yüklenen örnek fotoğrafları IndexedDB'de saklayabilir; demo giriş işareti sessionStorage'da tutulur. Bu yerel demo kayıtları sunucuya gönderilmez.",
          "Supabase ile üretim içeriği ve oturum açma etkinleştirildiğinde Supabase istemcisi kimlik doğrulama oturumunu localStorage alanında saklayabilir. Bu işlem ziyaretçinin seçtiği çerez tercihiyle değil, uygulamanın oturum işleviyle ilgilidir. Canlı yapılandırma öncesi kullanılan depolama davranışı doğrulanmalıdır.",
        ],
      },
      {
        heading: "Zorunlu teknik kayıtlar",
        paragraphs: [
          "Hosting sağlayıcısının güvenlik ve erişim günlükleri hakkında sağlayıcı, veri konumu, saklama süresi ve hukuki dayanak doğrulanmalıdır: " +
            review,
        ],
      },
      {
        heading: "Tercihleri yönetme",
        paragraphs: [
          "Tarayıcı ayarlarından site verilerini silebilirsiniz. IndexedDB veya site verilerinin silinmesi yerel demo kayıtlarını ve yüklediğiniz demo fotoğraflarını kalıcı olarak kaldırır. Üretim oturumu silindiğinde yeniden giriş gerekir. Bu işlem sunucuda yayımlanmış içerikleri veya sunucu günlüklerini silmez.",
        ],
      },
    ],
  },
  {
    slug: "kullanim-kosullari",
    title: "Kullanım koşulları",
    description:
      "ACPhotos fotoğraf portfolyosu için düzenlenebilir kullanım koşulları taslağı.",
    sections: [
      {
        heading: "Site içeriği",
        paragraphs: [
          "ACPhotos sitesindeki gerçek fotoğraf ve metinlerin hak sahipliği, izinler ve lisans koşulları ilgili içerikle birlikte doğrulanmalıdır. Ziyaretçi içerikleri izinsiz çoğaltmamalı veya ticari amaçla kullanmamalıdır. Demo görünümündeki Unsplash fotoğrafları ACPhotos işleri değildir ve Unsplash lisans koşullarına tabidir.",
        ],
      },
      {
        heading: "Kullanım",
        paragraphs: [
          "Siteyi hukuka uygun biçimde kullanın; güvenliği, erişilebilirliği veya diğer kullanıcıların kullanımını bozacak girişimlerde bulunmayın. Bu sitede satın alma, üyelik veya çevrimiçi gönderim işlevi yoktur.",
        ],
      },
      {
        heading: "İletişim ve koşulların tamamlanması",
        paragraphs: [
          "İletişim: Arda Cesurtürk · cesurturk16@hotmail.com · +90 531 517 28 42. İşletmenin hukuki statüsü, uygulanacak hukuk, sorumluluk sınırları, telif/lisans bildirim ve uyuşmazlık usulleri hukuk danışmanıyla doğrulanmalıdır: " +
            review,
        ],
      },
    ],
  },
];
