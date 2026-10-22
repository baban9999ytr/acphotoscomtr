# ACPhotos kurulum ve işletim

## Yerel demo

Node 24 veya üzeri: `npm ci`, `npm run dev`. `http://127.0.0.1:4321` ve `/admin/` adreslerini açın. **Demoyu aç** yalnızca yerel demodur; gerçek kimlik doğrulama değildir. Veriler IndexedDB'de, demo giriş işareti sessionStorage'da tutulur. Farklı tarayıcılar aynı veriyi paylaşmaz. Örnek fotoğraflar Unsplash lisanslıdır; ACPhotos müşteri işi değildir. Eski siteden görsel alınmadı. `public/demo/LICENSE.txt` kaynakları içerir.

## Supabase kurulumu — onaylı hedefte uygulanacak

Bu çalışma uzak proje oluşturmaz veya değiştirmez. Önce proje sahibi hedefi onaylamalıdır.

1. Supabase projesinde migration dosyasını inceleyin. SQL Editor veya Supabase CLI ile `supabase/migrations/` içindeki migration'ı uygulayın. Mevcut dolu projede tablo adlarını ve çakışmaları önce kontrol edin.
2. Auth üzerinden yönetici hesabını oluşturun. Herkese açık kaydı kapatın; güçlü parola ve Auth hız sınırlamalarını etkin tutun. Yetki kullanıcı metadata alanından türetilmez.
3. SQL Editor'da gerçek Auth UUID'sini kullanarak `insert into public.authorized_admins(user_id) values ('GERCEK-AUTH-UUID');` çalıştırın. Bu tabloyu tarayıcıdan değiştirme izni yoktur.
4. `.env.example` dosyasını `.env` olarak kopyalayın. `PUBLIC_CONTENT_MODE=supabase`, proje URL'si ve publishable anahtarı girin. `service_role` veya `sb_secret_` anahtarı **asla** PUBLIC değişkenine koymayın.
5. Auth Site URL: `https://acphotos.com.tr`. Production'da HTTPS kullanın. Şifre sıfırlama şu an Supabase yöneticisinin kontrolündedir; uygulamada self-service akış yoktur.
6. `npm run check`, `npm run lint`, `npm run test:security`, `npm run build`. Production derlemesi yayınlanmış slug ve genel ayarları yayımlanabilir anahtarla okur; okuma başarısızsa durur.
7. Canlı Auth ve Storage testlerini ayrıca tamamlayın: yönetici girişi/çıkışı, yetkisiz hesap reddi, toplu yükleme, kaldırma, farklı tarayıcıdan yayın durumu, doğrudan Storage isteğinde taslak reddi. Yerel PGlite testleri bu servis testlerinin yerine geçmez.

## Yayın modeli

Sayfa kabukları statik Astro'dur. Production albümleri ve blog içerikleri istemcide Supabase'den okunur; **her yeni sayfa yüklemesinde** yayın durumu yeniden sorgulanır. RLS taslakları ve taslaklara ait özel depolama dosyalarını gizler. Yönetici oturumu açık olsa bile public repository yalnızca published kayıtları ister.

Yeni içerik `/albumler/goruntule/?slug=...` ve `/blog/goruntule/?slug=...` üzerinden derleme gerektirmeden açılır. Derlemede bilinen slug'lar için temiz yollar hazırlanır. Yeni temiz yol ve sitemap, başlık/açıklama gibi build-time SEO değişiklikleri yeniden derleme gerektirir. İstemcide yüklenen içeriklerin arama motoru ve sosyal önizleme kabiliyeti tam statik makalelerden düşüktür. Rebuild hook yoktur ve hiçbir gizli hook tarayıcıya konmaz.

Fotoğraflar public bucket veya uzun ömürlü signed URL kullanmaz; RLS kontrollü `download()` ile Blob olarak alınır. Albüm sayfasında yalnızca görünür/yakın fotoğraflar alınır, tam ekran dosyası tıklanınca yüklenir. Önceden indirilmiş bir görseli kullanıcıdan geri almak mümkün değildir. Açık sekmenin belleğindeki dosya sayfadan ayrılınca serbest bırakılır; yayından kaldırma bir sonraki yüklemede etkili olur. Ziyaretçinin kaydettiği kopyalar geri alınamaz.

## Güvenilir dosya işlemleri

Yükleme: dosya biçimi, magic byte, 20 MB ve 60 MP sınırı; 480/1000/1800 azami kenarlı WebP; büyütme yok; SHA-256 ile aynı albümde tekrar engelleme. İlerleme çubuğu işlem aşamalarını gösterir, ağ baytlarını ölçmez. Metadata ancak üç dosya başarıyla saklandıktan sonra yazılır. Hata halinde dosyalar temizlenir. Aynı fotoğraf başka albümde kullanılabilir.

Silme: önce `deleting=true` ile public erişim kesilir, sonra depolama dosyaları, en son metadata silinir. Ara hata olduğunda dashboard kaydı tekrar silinerek işlem sürdürülür. Kapak değiştirme ve fotoğraf sıralama SQL transaction içinde yapılır. Albüm silmeden önce fotoğrafları taşıyın veya silin.

**Uzlaştırma:** ağın tamamen kesilmesi veya sekmenin kapanması telafi temizliğini engelleyebilir. Yetkili operatör Storage'daki dosyaları `project_images.paths` ile karşılaştırmalı; aktif yükleme olmadığını doğruladıktan sonra yalnızca kayıtsız eski dosyaları Storage API üzerinden silmelidir. `storage.objects` tablosundan doğrudan DELETE yapmayın. `deleting=true` kayıtlarını dashboard üzerinden yeniden silin. Otomatik arka plan uzlaştırıcısı bu sürümde yoktur.

## Cloudflare Pages

Onaydan sonra build command `npm run build`, output `dist`, Node 24; üç PUBLIC değişkenini girin. `public/_headers` güvenlik başlıklarını sağlar. Domain ayarlarına `acphotos.com.tr` ekleyin; DNS değişikliğini ayrıca onaylayın. İlk yayından önce demo görsellerini değiştirin, doğrulanmış iletişim bilgilerini girin, migration ve canlı negatif testleri tamamlayın. Yayını bu çalışma otomatik başlatmaz.

## GitHub Pages alternatifi

İş akışı yalnızca `workflow_dispatch` ile çalışır, `dist` yükler. Repository Variables alanında Supabase URL ve publishable key gerekir. CNAME korunur. Kök custom domain hedeflenmiştir; repo alt yolu hedeflenirse Astro base ve tüm kök URL'ler ayrıca uyarlanmalıdır. GitHub Pages `_headers` dosyasını uygulamaz; HTTP güvenlik başlıkları için Cloudflare proxy gerekir. İstemci fallback linkleri derlenmemiş slug'larda 404 oluşmasını önler.

## Test komutları

- `npm run check`: Astro/TypeScript
- `npm run lint`: ESLint
- `npm run format:check`: Prettier
- `npm run test:security`: PGlite üzerinde gerçek PostgreSQL policy testleri; minimal auth/storage şemalarıyla
- `npm run build && npm test`: built-site Chromium testi, port 4322

Tarayıcı kurulu değilse `npx playwright install chromium`. Gerçek Supabase entegrasyonu için Docker/Supabase local stack veya onaylı test projesi gerekir. Migration'ı canlıya uygulamadan önce yedek ve hedef doğrulaması yapın.
