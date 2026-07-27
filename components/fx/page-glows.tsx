/**
 * Sayfa geneline yayılmış yumuşak ışık kütleleri.
 *
 * Bölüm bazlı gradyanlar, bölümün kenarında kesildiği için görünür bir
 * çizgi bırakıyordu. Bunun yerine tüm sayfa yüksekliğini kaplayan tek bir
 * katman kullanılıyor: ışıklar yüzdeyle konumlandığı için hiçbir bölüm
 * sınırına denk gelmiyor ve hepsi tamamen saydama inerek sönüyor.
 *
 * Konumlar sağ–sol arasında dönüşümlü ilerler, böylece sayfanın hiçbir
 * kenarı uzun süre karanlık kalmaz. Her ışık çok yavaş (24–42 sn) nefes
 * alır; süreler ve gecikmeler bilinçli olarak asal sayılara yakın seçildi
 * ki hiçbiri senkronize olup görünür bir ritim oluşturmasın.
 *
 * Konumlandırma dış katmanda, animasyon iç katmanda: ikisi aynı elemanda
 * olsaydı `transform`'lar birbirini ezerdi.
 */

type Glow = {
  /** Yüzde cinsinden konum — kapsayıcı tüm sayfa yüksekliğidir. */
  top: string;
  left: string;
  /** Genişlik/yükseklik, viewport genişliğine göre. */
  size: string;
  color: string;
  /** 0–1 arası karışım oranı. */
  strength: number;
  /** Nefes süresi (sn) ve gecikmesi. */
  duration: number;
  delay: number;
};

const A = "var(--accent)";
const D = "var(--deep-3)";

const glows: Glow[] = [
  { top: "-4%", left: "50%", size: "88vw", color: A, strength: 0.2, duration: 31, delay: 0 },
  { top: "6%", left: "93%", size: "60vw", color: D, strength: 0.72, duration: 37, delay: -5 },
  { top: "14%", left: "3%", size: "56vw", color: A, strength: 0.13, duration: 25, delay: -13 },
  { top: "26%", left: "76%", size: "54vw", color: A, strength: 0.12, duration: 33, delay: -2 },
  { top: "34%", left: "10%", size: "52vw", color: D, strength: 0.62, duration: 29, delay: -19 },
  { top: "44%", left: "92%", size: "52vw", color: A, strength: 0.11, duration: 41, delay: -8 },
  { top: "53%", left: "24%", size: "54vw", color: A, strength: 0.12, duration: 27, delay: -23 },
  { top: "62%", left: "80%", size: "56vw", color: D, strength: 0.6, duration: 35, delay: -11 },
  { top: "71%", left: "6%", size: "52vw", color: A, strength: 0.11, duration: 23, delay: -16 },
  { top: "80%", left: "58%", size: "58vw", color: A, strength: 0.1, duration: 39, delay: -4 },
  { top: "90%", left: "14%", size: "52vw", color: D, strength: 0.58, duration: 30, delay: -26 },
  { top: "99%", left: "82%", size: "56vw", color: A, strength: 0.11, duration: 42, delay: -7 },
];

export function PageGlows() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {glows.map((glow, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            top: glow.top,
            left: glow.left,
            width: glow.size,
            height: glow.size,
          }}
        >
          <div
            className="size-full rounded-full will-change-[opacity,transform] motion-safe:[animation:glow-breathe_var(--dur)_ease-in-out_infinite_var(--delay)]"
            style={
              {
                "--dur": `${glow.duration}s`,
                "--delay": `${glow.delay}s`,
                backgroundImage: `radial-gradient(closest-side, color-mix(in oklch, ${glow.color} ${
                  glow.strength * 100
                }%, transparent), transparent 72%)`,
              } as React.CSSProperties
            }
          />
        </div>
      ))}
    </div>
  );
}
