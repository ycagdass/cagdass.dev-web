# cagdass.dev - Portfolio & CMS

Bu proje, Çağdaş'ın kişisel web sitesi ve portfolyosu (cagdass.dev) için Next.js ile geliştirilmiş modern, dinamik ve esnek bir web platformudur. Proje aynı zamanda yerleşik bir CMS (İçerik Yönetim Sistemi) ve i18n (çoklu dil) desteğine sahiptir.

## 🚀 Proje Özellikleri

- **Modern Mimari:** Next.js 16 (App Router), React 19 ve TypeScript kullanılarak geliştirildi.
- **Stil & Tasarım:** Tailwind CSS, Radix UI, Framer Motion animasyonları ile temiz, hızlı ve duyarlı (responsive) UI.
- **Çoklu Dil (i18n):** Türkçe ve İngilizce desteği, `react-i18next` ve `i18next` kullanılarak sağlanan dinamik dil değiştirme.
- **Yerleşik CMS:** Dinamik içerik yönetimi. İçerikler (makaleler, projeler vs.) `data/site-content.json` dosyasında tutulur ve kendi yönetim paneli üzerinden güncellenebilir.
- **Güvenlik:** API'ler, `rateLimit`, Cloudflare bazlı kontroller ve özel yetkilendirme (`lib/cmsAuth.ts`, `lib/cloudflareAccess.ts`) ile güvence altına alındı.
- **Karanlık/Aydınlık Tema:** `next-themes` kullanılarak kolay geçiş.
- **İkonlar & Bileşenler:** HugeIcons, Radix Primitives, Lucide ve DevIcons destekleri.

## 📂 Klasör Yapısı

- **/src/app:** Next.js App Router yapısı (Sayfalar, API route'ları, layoutlar).
- **/src/components:** Yeniden kullanılabilir React UI bileşenleri.
- **/src/locales:** Dil çeviri dosyaları (JSON formatında, `en` ve `tr`).
- **/src/lib:** Yardımcı fonksiyonlar, yetkilendirme, rate limit ve diğer arka plan iş mantıkları.
- **/src/hooks:** Özelleştirilmiş React hook'ları (örn. Site içeriklerini yönetmek için `useSiteContent.ts`).
- **/data:** Sitenin içeriğini barındıran `site-content.json` dosyası ve otomatik alınan yedekler (`backups` klasöründe).
- **/scripts:** Güvenlik ve yapılandırma amaçlı dış Node.js betikleri.
- **/nginx:** Projenin canlı sunucu üzerindeki reverse-proxy Reverse Proxy konfigürasyonları.

## 🛠 Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için:

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/ycagdass/cagdass.dev-web.git
   ```

2. Gerekli kütüphaneleri yükleyin:
   ```bash
   npm install
   ```

3. Geliştirme (development) sunucusunu başlatın:
   ```bash
   npm run dev
   ```

4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine giderek siteyi görüntüleyin.

## 📝 Kullanılan Teknolojiler

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Radix UI
- i18next & react-i18next
- Sonner (Bildirimler için)

## 📌 Son Güncellemeler
- Proje dosyaları temizlenerek `.gitignore` yapılandırması ayarlandı.
- Next.js önbellek (`.next`) ve modül dosyaları (`node_modules`) dışarıda bırakılarak GitHub gereksiz yüklerden arındırıldı.
- Kapsamlı bir `README.md` dosyası oluşturularak açıklama kısımları dolduruldu.