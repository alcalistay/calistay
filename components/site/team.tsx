"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Grid,
  Layers,
  Maximize2,
  Pause,
  Play,
  Sparkles,
  Users,
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

  // Kategori değiştiğinde indeksi sıfırla
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  const totalSlides = filteredMembers.length;
  const currentMember = filteredMembers[currentIndex] || filteredMembers[0];

  // Otomatik Oynatma Zamanlayıcısı (Slideshow modundayken)
  useEffect(() => {
    if (!isAutoPlaying || viewMode !== "slideshow" || activeModalMember || totalSlides <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4500);

    return () => clearInterval(timer);
  }, [isAutoPlaying, viewMode, activeModalMember, totalSlides]);

  // Klavye Navigasyonu (Slideshow ve Modal için)
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

  // Modal içinde bir sonraki/önceki üyeye geçme
  function navigateModal(direction: number) {
    if (!activeModalMember) return;
    const currentList = teamMembers;
    const currentIdx = currentList.findIndex((m) => m.id === activeModalMember.id);
    if (currentIdx === -1) return;

    const nextIdx = (currentIdx + direction + currentList.length) % currentList.length;
    setActiveModalMember(currentList[nextIdx]);
  }

  // Dokunmatik kaydırma (Touch Swipe) desteği
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
        {/* Başlık ve Görünüm Seçici */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Organizasyon Ekibi"
            title="ALÇAL'27 Yönetim ve Departman Başkanları"
            lead="Çalıştayımızı hayata geçiren genel sekreterimiz, genel direktörlüğümüz ve departman başkanlarımız."
          />

          {/* Görünüm Modu Değiştirici: Slayt vs Galeri */}
          <div className="flex items-center gap-2 self-start rounded-xl border border-border bg-card p-1 shadow-sm sm:self-end">
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

        {/* Departman Filtreleme Sekmeleri */}
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
            {/* Üst Kontrol & İlerleme Çubuğu */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="tnum rounded-lg border border-border bg-white/5 px-3 py-1 text-xs font-bold text-accent">
                  {String(currentIndex + 1).padStart(2, "0")} /{" "}
                  {String(totalSlides).padStart(2, "0")}
                </span>

                <div className="hidden items-center gap-2 sm:flex">
                  <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {currentMember?.department}
                  </span>
                  {currentMember?.isCoHead && (
                    <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                      Eş Başkan
                    </span>
                  )}
                </div>
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
                  aria-label="Önceki üye"
                  className="grid size-9 place-items-center rounded-lg border border-border bg-white/5 text-muted-foreground transition-all hover:border-accent hover:bg-white/10 hover:text-foreground disabled:opacity-40 active:scale-95"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={totalSlides <= 1}
                  aria-label="Sonraki üye"
                  className="grid size-9 place-items-center rounded-lg border border-border bg-white/5 text-muted-foreground transition-all hover:border-accent hover:bg-white/10 hover:text-foreground disabled:opacity-40 active:scale-95"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Sahne Vitrini (Cinema Stage) */}
            <div className="relative mt-8 flex flex-col items-center">
              {/* Ortadaki Aktif Kart Vitrini */}
              <div className="w-full max-w-[360px] sm:max-w-[420px] md:max-w-[460px]">
                <div
                  onClick={() => setActiveModalMember(currentMember)}
                  className="group relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-2xl shadow-black/80 transition-all duration-300 hover:border-accent/80 hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]"
                >
                  {/* Afiş Görseli - Doğal renk ve tam netlik, üzerine karartma BİNMEZ */}
                  <Image
                    src={currentMember.image}
                    alt={currentMember.name}
                    fill
                    sizes="(max-width: 640px) 360px, (max-width: 768px) 420px, 460px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                    priority
                  />

                  {/* Köşe Rozetleri */}
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-3 py-1 text-[11px] font-semibold text-white/95 backdrop-blur-md">
                      <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                      {currentMember.department}
                    </span>

                    <span className="grid size-8 place-items-center rounded-full border border-white/20 bg-black/75 text-white/90 backdrop-blur-md transition-all group-hover:bg-accent group-hover:text-background">
                      <Maximize2 className="size-3.5" />
                    </span>
                  </div>

                  {/* Hover durumunda çok hafif cam efekti ipucu */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/60 py-3 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Expand className="size-3.5 text-accent" />
                      Tam Boyut İncele
                    </span>
                  </div>
                </div>

                {/* Kartın Altındaki Şık ve Net Bilgi Alanı (Görseli Asla Kapatmaz!) */}
                <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {currentMember.name}
                    </h3>
                    <p className="mt-0.5 text-sm font-medium text-accent">
                      {currentMember.role}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModalMember(currentMember)}
                    className="inline-flex items-center gap-1 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-background"
                  >
                    <span>İncele</span>
                    <Maximize2 className="size-3" />
                  </button>
                </div>
              </div>

              {/* Alt Thumbnail / Nokta Gezgini */}
              <div className="no-scrollbar mt-8 flex max-w-full items-center gap-2 overflow-x-auto px-4 py-2">
                {filteredMembers.map((member, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      title={`${member.name} (${member.role})`}
                      className={cn(
                        "group relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 sm:w-14",
                        isActive
                          ? "border-accent ring-2 ring-accent/40 scale-105"
                          : "border-border/60 opacity-50 hover:opacity-100 hover:border-white/30",
                      )}
                    >
                      <Image
                        src={member.image}
                        alt={member.name}
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
            {filteredMembers.map((member, idx) => (
              <div
                key={member.id}
                onClick={() => setActiveModalMember(member)}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-2 transition-all duration-300 hover:-translate-y-1 hover:border-accent/70 hover:shadow-2xl hover:shadow-black/70"
              >
                {/* 4:5 Poster Çerçevesi */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black/60">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-104"
                  />

                  {/* Üst Rozet */}
                  <div className="absolute left-2.5 top-2.5 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/70 px-2.5 py-0.5 text-[10px] font-semibold text-white/95 backdrop-blur-md">
                      {member.department}
                    </span>
                  </div>

                  {/* Büyütme İkonu */}
                  <div className="absolute right-2.5 top-2.5 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="grid size-7 place-items-center rounded-full bg-accent text-background shadow-md">
                      <Maximize2 className="size-3" />
                    </span>
                  </div>
                </div>

                {/* Alt Başlık Bilgisi */}
                <div className="p-3">
                  <h4 className="line-clamp-1 text-[15px] font-bold text-foreground">
                    {member.name}
                  </h4>
                  <p className="mt-0.5 text-[12.5px] font-medium text-accent">
                    {member.role}
                  </p>
                </div>
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
          {/* Karartma ve Bulanıklık Katmanı */}
          <div
            onClick={() => setActiveModalMember(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl transition-opacity animate-in fade-in-0 duration-200"
          />

          {/* Modal Gövdesi */}
          <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0b1220] shadow-2xl shadow-black/95 animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Modal Üst Çubuk */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-black/40">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  {activeModalMember.department}
                </span>
                {activeModalMember.isCoHead && (
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/80">
                    Eş Başkan
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveModalMember(null)}
                className="grid size-8 place-items-center rounded-full bg-white/10 text-muted-foreground transition-colors hover:bg-white/20 hover:text-foreground"
              >
                <X className="size-4" />
                <span className="sr-only">Kapat</span>
              </button>
            </div>

            {/* Poster Görseli (Doğal 4:5 Oran) */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/60">
              <Image
                src={activeModalMember.image}
                alt={activeModalMember.name}
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
                aria-label="Önceki kişi"
                className="absolute left-3 top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/90 hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateModal(1);
                }}
                aria-label="Sonraki kişi"
                className="absolute right-3 top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/90 hover:scale-110 active:scale-95"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            {/* Modal Alt Bilgi ve Klavye İpucu */}
            <div className="border-t border-white/10 bg-[#080d17] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {activeModalMember.name}
                  </h3>
                  <p className="mt-0.5 text-sm font-medium text-accent">
                    {activeModalMember.role}
                  </p>
                </div>

                <div className="hidden text-right text-[11px] text-muted-foreground sm:block">
                  <span>Gezinmek için </span>
                  <kbd className="rounded border border-white/20 bg-white/10 px-1 py-0.5 font-mono text-[10px] text-white">
                    ←
                  </kbd>{" "}
                  <kbd className="rounded border border-white/20 bg-white/10 px-1 py-0.5 font-mono text-[10px] text-white">
                    →
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}