# ACPhotos keşif ve uygulama planı

22 Ekim 2026. Depo temiz; mevcut uygulama yalnızca index.html bekleme sayfası, assets.png, CNAME ve tüm depoyu yükleyen GitHub iş akışıdır. Paket, test, veritabanı veya ortam yapılandırması yoktur. Önceki sayfa kaynak olarak korunur; yeni Astro uygulaması dist üretir. Eski siteye erişim başarısızdır. Telefon, e-posta, adres, çalışma saatleri ve sosyal hesaplar doğrulanamadı. Depodaki Instagram bağlantısı bağımsız doğrulanmadığından etkinleştirilmez. Referans ekran görüntüsü bu konuşmada mevcut değildir.

## Yetenek envanteri

| Alan                               | Okunan beceri / kaynak                               | Uygulama                                                                  |
| ---------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------- |
| Tasarım                            | frontend-design; frontend-app-builder; imagegen      | Koyu editoryal kompozisyon, tipografi, görsel konsept ve ekran incelemesi |
| Kullanılabilirlik, erişilebilirlik | frontend-design; frontend-testing-debugging          | Klavye, diyalog, odak, mobil ve hata durumları                            |
| Astro, TypeScript                  | Özel kurulu beceri bulunamadı; resmi Astro belgeleri | Statik yollar, katı türler, küçük istemci modülleri                       |
| Supabase                           | supabase; supabase-postgres-best-practices           | İzin listesi, RLS, özel depolama, yabancı anahtar indeksleri              |
| Güvenlik                           | security-best-practices ve JS frontend referansı     | Güvenli DOM, URL doğrulama, gizli anahtarların istemciden ayrılması       |
| Performans / hareket               | Tasarım ve test becerileri; doğrudan mühendislik     | Görsel varyantları, lazy loading, azaltılmış hareket                      |
| Playwright                         | playwright; frontend-testing-debugging               | Gerçek Chromium etkileşimleri ve otomatik test dosyaları                  |
| SEO / dağıtım                      | Doğrudan mühendislik ve resmi belgeler               | Kanonik, sitemap, robots, dist-only manuel dağıtım                        |

Node ve npm kullanılabilir. Browser adlı eklenti/becerisi bulunmadığından istenen otomatik testler Playwright ile çalıştırılacak. Uzak Supabase kaynakları onaysız değiştirilmez. Canlı entegrasyon sonuçları yerel demo sonuçlarından ayrı raporlanır.

## Tasarım

Zemin #080808, yüzey #111111, yükseltilmiş #191919, metin #f5f5f3, ikincil #a0a0a0, çizgi #292929. Büyük Manrope başlıklar, Cormorant Garamond editoryal vurgu, sol hizalı metin. Kahraman alanında tipografi ve ofset manzara; aşağıda değişken oranlı albüm görselleri. Tekrarlanan kartlar ve uydurma başarı ifadeleri yok. Fotoğrafın kendisi odak noktası; çevresindeki arayüz sakin.

## Aşamalar

1. Statik Astro demo, tüm Türkçe yollar ve yerel lisanslı örnek fotoğraflar.
2. Galeri, ışık kutusu, mobil menü, hareket ve erişilebilirlik.
3. Supabase şema, izin listesi, RLS ve özel depolama.
4. Yerel kalıcı demo ve gerçek Supabase adaptörüyle Türkçe yönetim.
5. Yayınlama, dosya telafisi ve entegrasyon testleri.
6. Gerçek tarayıcı, responsive, güvenlik ve build doğrulaması; dağıtım belgeleri.
