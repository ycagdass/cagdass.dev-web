# cagdass.dev

Yusuf Çağdaş için düşük kaynak tüketimli Next.js portfolyo sitesi ve dosya tabanlı mini CMS.

## Yapı

- Ana site: `https://cagdass.dev`
- WWW: `https://www.cagdass.dev`
- CasaOS paneli: `https://panel.cagdass.dev` ayrı kalır
- Site admin paneli: `/cg38`
- İçerik dosyası: `data/site-content.json`
- Otomatik içerik yedekleri: `data/backups/`
- Yüklenen görseller: `public/uploads/`

## Güvenlik

- Admin paneli kullanıcı adı ve şifre ile korunur.
- Admin girişinde Google Authenticator / Microsoft Authenticator uyumlu 6 haneli TOTP 2FA zorunludur.
- Login, içerik kaydı ve upload API uçlarında rate limiting vardır.
- Upload sadece PNG, JPG, WEBP ve SVG görsel kabul eder.
- Dosya türü yalnızca MIME ile değil dosya içeriğiyle de doğrulanır.
- Admin cookie `httpOnly`, `sameSite=strict` ve production ortamında `secure` olarak yazılır.
- Cloudflare Access için hazırdır.

Cloudflare Access kullanacaksan:

1. Cloudflare Zero Trust içinde bir Access Application oluştur.
2. Path olarak şunları koru:
   - `cagdass.dev/cg38*`
   - `cagdass.dev/api/cms/*`
3. `.env` içinde `CF_ACCESS_REQUIRED=true` yap.
4. İstersen `CF_ACCESS_ALLOWED_EMAILS=mail1@example.com,mail2@example.com` ekle.

Not: Cloudflare Access header doğrulaması, origin dış dünyaya açık değilken anlamlıdır. Docker compose portu sadece `127.0.0.1:3000` olarak açar; Cloudflare Tunnel/Nginx dışındaki doğrudan erişimi açma.

## Kurulum

Sunucuda hedef dizin:

```bash
mkdir -p /home/c/website
cd /home/c/website
```

Projeyi bu dizine koy. Sonra `.env` oluştur:

```bash
cp .env.example .env
```

Güçlü şifre hash'i üret:

```bash
node scripts/hash-password.mjs "güçlü-admin-şifren"
```

Çıktıyı `.env` içindeki `ADMIN_PASSWORD_HASH` alanına yaz. Ayrıca `ADMIN_SESSION_SECRET` için uzun rastgele bir değer kullan:

```bash
openssl rand -hex 32
```

Authenticator için TOTP secret ve otpauth URL üret:

```bash
npm run totp:setup
```

Çıktıdaki `ADMIN_TOTP_SECRET=...` değerini `.env` içine yaz:

```env
ADMIN_TOTP_SECRET=ÜRETİLEN_BASE32_SECRET
```

Çıktıdaki `OTPAUTH_URL=otpauth://...` adresini Google Authenticator veya Microsoft Authenticator uygulamasına ekle. Uygulama manuel kurulum istiyorsa aynı `ADMIN_TOTP_SECRET` değerini kurulum anahtarı olarak gir; tür `time-based`, hane sayısı `6`, süre `30 saniye` olmalı.

## Docker ile Çalıştırma

```bash
docker compose up -d --build
```

Kontrol:

```bash
docker compose ps
curl -I http://127.0.0.1:3000
```

Loglar:

```bash
docker compose logs -f --tail=100
```

## Nginx

Örnek config: `nginx/cagdass.dev.conf`

CasaOS paneli `panel.cagdass.dev` olarak ayrı kalmalı. Ana site için Cloudflare Tunnel veya Nginx yönlendirmesi `127.0.0.1:3000` hedefine gitmeli.

## İçerik Yönetimi

Admin panel:

```text
https://cagdass.dev/cg38
```

Panelden şunlar düzenlenebilir:

- Ana sayfa başlığı ve açıklaması
- Hakkımda metni
- Logo ve profil görseli
- Sosyal bağlantılar
- Projeler
- Bölüm görünürlükleri

Giriş için kullanıcı adı, şifre ve Authenticator uygulamasındaki güncel 6 haneli doğrulama kodu birlikte gerekir. Şifre doğru olsa bile TOTP kodu hatalıysa oturum açılmaz; bu denemeler login rate limit sınırına dahildir.

Eski `/ycg-control-38` yolu kullanılmaz; admin panel sadece `/cg38` altında çalışır.

Değişiklikler `data/site-content.json` içine kalıcı yazılır. Her kayıt öncesi `data/backups/` altında yedek alınır.

## Düşük Kaynak Ayarları

Docker compose:

- Runtime bellek limiti: `768m`
- CPU limiti: `1.0`
- Next standalone output kullanılır.
- Node runtime `--max-old-space-size=512` ile sınırlandırılır.
- İçerik JSON dosyası veritabanı gerektirmez.

8GB RAM laptop için bu yapı yeterince hafiftir. Aynı makinede CasaOS, Docker ve Cloudflare Tunnel çalışırken de stabil kalması hedeflenmiştir.

## Yedekleme

En önemli klasörler:

```text
data/
public/uploads/
.env
```

Öneri:

```bash
tar -czf cagdass-site-backup-$(date +%F).tar.gz data public/uploads .env
```

## Güncelleme

```bash
docker compose down
docker compose up -d --build
```

## Geliştirme

```bash
npm install
npm run dev
npm run typecheck
```
