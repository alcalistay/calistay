/**
 * Marka görsellerini tek kaynaktan üretir.
 *
 *   node scripts/generate-assets.mjs
 *
 * Kaynak: public/logo-source.png (okulun mühür logosu, şeffaf zeminli)
 * Üretilenler:
 *   public/logo-navy.png       — lacivert mühür, açık zeminler için
 *   public/logo-white.png      — beyaz mühür, koyu bloklar için
 *   app/icon.png               — favicon
 *   app/apple-icon.png         — iOS ana ekran ikonu
 *   app/opengraph-image.png    — link önizleme kartı
 */

import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public/logo-source.png");

const DEEP = "#0d1a2b";
const DEEP_2 = "#16283f";
const NAVY = "#22364f";
const WHITE = "#f7f9fc";
const BLUE = "#7a9ad8";

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

/**
 * Logo tek renkli çizgi işi olduğu için alfa kanalını maske gibi kullanıp
 * istenen renkte düz bir siluet üretebiliyoruz.
 */
async function recolor(buf, hex, size) {
  const resized = await sharp(buf).resize(size, size).ensureAlpha().toBuffer();
  const alpha = await sharp(resized).extractChannel("alpha").raw().toBuffer();
  const { r, g, b } = hexToRgb(hex);
  return sharp({
    create: { width: size, height: size, channels: 3, background: { r, g, b } },
  })
    .joinChannel(alpha, { raw: { width: size, height: size, channels: 1 } })
    .png()
    .toBuffer();
}

// --- Kaynağı normalize et ---------------------------------------------------
//
// Şeffaf kenarlar kırpıldığında mühür 422×434 çıkıyor: çizimdeki daire
// dikeyde yatayına göre ~%3 daha uzun, bu yüzden ekranda yanlardan
// bastırılmış görünüyor. `fit: "fill"` ile kareye gerilerek daire
// yuvarlatılıyor; %3'lük fark gözle ayırt edilmiyor.
//
// Ardından her yöne eşit küçük bir pay bırakılıyor, aksi hâlde mühür
// kutunun dört kenarına da yapışık duruyor.
const trimmed = await sharp(SRC).trim({ threshold: 5 }).toBuffer();
const meta = await sharp(trimmed).metadata();
const side = Math.max(meta.width, meta.height);
const pad = Math.round(side * 0.02);

