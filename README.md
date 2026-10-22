# ACPhotos

Türkçe fotoğraf portfolyosu ve yönetim paneli. Astro + TypeScript, GSAP, Supabase Auth/PostgreSQL/private Storage. İletişim: cesurturk16@hotmail.com · [Instagram](https://www.instagram.com/acphotos.tr/) · [Kaynak kodu](https://github.com/baban9999ytr/acphotoscomtr).

```sh
npm ci
npm run dev
```

Yerel site: `http://127.0.0.1:4321`, yönetim: `/admin/`. Varsayılan yerel önizleme Supabase kimlik bilgileri gerektirmez. Demo verileri yalnızca kullanılan tarayıcıda saklanır. Hukuk sayfaları işletme ve danışman incelemesi bekleyen taslaklardır.

```sh
npm run check
npm run lint
npm run test:security
npm run test:config
npm run test:runtime
npm run build
npm test
```

- [Kurulum, yayın modeli ve dağıtım](docs/OPERATIONS.md)
- [Türkçe yönetici kılavuzu](docs/ADMIN-TR.md)
- [Keşif ve beceri envanteri](docs/DISCOVERY.md)
- [Sonuç ve kalan doğrulamalar](docs/REPORT-TR.md)

Commit, push ve deploy kullanıcı onayı gerektirir. Eski bekleme sayfası `index.html` içinde korunmuştur; uygulama `src/` altında, dağıtım çıktısı yalnızca `dist/` dizinindedir. Üretim ayarlarını `.env.example` üzerinden yapılandırın. Gizli anahtarlar tarayıcıya konmaz.
