"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/fx/reveal";
import { supportAreas } from "@/constants/sponsorship";
import { useSettings } from "@/components/providers/settings-provider";

/**
 * Ana sayfanın sonundaki sponsorluk bloğu.
 * Detaylar ve başvuru formu ayrı bir sayfada (/sponsor) tutuluyor;
 * burada yalnızca kısa bir özet ve yönlendirme var.
 */
export function SponsorCta() {
  const { settings, loading } = useSettings();

  // Sayfa kapalıysa ana sayfada da yönlendirme gösterilmez.
  if (loading || !settings.sponsorPageEnabled) return null;

  return (
    <section className="px-5 pb-20 sm:pb-24 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <div className="glow-card card-sheen rounded-xl border border-border bg-card p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
              <div>
                <span className="kicker text-accent">Sponsorluk</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl">
                  Etkinliğe destek olmak ister misiniz?
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                  ALÇAL&rsquo;26 tamamen öğrenciler tarafından yürütülüyor.
                  Mekân giderlerinden basılı materyale, katılımcı setlerinden
                  ikram ve lojistiğe kadar {supportAreas.length} başlıkta kurum
                  desteğine ihtiyaç duyuyoruz. Destek alanlarının tamamını ve
                  sponsorlarımıza sunduklarımızı sponsorluk sayfasında
                  bulabilirsiniz.
                </p>

                <Link
                  href="/sponsor"
                  className="group mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:glow-primary"
                >
                  Sponsorluk sayfasına git
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>

              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {supportAreas.map((area) => {
                  const Icon = area.icon;
                  return (
                    <li
                      key={area.title}
                      className="flex items-center gap-3 rounded-md border border-border bg-white/4 px-4 py-3"
                    >
                      <Icon className="size-4 shrink-0 text-accent" />
                      <span className="text-[13.5px] text-muted-foreground">
                        {area.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
