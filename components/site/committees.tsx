"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, X } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/fx/reveal";
import { SectionHeading } from "./section-heading";
import { committees, type Committee, type CommitteeLevel } from "@/constants/committees";
import { cn } from "@/lib/utils";

function levelBadgeColor(level: CommitteeLevel) {
  switch (level) {
    case "Kolay Seviye":
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-400";
    case "Orta Seviye":
      return "border-amber-500/30 bg-amber-500/15 text-amber-400";
    case "Zor Seviye":
      return "border-rose-500/30 bg-rose-500/15 text-rose-400";
    default:
      return "border-accent/30 bg-accent/15 text-accent";
  }
}

export function Committees() {
  const [activeCommittee, setActiveCommittee] = useState<Committee | null>(null);

  // Modal açıkken ESC tuşu ile kapatma
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveCommittee(null);
    }
    if (activeCommittee) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeCommittee]);

  return (
    <section id="komiteler" className="scroll-mt-20 px-5 py-20 sm:py-24 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="Komiteler"
          title="Çalıştayımızda yer alacak komiteler"
          lead="Komite kartlarına tıklayarak komitelerin gündem maddelerini, seviyelerini ve ele alacakları konuları detaylı olarak inceleyebilirsiniz."
        />

        {/* Mobilde tek sütun geniş ve ferah kartlar, tablette 2, masaüstünde 4 sütun */}
        <Stagger
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          amount={0.08}
        >
          {committees.map((committee) => (
            <StaggerItem key={committee.id} className="h-full">
              <CommitteeCard
                committee={committee}
                onClick={() => setActiveCommittee(committee)}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {/* DETAY PENCERESİ (MODAL) — Mobilde kaydırılabilir ve ferah */}
      {activeCommittee && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        >
          {/* Karartma Arka Plan */}
          <div
            onClick={() => setActiveCommittee(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
          />

          {/* Modal Kartı: Mobilde taşmayı önleyen max-h ve overflow-y-auto */}
          <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-y-auto rounded-3xl border border-border/80 bg-[#0c1424] shadow-2xl shadow-black/90 animate-in fade-in-0 zoom-in-95 duration-200 sm:overflow-hidden">
            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={() => setActiveCommittee(null)}
              className="absolute right-3.5 top-3.5 z-30 grid size-9 place-items-center rounded-full bg-black/75 text-white/90 backdrop-blur-md transition-colors hover:bg-black hover:text-white"
            >
              <X className="size-4.5" />
              <span className="sr-only">Kapat</span>
            </button>

            <div className="grid sm:grid-cols-[280px_1fr] sm:items-stretch">
              {/* Sol: Komite Görseli (Mobilde 16:9 banner, masaüstünde 4:5 tam afiş) */}
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-black/60 sm:aspect-[4/5] sm:h-full">
                <Image
                  src={activeCommittee.image}
                  alt={activeCommittee.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 280px"
                  priority
                />
              </div>

              {/* Sağ: Bilgi & Açıklama */}
              <div className="flex flex-col justify-between p-5 sm:p-7 md:p-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tnum rounded border border-border bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                      Komite {activeCommittee.no}
                    </span>
                    <span
                      className={cn(
                        "rounded border px-2.5 py-0.5 text-[11px] font-semibold",
                        levelBadgeColor(activeCommittee.level),
                      )}
                    >
                      {activeCommittee.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <activeCommittee.icon className="size-6 text-accent" />
                    <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {activeCommittee.name} Komitesi
                    </h3>
                  </div>

                  {/* Gündem Maddesi */}
                  <div className="rounded-xl border border-accent/25 bg-accent/5 p-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                      <BookOpen className="size-3.5" />
                      Gündem Maddesi
                    </div>
                    <p className="mt-1.5 text-[13.5px] font-medium leading-relaxed text-foreground sm:text-[14px]">
                      &ldquo;{activeCommittee.agenda}&rdquo;
                    </p>
                  </div>

                  {/* Açıklama */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Komite Tanıtımı
                    </h4>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground sm:text-[13.5px]">
                      {activeCommittee.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-border/60 pt-4 sm:mt-8">
                  <Link
                    href="#basvuru"
                    onClick={() => setActiveCommittee(null)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:glow-primary"
                  >
                    <span>Bu Komiteye Başvur</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CommitteeCard({
  committee,
  onClick,
}: {
  committee: Committee;
  onClick: () => void;
}) {
  const Icon = committee.icon;

  return (
    <div
      onClick={onClick}
      style={{ "--glow": committee.accent } as React.CSSProperties}
      className="group relative flex aspect-[4/5] w-full max-w-[380px] mx-auto cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-5 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/80 hover:shadow-2xl hover:shadow-black/70 sm:max-w-none"
    >
      {/* Arka Plan Görseli (1080x1350 Poster) */}
      <Image
        src={committee.image}
        alt={committee.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-104"
      />

      {/* Karartma Gradyanı: Yalnızca alt ve üstte metin okunurluğu için, afişi boğmaz */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-black/30 transition-opacity duration-300 group-hover:from-black group-hover:via-black/45" />

      {/* Üst Kısım: Komite No ve Seviye Rozeti */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="tnum rounded-lg border border-white/15 bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white/95 backdrop-blur-md">
          Komite {committee.no}
        </span>

        <span
          className={cn(
            "rounded-lg border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
            levelBadgeColor(committee.level),
          )}
        >
          {committee.level}
        </span>
      </div>

      {/* Alt Kısım: İsim ve Tıkla İpucu */}
      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-black/60 text-accent backdrop-blur-sm">
            <Icon className="size-4" style={{ color: committee.accent }} />
          </span>
          <h3 className="text-xl font-bold leading-tight text-white drop-shadow-md">
            {committee.name}
          </h3>
        </div>

        <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-white/80">
          {committee.agenda}
        </p>

        <div className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-accent transition-all group-hover:translate-x-1">
          <span>Detayları İncele</span>
          <ArrowRight className="size-3.5" />
        </div>
      </div>
    </div>
  );
}
