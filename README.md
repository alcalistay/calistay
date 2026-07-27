# ALÇAL'26 — Atatürk Lisesi Çalıştayı 2026

Eskişehir Atatürk Lisesi'nin düzenlediği ALÇAL'26 çalıştayının tanıtım sitesi.

## Çalıştırma

```bash
npm install
npm run dev
```

Diğer komutlar: `npm run build`, `npm start`, `npm run lint`.

## Firebase kurulumu

Yönetim paneli, başvuru kayıtları ve sayfa görünürlüğü Firebase üzerinde
çalışır. Anahtarlar girilmeden de site açılır: ayarlar `constants/` altındaki
varsayılanlara düşer, formlar e-posta taslağı açar, `/admin` ise uyarı gösterir.

**1. Anahtarlar.** `.env.example` dosyasını `.env.local` adıyla kopyalayın ve
Firebase Console → Proje ayarları → Genel → Web uygulaması bölümündeki
değerleri doldurun. Ardından `npm run dev`'i yeniden başlatın.

**2. Yönetici hesabı.** Firebase Console → Authentication → Sign-in method →
E-posta/Şifre'yi etkinleştirin ve yalnızca ekip üyeleri için hesap oluşturun.
Sitede kayıt akışı yoktur; hesaplar elle açılır.

**3. Güvenlik kuralları.** `firestore.rules` dosyasının içeriğini Firebase
Console → Firestore Database → Kurallar bölümüne yapıştırıp yayımlayın.
Kurallar; ayarları herkese okutur ama yalnızca yöneticiye yazdırır, başvuruları
herkese oluşturtur ama yalnızca yöneticiye okutur, silmeyi tamamen kapatır.

**4. Panel.** `/admin` adresinden giriş yapın.

### Firestore yapısı

| Yol | İçerik |
| --- | --- |
| `site/settings` | Görünürlük anahtarları, tarih, kontenjan (tek doküman) |
| `applications` | Delege başvuruları |
| `sponsorRequests` | Sponsorluk başvuruları |

## Yönetim paneli

`/admin` üç sekmeden oluşur:

- **Ayarlar** — sponsorluk sayfasını, delege başvurularını ve sponsorluk
  formunu ayrı ayrı aç/kapa; geri sayım tarihi, görünen tarih metni,
  kontenjan sayıları ve başvurular kapalıyken gösterilecek mesaj.
- **Delege başvuruları** — canlı liste, duruma göre filtre (Yeni/Kabul/Red),
  arama, satır genişletince tam kayıt, CSV dışa aktarma.
- **Sponsorluk başvuruları** — aynı yetenekler, kurum bazlı.

Ayarlar Firestore'dan canlı dinlenir: bir anahtarı kapattığınızda açık olan
ziyaretçi sekmeleri yenilenmeden güncellenir.

## İçerik nereden değiştirilir

Panelden yönetilmeyen metinler `constants/` altındadır:

| Dosya | İçerik |
| --- | --- |
| `constants/event.ts` | Adres, okul tarihçesi, tanıtım metinleri, varsayılan tarih ve sayılar |
| `constants/committees.ts` | 8 komite: gündem, tanıtım metni, tartışma soruları, ikon, renk |
| `constants/sponsorship.ts` | Destek alanları ve sponsora sunulan karşılıklar |
| `constants/team.ts` | İletişim kişileri (telefon görünürlüğü dâhil) |

`constants/event.ts` içindeki tarih ve kontenjan değerleri yalnızca Firebase
kapalıyken ya da `site/settings` dokümanı henüz oluşmadığında kullanılır;
sonrasında panel kazanır.

### Sık yapılacak güncellemeler

- **Telefon yayımlama:** `constants/team.ts` içinde ilgili kişiye `phone` ekleyip
  `showPhone: true` yapın. Varsayılan olarak yalnızca organizasyon
  sorumlularının numaraları görünür.
- **Alan adı:** `app/layout.tsx` içindeki `metadataBase` şu an
  `https://alcal26.com` placeholder'ıdır; gerçek alan adıyla değiştirin.
- **Tahmini sayı işareti:** `constants/event.ts` içinde bir istatistiğe
  `estimated: true` eklerseniz yanına yıldız konur; açıklaması footer'daki
  `estimateNote` metnidir.

## Marka görselleri

Kaynak logo `public/logo-source.png`. Türev görseller tek komutla üretilir:

```bash
node scripts/generate-assets.mjs
```

Üretilenler: `public/logo-navy.png` (açık zeminler için lacivert mühür),
`public/logo-white.png` (koyu bloklar için beyaz mühür), `app/icon.png`
(favicon), `app/apple-icon.png`, `app/opengraph-image.png` (link önizlemesi).
Next.js bu dosyaları `app/` altında otomatik olarak ilgili meta etiketlerine
bağlar.

