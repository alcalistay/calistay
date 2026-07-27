"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Mühür ekrana gelip kısa bir an durur, sonra katman solar. */
const HOLD_MS = 800;
const FADE_MS = 600;

type Phase = "show" | "hiding" | "done";

/**
 * Açılış ekranı: okul mührü yumuşakça belirir, kısa bir an durur ve
 * katmanla birlikte solar. Bilerek sade tutuldu — ilerleme çubuğu gibi
 * "bekleyin" izlenimi veren öğeler yok.
 *
 * Her tam sayfa yüklenişinde oynar. Rota değişimlerinde tekrar çalışmaz;
 * kök layout istemci tarafı gezinmelerde yeniden monte edilmediği için
 * ayrıca bir bayrak tutmaya gerek yok.
 *
 * Kaybolma bilinçli olarak `AnimatePresence` yerine CSS geçişiyle yapılıyor:
 * çıkış animasyonunu beklemek, sekme arka plandayken `requestAnimationFrame`
 * durduğu için katmanın ekranda takılı kalmasına yol açıyordu. Burada
 * kaldırma işi zamanlayıcıya bağlı, dolayısıyla her koşulda tamamlanır.
 *
 * İçerik altta zaten render edilmiş durumdadır; bu katman yalnızca üstünü
 * örter, arama motorlarını veya erişilebilirliği etkilemez.
 */
export function LoadingScreen() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("show");

  useEffect(() => {
    // Ekran açıkken arka planın kayması engellenir.
    if (!reduced) document.body.style.overflow = "hidden";

    // Atlanacak durumda bile gizleme bir geri çağrımda yapılıyor: effect
    // gövdesinde doğrudan setState çağırmak zincirleme render tetikler.
    const timer = setTimeout(() => setPhase("hiding"), reduced ? 0 : HOLD_MS);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [reduced]);

  // Solma bittiğinde katman DOM'dan tamamen kaldırılır.
  useEffect(() => {
    if (phase !== "hiding") return;
    const timer = setTimeout(() => setPhase("done"), FADE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-[100] grid place-items-center bg-deep transition-opacity ease-out",
        phase === "hiding" && "pointer-events-none opacity-0",
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="relative grid place-items-center">
        {/* Mührün arkasındaki hale */}
        <span
          className="absolute size-64 rounded-full blur-2xl motion-safe:[animation:seal-halo_2.8s_ease-in-out_infinite]"
          style={{
            backgroundImage:
              "radial-gradient(closest-side, color-mix(in oklch, var(--accent) 28%, transparent), transparent 70%)",
          }}
        />

        <Image
          src="/logo-white.png"
          alt=""
          width={144}
          height={144}
          priority
          className="relative size-[112px] object-contain motion-safe:[animation:intro-seal_800ms_cubic-bezier(0.22,1,0.36,1)_both] sm:size-[136px]"
        />
      </div>
    </div>
  );
}
