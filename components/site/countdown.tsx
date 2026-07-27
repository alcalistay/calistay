"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Parts = { gun: number; saat: number; dakika: number; saniye: number };

const UNITS: { key: keyof Parts; label: string }[] = [
  { key: "gun", label: "Gün" },
  { key: "saat", label: "Saat" },
  { key: "dakika", label: "Dakika" },
  { key: "saniye", label: "Saniye" },
];

function split(remainingMs: number): Parts {
  const total = Math.floor(Math.max(0, remainingMs) / 1000);
  return {
    gun: Math.floor(total / 86400),
    saat: Math.floor((total % 86400) / 3600),
    dakika: Math.floor((total % 3600) / 60),
    saniye: total % 60,
  };
}

/**
 * Etkinliğe kalan süre.
 *
 * Sunucunun ve ziyaretçinin saati aynı olmayacağı için ilk render'da
 * kutular boş bırakılır; değer hidrasyondan hemen sonra bağlanır.
 */
export function Countdown({
  target,
  className,
}: {
  target: string;
  className?: string;
}) {
  const targetMs = new Date(target).getTime();
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(split(targetMs - Date.now()));

    // requestAnimationFrame arka plandaki sekmelerde tetiklenmediği için
    // ilk değer bilinçli olarak setTimeout ile alınıyor.
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [targetMs]);

  return (
    <div role="timer" aria-live="off" className={cn("grid grid-cols-4 gap-2", className)}>
      {UNITS.map(({ key, label }) => (
        <div
          key={key}
          className="relative overflow-hidden rounded-lg border border-border bg-card px-2 py-3.5"
        >
          {/* Üst kenardaki ince aydınlanma — kutulara hacim kazandırır */}
          <span
            aria-hidden
            className="absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-accent/45 to-transparent"
          />

          <span className="tnum block text-2xl font-semibold leading-none text-foreground sm:text-[28px]">
            {parts ? String(parts[key]).padStart(2, "0") : "––"}
          </span>
          <span className="mt-1.5 block text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