## Sayfalar

| Rota | İçerik |
| --- | --- |
| `/` | Hero → Hakkında → Komiteler → Delege başvurusu → sponsorluk yönlendirmesi |
| `/sponsor` | Destek alanları, sponsorlara sunulanlar, başvuru formu (`#sponsor-basvuru`) |
| `/admin` | Yönetim paneli (arama motorlarına kapalı) |
| `/admin/login` | Yönetici girişi |

Ayrı bir iletişim bölümü yoktur; e-posta, Instagram, adres ve telefonlar
footer'da toplanır.

## Mimari

```
app/
  layout.tsx           Font, metadata, ambiyans ışıkları, ayar sağlayıcı
  page.tsx             Ana sayfa bölümleri + JSON-LD (EducationEvent)
  sponsor/page.tsx     Sponsorluk sayfası
  admin/               Panel (layout + login + dashboard)
  globals.css          Tasarım tokenları ve utility'ler
components/
  fx/
    reveal.tsx         Reveal / Stagger / StaggerItem
    counter.tsx        Görünüre girince sayan rakam (render'sız, DOM'a yazar)
    page-glows.tsx     Sayfa geneline yayılan ambiyans ışıkları
  providers/
    settings-provider.tsx   Firestore ayarlarını canlı dinler
  site/                Sayfa bölümleri ve formlar
  admin/               Panel bileşenleri
  ui/                  shadcn/ui bileşenleri
lib/
  firebase.ts          İstemci başlatma + koleksiyon yolları
  settings.ts          Ayar tipleri, varsayılanlar, normalize
  submissions.ts       Başvuru yazma ve tip tanımları
constants/             İçerik
scripts/               Görsel üretim
```

### Tasarım sistemi

Bileşen dili mevcut siteden devralındı: Inter, `rounded-lg` kenarlıklı kartlar,
ikon kutucukları, hover'da hafif yükselme.

**Tek sürekli zemin.** Sayfanın tamamı aynı derin lacivert tonda (`--deep`).
Hiçbir bölüm arka plan rengini değiştirmez, dolayısıyla hiçbir yerde renk
sıçraması olmaz. Ayrım; boşluk, ince kenarlıklar ve yüzey opaklığıyla kurulur:
kartlar `white/3.5`, hover'da `white/6`, form alanları `white/5`.

**Derinlik.** Bölüm bazlı gradyanlar, bölümün kenarında kesildiği için görünür
bir çizgi bırakıyordu. Bunun yerine `components/fx/page-glows.tsx` tüm sayfa
yüksekliğini kaplayan tek bir katman kullanır: yüzdeyle konumlanmış sekiz
küçük ışık kütlesi, hiçbiri bölüm sınırına denk gelmez ve hepsi tamamen
saydama inerek söner.

Navbar renk değiştirmez; 40px kaydırmadan sonra yalnızca bulanıklık ve alt
kenarlık kazanır.

Komitelerin her biri kendi rengini taşır (`constants/committees.ts` →
`accent`). Doygunlukları bilinçli olarak düşük tutuldu ve yalnızca ikon
kutusu, sıra numarası ve modal işaretlerinde kullanılıyor; kart dolgusu her
zaman `bg-card`.

> **Not:** Lightning CSS, `@utility` bloğu içine ham yazılan `backdrop-filter`
> ve `background-clip: text` gibi özellikleri eleyebiliyor. Böyle bir özellik
> gerekirse `@apply` ile Tailwind yardımcısı üzerinden verin.

### Erişilebilirlik ve performans

- `prefers-reduced-motion` hareket primitiflerinde ayrı ayrı ele alınır.
- Hareket yalnızca sönümlü opaklık + kısa öteleme; sürekli çalışan animasyon yok.
- Sayaç animasyonu React state'ine uğramaz; doğrudan DOM'a yazar.
- Geri sayım `setTimeout`/`setInterval` ile sürer (`requestAnimationFrame`
  arka plandaki sekmelerde tetiklenmediği için tercih edilmedi).

## Bilinen eksikler

- **Ayarlar istemci tarafında okunuyor.** Firebase web SDK'sı sunucuda
  çalışmadığı için sponsorluk sayfası kapalıyken 404 yerine "kapalı"
  bilgilendirmesi gösteriliyor. Gerçek 404 isterseniz Firebase Admin SDK ile
  sunucu tarafı okuma eklenmeli.
- **E-posta bildirimi yok.** Yeni başvuru geldiğinde ekibe otomatik e-posta
  gitmiyor; panelden takip edilmesi gerekiyor.
