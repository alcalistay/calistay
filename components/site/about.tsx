"use client";

import Image from "next/image";
import { Reveal } from "@/components/fx/reveal";
import { SectionHeading } from "./section-heading";
import { Timeline } from "./timeline";
import { aboutParagraphs, event } from "@/constants/event";

export function About() {
  return (
    <section id="hakkinda" className="scroll-mt-20 px-5 py-20 sm:py-24 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="Hakkında"
          title="Çalıştay nedir?"
          lead="Çalıştay, katılımcıların belirli komitelerde toplanıp küresel ve toplumsal konuları tartıştığı ve çözüm önerileri sunarak sonuca vardığı bir konferans modelidir."
        />

        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {aboutParagraphs.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <p className="text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Organizatör kurum — mühür solda, zaman çizelgesi sağda */}
        <div className="mt-20 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <span className="kicker text-accent">Organizatör kurum</span>

              <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {event.school}
              </h3>

              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Okulun temelleri Osmanlı dönemindeki Rüştiye Mektebi&rsquo;ne
                kadar uzanır. Akademik başarısının yanı sıra öğrencilerinin
                sosyal, kültürel ve entelektüel gelişimine önem veren okulumuz,
                her yıl çeşitli bilimsel ve sanatsal etkinliklere öncülük
                etmektedir.
              </p>

              <div className="card-sheen mt-8 flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                <Image
                  src="/logo-white.png"
                  alt=""
                  width={56}
                  height={56}
                  className="size-14 shrink-0 object-contain opacity-90"
                />
                <div>
                  <p className="text-[13.5px] font-medium text-foreground">
                    {event.venue.name}
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                    {event.venue.district} / {event.venue.city}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="kicker text-muted-foreground">
                Rüştiye&rsquo;den bugüne
              </p>
            </Reveal>

            <Timeline />
          </div>
        </div>
      </div>
    </section>
  );
}
