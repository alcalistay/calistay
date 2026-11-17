"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, GraduationCap, PenLine, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { schools, School, OTHER_SCHOOL_VALUE } from "@/constants/schools";

type SchoolComboboxProps = {
  value: string;
  otherValue: string;
  onChange: (school: string, schoolOther: string) => void;
  error?: string;
};

// Türkçe arama uyumlu küçük harf dönüştürücü
function normalizeTurkish(str: string): string {
  return str
    .toLocaleLowerCase("tr")
    .replace(/i̇/g, "i")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

export function SchoolCombobox({
  value,
  otherValue,
  onChange,
  error,
}: SchoolComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(value === OTHER_SCHOOL_VALUE);

  // Dışarı tıklayınca menüyü kapat
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrelenmiş okul listesi
  const filteredSchools = useMemo(() => {
    const q = normalizeTurkish(search);
    if (!q) {
      // Varsayılan olarak en çok öğrencisi olan merkez ilçeler (Odunpazarı & Tepebaşı) başta gelsin
      return [...schools].sort((a, b) => {
        const isACentral = a.district === "Odunpazarı" || a.district === "Tepebaşı";
        const isBCentral = b.district === "Odunpazarı" || b.district === "Tepebaşı";
        if (isACentral && !isBCentral) return -1;
        if (!isACentral && isBCentral) return 1;
        return a.name.localeCompare(b.name, "tr");
      });
    }

    return schools.filter((s) => {
      const matchName = normalizeTurkish(s.name).includes(q);
      const matchDistrict = normalizeTurkish(s.district).includes(q);
      const matchType = normalizeTurkish(s.type).includes(q);
      return matchName || matchDistrict || matchType;
    });
  }, [search]);

  // Bir devlet okulu seçildiğinde
  function selectSchool(s: School) {
    setIsCustomMode(false);
    onChange(s.name, "");
    setIsOpen(false);
    setSearch("");
  }

  // Özel / Listedışı okul seçildiğinde
  function switchToCustomMode(initialText = "") {
    setIsCustomMode(true);
    onChange(OTHER_SCHOOL_VALUE, initialText);
    setIsOpen(false);
    setSearch("");
  }

  // Seçimi temizleme / değiştirme
  function clearSelection() {
    onChange("", "");
    setIsCustomMode(false);
    setSearch("");
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // Şu an seçili olan etiket
  const isSelected = Boolean(value);
  const selectedLabel =
    value === OTHER_SCHOOL_VALUE
      ? otherValue ? `${otherValue} (Diğer)` : "Diğer"
      : value;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 1. DURUM: DİĞER SEÇİLDİĞİNDE ELLE OKUL GİRİŞİ */}
      {isCustomMode ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-accent">
              Diğer
            </span>
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(false);
                onChange("", "");
                setIsOpen(true);
              }}
              className="text-[12px] text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
            >
              ← Liselerden Seç
            </button>
          </div>

          <div className="relative">
            <input
              id={id}
              type="text"
              value={otherValue}
              onChange={(e) => onChange(OTHER_SCHOOL_VALUE, e.target.value)}
              placeholder="Okulunuzun adını yazınız..."
              className={cn(
                "h-11 w-full rounded-md border border-input bg-white/5 px-3.5 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20",
                error && "border-destructive",
              )}
              autoFocus
            />
            {otherValue && (
              <button
                type="button"
                onClick={() => onChange(OTHER_SCHOOL_VALUE, "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      ) : isSelected && !isOpen ? (
        /* 2. DURUM: OKUL SEÇİLMİŞ VE KUTU KAPALI */
        <div
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className={cn(
            "group flex h-11 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-white/5 px-3.5 text-[14px] transition-all duration-200 hover:border-accent/50 hover:bg-white/[0.07]",
            error && "border-destructive",
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <GraduationCap className="size-4 shrink-0 text-accent" />
            <span className="truncate font-medium text-foreground">
              {selectedLabel}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              title="Okulu Değiştir"
              className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[11.5px] font-medium text-muted-foreground transition-colors hover:bg-accent/20 hover:text-accent"
            >
              <PenLine className="size-3" />
              <span>Değiştir</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3. DURUM: ARAMA / SEÇİM ALANI (Açık ve arama yapılabilir) */
        <div className="relative">
          <div
            className={cn(
              "flex h-11 w-full items-center rounded-md border border-input bg-white/5 transition-all focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
              error && "border-destructive",
            )}
          >
            <Search className="ml-3.5 size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              placeholder="Okul adını yazın... (Örn: Atatürk, Fatih, Fen)"
              className="h-full w-full bg-transparent px-2.5 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/60"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mr-2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="mr-2 p-1.5 text-muted-foreground transition-transform hover:text-foreground"
            >
              <ChevronDown
                className={cn("size-4 transition-transform duration-200", isOpen && "rotate-180")}
              />
            </button>
          </div>
        </div>
      )}

      {/* AÇILIR MENÜ (DARK POPOVER) */}
      {isOpen && !isCustomMode && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-xl border border-border/80 bg-[#0c1424] p-2 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Diğer Butonu */}
          <button
            type="button"
            onClick={() => switchToCustomMode(search)}
            className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-white/4 px-3 py-2.5 text-left text-[13px] font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-accent/15 hover:text-accent"
          >
            <span className="flex items-center gap-2">
              <Plus className="size-4 shrink-0 text-accent" />
              <span>Diğer</span>
            </span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              Elle Gir
            </span>
          </button>

          <div className="my-2 border-t border-border/60" />

          {/* Okul Listesi */}
          <div className="max-h-64 overflow-y-auto pr-1">
            {filteredSchools.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[13px] text-muted-foreground">
                  &ldquo;{search}&rdquo; ile eşleşen lise bulunamadı.
                </p>
                <button
                  type="button"
                  onClick={() => switchToCustomMode(search)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-accent/20 px-3 py-1.5 text-[12.5px] font-semibold text-accent transition-colors hover:bg-accent/30"
                >
                  <Plus className="size-3.5" />
                  Diğer olarak yaz
                </button>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Eskişehir Liseleri ({filteredSchools.length} Sonuç)
                </div>

                {filteredSchools.map((s) => {
                  const isCur = value === s.name;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectSchool(s)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors duration-150",
                        isCur
                          ? "bg-accent/20 text-accent font-medium"
                          : "text-foreground hover:bg-white/6",
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="truncate text-[13.5px] font-medium">
                          {s.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                          <span className="font-semibold text-accent/80">
                            {s.district}
                          </span>
                          <span>•</span>
                          <span>{s.type}</span>
                        </div>
                      </div>

                      {isCur && <Check className="size-4 shrink-0 text-accent" />}
                    </button>
                  );
                })}

                {/* Listenin en altında da Diğer seçeneği */}
                <button
                  type="button"
                  onClick={() => switchToCustomMode(search)}
                  className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-muted-foreground transition-colors hover:bg-white/6 hover:text-accent"
                >
                  <span className="flex items-center gap-2 text-[13px] font-medium">
                    <Plus className="size-3.5" />
                    <span>Diğer</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
