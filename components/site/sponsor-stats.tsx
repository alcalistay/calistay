"use client";

import { Stagger, StaggerItem } from "@/components/fx/reveal";
import { useSettings } from "@/components/providers/settings-provider";
import { stats } from "@/constants/event";

/** Sponsorluk sayfasının üstündeki etkinlik özeti. Sayılar panelden gelir. */
export function SponsorStats() {
  const { settings } = useSettings();

  const liveStats = stats.map((stat) => {
    if (stat.label === "Toplam katılımcı")
      return { ...stat, value: settings.totalParticipants };
    if (stat.label === "Delege") return { ...stat, value: settings.delegates };
    return stat;
  });

  return (
    <Stagger className="mt-10 grid gap-4 border-y border-border py-8 sm:grid-cols-2 lg:grid-cols-4">
      {liveStats.map((stat) => (
        <StaggerItem key={stat.label}>
          <p className="tnum flex items-start text-2xl font-bold tracking-tight text-foreground">
            {/* 1930 bir yıl; binlik ayracı almamalı. */}
            {stat.value < 1900
              ? stat.value.toLocaleString("tr-TR")
              : String(stat.value)}
            {stat.estimated && (
              <span
                aria-hidden
                className="ml-0.5 text-base text-accent"
                title="Tahmini sayı"
              >
                *
              </span>
            )}
          </p>
          <p className="mt-1 text-[13px] font-medium text-foreground">
            {stat.label}
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
            {stat.detail}
          </p>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
