"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { teamMembers, type TeamMember } from "@/constants/team";

export function Team() {
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);

  // Modal açıkken klavye gezinimi (Sol, Sağ, ESC)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!activeMember) return;
      if (e.key === "Escape") {
        setActiveMember(null);
      } else if (e.key === "ArrowLeft") {
        navigateModal(-1);
      } else if (e.key === "ArrowRight") {
        navigateModal(1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function navigateModal(direction: number) {
    if (!activeMember) return;
    const currentIdx = teamMembers.findIndex((m) => m.id === activeMember.id);
    if (currentIdx === -1) return;
    const nextIdx = (currentIdx + direction + teamMembers.length) % teamMembers.length;
    setActiveMember(teamMembers[nextIdx]);
  }

  // Kesintisiz sonsuz döngü için diziyi çoğaltıyoruz
  const duplicatedMembers = [...teamMembers, ...teamMembers];

  return (
    <section id="ekibimiz" className="scroll-mt-20 py-20 sm:py-24">
      {/* Başlık Alanı */}
      <div className="mx-auto w-full max-w-6xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Ekibimiz"
          title="ALÇAL'27 Organizasyon Ekibi"
          lead="Çalıştayımızı hayata geçiren genel sekreterimiz, genel direktörlüğümüz ve departman başkanlarımız."
        />
      </div>

      {/* Yavaşça Yana Kayan Sonsuz Slayt Pisti */}
      <div className="relative mt-12 w-full overflow-hidden">
        {/* Sol ve Sağ Kenar Karartma Geçişleri (Fade) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-28 md:w-36" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-28 md:w-36" />

        {/* Sürekli Yavaşça Kayan Kart Şeridi (Üzerine gelince duraklar) */}
        <div className="animate-team-slide flex w-max gap-5 py-4 sm:gap-6">
          {duplicatedMembers.map((member, idx) => (
            <div
              key={`${member.id}-${idx}`}
              onClick={() => setActiveMember(member)}
              className="group relative aspect-[4/5] w-[260px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-xl shadow-black/80 transition-all duration-300 hover:border-accent/80 hover:shadow-[0_0_35px_rgba(234,179,8,0.22)] sm:w-[300px] md:w-[340px]"
            >
              <Image
                src={member.image}
                alt="ALÇAL'27 Ekip Afişi"
                fill
                sizes="(max-width: 640px) 260px, (max-width: 768px) 300px, 340px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-103"
                priority={idx < 4}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Büyük Boyut Afiş İnceleme Modalı */}
      {activeMember && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        >
          {/* Karartma Katmanı */}
          <div
            onClick={() => setActiveMember(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl transition-opacity animate-in fade-in-0 duration-200"
          />

          {/* Modal Gövdesi */}
          <div className="relative z-10 flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0b1220] shadow-2xl shadow-black/95 animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={() => setActiveMember(null)}
              className="absolute right-3.5 top-3.5 z-20 grid size-9 place-items-center rounded-full bg-black/75 text-white/90 backdrop-blur-md transition-colors hover:bg-black hover:text-white"
            >
              <X className="size-4.5" />
              <span className="sr-only">Kapat</span>
            </button>

            {/* Poster Görseli (Doğal 4:5 Oran) */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/70">
              <Image
                src={activeMember.image}
                alt="ALÇAL'27 Ekip Afişi"
                fill
                sizes="(max-width: 640px) 100vw, 512px"
                className="object-contain"
                priority
              />

              {/* Modal İçi Önceki/Sonraki Gezinme Okları */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateModal(-1);
                }}
                aria-label="Önceki afiş"
                className="absolute left-3 top-1/2 -translate-y-1/2 grid size-11 place-items-center rounded-full border border-white/20 bg-black/70 text-white backdrop-blur-md transition-all hover:bg-black hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="size-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateModal(1);
                }}
                aria-label="Sonraki afiş"
                className="absolute right-3 top-1/2 -translate-y-1/2 grid size-11 place-items-center rounded-full border border-white/20 bg-black/70 text-white backdrop-blur-md transition-all hover:bg-black hover:scale-110 active:scale-95"
              >
                <ChevronRight className="size-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
