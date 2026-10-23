"use client";

import { Stagger, StaggerItem } from "@/components/fx/reveal";
import { SectionHeading } from "./section-heading";
import { committees, type Committee } from "@/constants/committees";

export function Committees() {
  return (
    <section id="komiteler" className="scroll-mt-20 px-5 py-20 sm:py-24 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="Komiteler"
          title="Çalıştayımızda yer alacak komiteler"
        />

        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" amount={0.08}>
          {committees.map((committee) => (
            <StaggerItem key={committee.id} className="h-full">
              <CommitteeCard committee={committee} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function CommitteeCard({ committee }: { committee: Committee }) {
  const Icon = committee.icon;

  return (
    <div
      // `--glow`, glow-card yardımcısının okuduğu renk: her kart kendi tonuyla ışır.
      style={{ "--glow": committee.accent } as React.CSSProperties}
      className="glow-card group relative flex h-full flex-col items-center justify-center overflow-hidden rounded-lg border border-border bg-card px-6 py-10 text-center"
    >
      {/* Üst kenarda komitenin rengiyle beliren ince şerit */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px origin-center scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
        style={{ backgroundColor: committee.accent }}
      />

      <span
        className="tnum text-xs font-semibold"
        style={{ color: `color-mix(in oklch, ${committee.accent} 62%, transparent)` }}
      >
        {committee.no}
      </span>

      {/* Komitenin kendi rengi: ikon kutusu. Doygunluğu düşük tutuldu ki
          sekiz kart yan yana durduğunda alacalı görünmesin. */}
      <span
        className="mt-4 grid size-11 place-items-center rounded-lg"
        style={{
          backgroundColor: `color-mix(in oklch, ${committee.accent} 14%, transparent)`,
        }}
      >
        <Icon className="size-5" style={{ color: committee.accent }} />
      </span>

      <h3 className="mt-4 text-base font-semibold leading-tight text-card-foreground">
        {committee.name}
      </h3>
    </div>
  );
}
