"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { committees, Committee } from "@/constants/committees";

type CommitteeSelectProps = {
  slotLabel: string;
  value: string;
  onChange: (id: string) => void;
  /** Diğer tercihlerde seçilmiş olan komite id'leri */
  disabledIds?: string[];
  error?: string;
};

export function CommitteeSelect({
  slotLabel,
  value,
  onChange,
  disabledIds = [],
  error,
}: CommitteeSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCommittee = committees.find((c) => c.id === value);

  function handleSelect(c: Committee) {
    onChange(c.id);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-md border border-input bg-white/5 px-3 text-left text-[13.5px] transition-all duration-200 hover:border-accent/40 focus:border-ring focus:ring-2 focus:ring-ring/20",
          error && "border-destructive",
          selectedCommittee ? "text-foreground font-medium" : "text-muted-foreground",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {selectedCommittee ? (
            <>
              <selectedCommittee.icon className="size-4 shrink-0 text-accent" />
              <span className="truncate">{selectedCommittee.name}</span>
            </>
          ) : (
            <span>Seçiniz</span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* AÇILIR KOMİTE LİSTESİ (DARK POPOVER - ASLA BEMBEYAZ DEĞİL) */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[220px] rounded-xl border border-border/80 bg-[#0c1424] p-1.5 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {slotLabel} Komitesi Seçin
          </div>

          <div className="mt-1 space-y-0.5">
            {committees.map((c) => {
              const isSelected = value === c.id;
              const isDisabled = !isSelected && disabledIds.includes(c.id);

              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelect(c)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                    isSelected
                      ? "bg-accent/20 text-accent font-medium"
                      : isDisabled
                        ? "cursor-not-allowed opacity-35 text-muted-foreground"
                        : "text-foreground hover:bg-white/6",
                  )}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <c.icon
                      className={cn(
                        "size-4 shrink-0",
                        isSelected ? "text-accent" : "text-muted-foreground",
                      )}
                    />
                    <span className="truncate">{c.name}</span>
                  </span>

                  {isSelected && <Check className="size-4 shrink-0 text-accent" />}
                  {isDisabled && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">
                      Seçildi
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