const square = await sharp(trimmed)
  .resize(side, side, { fit: "fill" })
  .extend({
    top: pad,
    bottom: pad,
    left: pad,
    right: pad,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

await writeFile(
  path.join(ROOT, "public/logo-navy.png"),
  await recolor(square, NAVY, 1024),
);
await writeFile(
  path.join(ROOT, "public/logo-white.png"),
  await recolor(square, WHITE, 1024),
);

// --- Favicon: lacivert zemin üzerinde beyaz mühür --------------------------
const ICON = 512;
const iconBg = Buffer.from(`
<svg width="${ICON}" height="${ICON}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="${DEEP_2}"/>
      <stop offset="100%" stop-color="${DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="${ICON}" height="${ICON}" rx="104" fill="url(#g)"/>
</svg>`);

await sharp(iconBg)
  .composite([{ input: await recolor(square, WHITE, 404), top: 54, left: 54 }])
  .png()
  .toFile(path.join(ROOT, "app/icon.png"));

// --- favicon.ico -----------------------------------------------------------
//
// Next.js, `app/favicon.ico` dosyasını `app/icon.png`'nin önüne alır. Bu
// yüzden .ico dosyasının da bizim mührümüz olması gerekiyor; aksi hâlde
// sekmede create-next-app'ten kalan varsayılan simge görünür.
//
// sharp .ico yazamadığı için konteyner elle kuruluyor. Vista sonrası ICO
// biçimi, ham bitmap yerine doğrudan PNG verisi gömmeye izin verir.
const icoSizes = [16, 32, 48, 64, 128, 256];

const icoImages = await Promise.all(
  icoSizes.map(async (size) => {
    // Kenar payı oransal; 16 pikselde bile en az 1 piksel kalmalı.
    const inset = Math.max(1, Math.round(size * 0.08));
    const bg = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="${DEEP}"/>
      </svg>`);

    const seal = await recolor(square, WHITE, size - inset * 2);
    return sharp(bg)
      .composite([{ input: seal, top: inset, left: inset }])
      .png()
      .toBuffer();
  }),
);

const ICONDIR = 6;
const ICONDIRENTRY = 16;
let offset = ICONDIR + ICONDIRENTRY * icoImages.length;

const header = Buffer.alloc(ICONDIR);
header.writeUInt16LE(0, 0); // ayrılmış
header.writeUInt16LE(1, 2); // tür: simge
header.writeUInt16LE(icoImages.length, 4);

const entries = icoImages.map((png, i) => {
  const size = icoSizes[i];
  const entry = Buffer.alloc(ICONDIRENTRY);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // 256 için 0 yazılır
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2); // palet yok
  entry.writeUInt8(0, 3); // ayrılmış
  entry.writeUInt16LE(1, 4); // renk düzlemi
  entry.writeUInt16LE(32, 6); // piksel başına bit
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});

await writeFile(
  path.join(ROOT, "app/favicon.ico"),
  Buffer.concat([header, ...entries, ...icoImages]),
);

// --- Apple touch icon ------------------------------------------------------
const APPLE = 180;
const appleBg = Buffer.from(`
<svg width="${APPLE}" height="${APPLE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="${DEEP_2}"/>
      <stop offset="100%" stop-color="${DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="${APPLE}" height="${APPLE}" fill="url(#g)"/>
</svg>`);

await sharp(appleBg)
  .composite([{ input: await recolor(square, WHITE, 144), top: 18, left: 18 }])
  .png()
  .toFile(path.join(ROOT, "app/apple-icon.png"));

// --- Open Graph kartı ------------------------------------------------------
const OG_W = 1200;
const OG_H = 630;
const SANS = "Segoe UI, Arial, sans-serif";

const ogBg = Buffer.from(`
<svg width="${OG_W}" height="${OG_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="${DEEP_2}"/>
      <stop offset="100%" stop-color="${DEEP}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.24" cy="0.46" r="0.6">
      <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${BLUE}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${OG_W}" height="${OG_H}" fill="url(#bg)"/>
  <rect width="${OG_W}" height="${OG_H}" fill="url(#glow)"/>

  <text x="452" y="242" font-family="${SANS}" font-size="20" letter-spacing="5.5"
        fill="${BLUE}">ULUSAL KATILIMA A&#199;IK L&#304;SE &#199;ALI&#350;TAYI</text>

  <text x="450" y="352" font-family="${SANS}" font-size="94" font-weight="700"
        letter-spacing="-2.5" fill="${WHITE}">AL&#199;AL&#8217;26</text>

  <text x="452" y="404" font-family="${SANS}" font-size="30"
        fill="${WHITE}" opacity="0.74">Atat&#252;rk Lisesi &#199;al&#305;&#351;tay&#305; 2026</text>

  <rect x="452" y="440" width="120" height="1" fill="${WHITE}" opacity="0.25"/>

  <text x="452" y="486" font-family="${SANS}" font-size="23"
        fill="${WHITE}" opacity="0.55">Aral&#305;k 2026 &#160;&#183;&#160; Odunpazar&#305; / Eski&#351;ehir</text>
  <text x="452" y="522" font-family="${SANS}" font-size="23"
        fill="${WHITE}" opacity="0.55">300 delege &#160;&#183;&#160; 8 komite</text>
</svg>`);

await sharp(ogBg)
  .composite([{ input: await recolor(square, WHITE, 268), top: 181, left: 118 }])
  .png()
  .toFile(path.join(ROOT, "app/opengraph-image.png"));

console.log("✓ Marka görselleri üretildi.");
