"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Grid,
  Layers,
  Pause,
  Play,
  X,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import {
  teamCategories,
  teamMembers,
  type TeamCategory,
  type TeamMember,
} from "@/constants/team";
import { cn } from "@/lib/utils";

export function Team() {
  const [selectedCategory, setSelectedCategory] = useState<TeamCategory>("all");
  const [viewMode, setViewMode] = useState<"slideshow" | "grid">("slideshow");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activeModalMember, setActiveModalMember] = useState<TeamMember | null>(null);

  // Filtrelenmiş ekip listesi
  const filteredMembers = useMemo(() => {
    if (selectedCategory === "all") return teamMembers;
    return teamMembers.filter((m) => m.category === selectedCategory);
  }, [selectedCategory]);

  // Kategori değiştiğinde slayt indeksini başa al
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  const totalSlides = filteredMembers.length;
  const currentMember = filteredMembers[currentIndex] || filteredMembers[0];

  // Otomatik Oynatma (Slideshow modunda)
  useEffect(() => {
    if (!isAutoPlaying || viewMode !== "slideshow" || activeModalMember || totalSlides <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4500);

    return () => clearInterval(timer);
  }, [isAutoPlaying, viewMode, activeModalMember, totalSlides]);

  // Klavye Navigasyonu
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (activeModalMember) {
        if (e.key === "Escape") {
          setActiveModalMember(null);
        } else if (e.key === "ArrowLeft") {
          navigateModal(-1);
        } else if (e.key === "ArrowRight") {
          navigateModal(1);
        }
      } else if (viewMode === "slideshow") {
        if (e.key === "ArrowLeft") {
          handlePrev();
        } else if (e.key === "ArrowRight") {
          handleNext();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function handlePrev() {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }

  function handleNext() {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }

  // Modal içinde gezinme
  function navigateModal(direction: number) {
    if (!activeModalMember) return;
    const currentList = teamMembers;
    const currentIdx = currentList.findIndex((m) => m.id === activeModalMember.id);
    if (currentIdx === -1) return;

    const nextIdx = (currentIdx + direction + currentList.length) % currentList.length;
    setActiveModalMember(currentList[nextIdx]);
  }

  // Dokunmatik kaydırma (Touch Swipe)
  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  }

  return (
    <section id="ekibimiz" className="scroll-mt-20 px-5 py-20 sm:py-24 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Bölüm Başlığı ve Görünüm Seçici */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Organizasyon Ekibi"
            title="ALÇAL'27 Yönetim ve Departman Başkanları"
            lead="Çalıştayımızı hayata geçiren genel sekreterimiz, genel direktörlüğümüz ve departman başkanlarımız."
          />

          {/* Görünüm Seçici: Slayt vs Galeri */}
          <div className="flex items-center gap-1.5 self-start rounded-xl border border-border bg-card p-1 shadow-sm sm:self-end">
            <button
              type="button"
              onClick={() => setViewMode("slideshow")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                viewMode === "slideshow"
                  ? "bg-accent/15 text-accent shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Layers className="size-3.5" />
              <span>Slayt Gösterisi</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                viewMode === "grid"
                  ? "bg-accent/15 text-accent shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Grid className="size-3.5" />
              <span>Tüm Kadro</span>
            </button>
          </div>
        </div>

        {/* Departman Filtre Butonları */}
        <div className="no-scrollbar mt-8 flex items-center gap-2 overflow-x-auto pb-2">
          {teamCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-[12.5px] font-semibold transition-all",
                  isSelected
                    ? "border-accent bg-accent/15 text-accent shadow-sm shadow-accent/10"
                    : "border-border/80 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/10 hover:text-foreground",
                )}
              >
                <span>{cat.label}</span>
                <span
                  className={cn(
                    "tnum rounded-full px-1.5 py-0.2 text-[10.5px] font-bold",
                    isSelected
                      ? "bg-accent text-background"
                      : "bg-white/10 text-muted-foreground",
                  )}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* GÖRÜNÜM 1: BÜYÜK SİNEMA SLIDESHOW SAHNESİ                      */}
        {/* ============================================================== */}
        {viewMode === "slideshow" && (
          <div
            className="mt-10"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Üst Navigasyon Çubuğu */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="tnum rounded-lg border border-border bg-white/5 px-3 py-1 text-xs font-bold text-accent">
                  {String(currentIndex + 1).padStart(2, "0")} /{" "}
                  {String(totalSlides).padStart(2, "0")}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Afişe tıklayarak büyütebilirsiniz
                </span>
              </div>

              {/* Kontrol Düğmeleri */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  title={isAutoPlaying ? "Otomatik geçişi duraklat" : "Otomatik geçişi başlat"}
                  className="grid size-9 place-items-center rounded-lg border border-border bg-white/5 text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground active:scale-95"
                >
                  {isAutoPlaying ? (
                    <Pause className="size-3.5 text-accent" />
                  ) : (
                    <Play className="size-3.5" />
                  )}
                  <span className="sr-only">Otomatik Geçişi Değiştir</span>
                </button>

                <div className="h-4 w-px bg-border/60" />

                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={totalSlides <= 1}
                  aria-label="Önceki afiş"
                  className="grid size-9 place-items-center rounded-lg border border-border bg-white/5 text-muted-foreground transition-all hover:border-accent hover:bg-white/10 hover:text-foreground disabled:opacity-40 active:scale-95"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={totalSlides <= 1}
                  aria-label="Sonraki afiş"
                  className="grid size-9 place-items-center rounded-lg border border-border bg-white/5 text-muted-foreground transition-all hover:border-accent hover:bg-white/10 hover:text-foreground disabled:opacity-40 active:scale-95"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Sahne Vitrini: Yalnızca Tertemiz Orijinal Afiş (Üzerinde veya altında yazı/rozet YOK) */}
            <div className="relative mt-8 flex flex-col items-center">
              <div className="relative flex w-full items-center justify-center">
                {/* Yan Buton - Sol */}
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={totalSlides <= 1}
                  aria-label="Önceki afiş"
                  className="absolute -left-2 z-20 hidden md:grid size-12 place-items-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur-md transition-all hover:border-accent hover:bg-black hover:scale-105 active:scale-95 lg:-left-6"
                >
                  <ChevronLeft className="size-6" />
                </button>

                {/* Ana Afiş Kartı */}
                <div
                  onClick={() => setActiveModalMember(currentMember)}
                  className="group relative aspect-[4/5] w-full max-w-[360px] sm:max-w-[420px] md:max-w-[460px] cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-2xl shadow-black/90 transition-all duration-300 hover:border-accent/80 hover:shadow-[0_0_50px_rgba(234,179,8,0.25)]"
                >
                  <Image
                    src={currentMember.image}
                    alt="ALÇAL'27 Ekip Üyesi Afişi"
                    fill
                    sizes="(max-width: 640px) 360px, (max-width: 768px) 420px, 460px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                    priority
                  />
                </div>

                {/* Yan Buton - Sağ */}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={totalSlides <= 1}
                  aria-label="Sonraki afiş"
                  className="absolute -right-2 z-20 hidden md:grid size-12 place-items-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur-md transition-all hover:border-accent hover:bg-black hover:scale-105 active:scale-95 lg:-right-6"
                >
                  <ChevronRight className="size-6" />
                </button>
              </div>

              {/* Alt Küçük Afiş Önizleme Gezgini */}
              <div className="no-scrollbar mt-8 flex max-w-full items-center gap-2 overflow-x-auto px-4 py-2">
                {filteredMembers.map((member, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        "relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 sm:w-14",
                        isActive
                          ? "border-accent ring-2 ring-accent/50 scale-105"
                          : "border-border/60 opacity-50 hover:opacity-100 hover:border-white/30",
                      )}
                    >
                      <Image
                        src={member.image}
                        alt="Afiş Önizleme"
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* GÖRÜNÜM 2: TÜM KADRO GALERİ GRIDİ                             */}
        {/* ============================================================== */}
        {viewMode === "grid" && (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => setActiveModalMember(member)}
                className="group relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/80 hover:shadow-2xl hover:shadow-black/80"
              >
                <Image
                  src={member.image}
                  alt="ALÇAL'27 Ekip Üyesi Afişi"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-103"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* SİNEMA BOYUTUNDA BÜYÜK AFİŞ İNCELEME MODALI (LIGHTBOX)          */}
      {/* ============================================================== */}
      {activeModalMember && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        >
          {/* Karartma Katmanı */}
          <div
            onClick={() => setActiveModalMember(null)}
            className="fixed inset-0 bg-black/92 backdrop-blur-xl transition-opacity animate-in fade-in-0 duration-200"
          />

          {/* Modal Gövdesi */}
          <div className="relative z-10 flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0b1220] shadow-2xl shadow-black/95 animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={() => setActiveModalMember(null)}
              className="absolute right-3.5 top-3.5 z-20 grid size-9 place-items-center rounded-full bg-black/75 text-white/90 backdrop-blur-md transition-colors hover:bg-black hover:text-white"
            >
              <X className="size-4.5" />
              <span className="sr-only">Kapat</span>
            </button>

            {/* Poster Görseli (Doğal 4:5 Oran) */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/70">
              <Image
                src={activeModalMember.image}
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
