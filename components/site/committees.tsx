"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Stagger, StaggerItem } from "@/components/fx/reveal";
import { SectionHeading } from "./section-heading";
import { committees, type Committee } from "@/constants/committees";

export function Committees() {
  const [selected, setSelected] = useState<Committee | null>(null);

  return (
    <section id="komiteler" className="scroll-mt-20 px-5 py-20 sm:py-24 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="Komiteler"
          title="Komiteler ve gündemleri"
          lead="Çalıştayda sekiz komite yer alacak. Her komite kendi gündem maddesi üzerinde çalışacak ve oturumların sonunda bir komite raporu hazırlayacak."
        />

        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" amount={0.08}>
          {committees.map((committee) => (
            <StaggerItem key={committee.id} className="h-full">
              <CommitteeCard
                committee={committee}
                onOpen={() => setSelected(committee)}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <CommitteeDialog
        committee={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </section>
  );
}

function CommitteeCard({
  committee,
  onOpen,
}: {
  committee: Committee;
  onOpen: () => void;
}) {
  const Icon = committee.icon;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${committee.name} komitesinin detaylarını aç`}
      // `--glow`, glow-card yardımcısının okuduğu renk: her kart kendi tonuyla ışır.
      style={{ "--glow": committee.accent } as React.CSSProperties}
      className="glow-card group relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-border bg-card p-6 text-left hover:-translate-y-1 hover:border-accent/30 hover:bg-white/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Üst kenarda komitenin rengiyle beliren ince şerit */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
        style={{ backgroundColor: committee.accent }}
      />

      <div className="flex items-start justify-between">
        {/* Komitenin kendi rengi: ikon kutusu ve numara. Doygunluğu düşük
            tutuldu ki sekiz kart yan yana durduğunda alacalı görünmesin. */}
        <span
          className="grid size-10 place-items-center rounded-lg transition-colors duration-300"
          style={{
            backgroundColor: `color-mix(in oklch, ${committee.accent} 14%, transparent)`,
          }}
        >
          <Icon className="size-5" style={{ color: committee.accent }} />
        </span>

        <span
          className="tnum text-xs font-semibold"
          style={{ color: `color-mix(in oklch, ${committee.accent} 62%, transparent)` }}
        >
          {committee.no}
        </span>
      </div>

      <h3 className="mt-5 text-base font-semibold leading-tight text-card-foreground">
        {committee.name}
      </h3>

      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        {committee.agenda}
      </p>

      <span className="mt-auto flex items-center gap-1.5 pt-5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
        Detayları gör
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </button>
  );
}

function CommitteeDialog({
  committee,
  onOpenChange,
}: {
  committee: Committee | null;
  onOpenChange: (open: boolean) => void;
}) {
  const Icon = committee?.icon;

  return (
    <Dialog open={Boolean(committee)} onOpenChange={onOpenChange}>
      {/* Açıklamalar uzun olabildiği için içerik kendi içinde kaydırılır. */}
      <DialogContent className="max-h-[85svh] max-w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-xl p-7 sm:max-w-xl">
        {committee && Icon && (
          <>
            <DialogHeader className="space-y-0 text-left">
              <div className="flex items-center gap-3">
                <span
                  className="grid size-10 place-items-center rounded-lg"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${committee.accent} 14%, transparent)`,
                  }}
                >
                  <Icon className="size-5" style={{ color: committee.accent }} />
                </span>
                <div>
                  <span className="tnum block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Komite {committee.no}
                  </span>
                  <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                    {committee.name}
                  </DialogTitle>
                </div>
              </div>

              <DialogDescription className="sr-only">
                {committee.name} komitesinin gündemi ve ayrıntılı açıklaması
              </DialogDescription>
            </DialogHeader>

            {/* Resmî gündem maddesi — komitenin rengiyle işaretlenmiş alıntı */}
            <div
              className="mt-6 rounded-lg border-l-2 bg-white/4 py-3.5 pl-4 pr-4"
              style={{ borderLeftColor: committee.accent }}
            >
              <p className="kicker mb-1.5 text-muted-foreground">Gündem</p>
              <p className="text-[14.5px] font-medium leading-snug text-foreground">
                {committee.agenda}
              </p>
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <p className="kicker mb-3 text-muted-foreground">
                Gündem hakkında
              </p>
              <div className="space-y-3.5">
                {committee.details.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-pretty text-[14px] leading-[1.7] text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
