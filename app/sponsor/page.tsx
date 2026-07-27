import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { SponsorForm } from "@/components/site/sponsor-form";
import { SponsorGate } from "@/components/site/sponsor-gate";
import { SponsorStats } from "@/components/site/sponsor-stats";
import { Reveal, Stagger, StaggerItem } from "@/components/fx/reveal";
import { event } from "@/constants/event";
import { sponsorBenefits, supportAreas } from "@/constants/sponsorship";

export const metadata: Metadata = {
  title: "Sponsorluk",
  description: `${event.shortName} sponsorluk ve destek alanları, sponsorlarımıza sunulan imkânlar ve başvuru formu.`,
};

export default function SponsorPage() {
  return (
    <>
      <Navbar observeSections={false} activePath="/sponsor" />

      <main className="flex-1 px-5 pt-28 lg:px-8">
        <SponsorGate>
        <div className="mx-auto w-full max-w-6xl">
          {/* Sayfa başlığı */}
          <Reveal>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Ana sayfa
            </Link>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Sponsorluk ve destek
            </h1>

            <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {event.name}, lise öğrencilerinin tamamen kendi inisiyatifleriyle
              yürüttüğü akademik, lojistik ve sosyal açıdan büyük ölçekli bir
              organizasyondur. Etkinliğin eksiksiz ve verimli bir şekilde
              tamamlanabilmesi için kurum ve kuruluşların desteğine ihtiyaç
              duyuyoruz.
            </p>
          </Reveal>

          {/* Etkinlik özeti */}
          <SponsorStats />

          {/* Destek alanları */}
          <section className="pt-14">
            <Reveal>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Destek talep edilen alanlar
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                Aşağıdaki başlıklarda ayni ya da nakdi destek kabul edilmektedir.
                Bir veya birden fazla alanda destek sunabilirsiniz.
              </p>
            </Reveal>

            <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {supportAreas.map((area, i) => {
                const Icon = area.icon;
                return (
                  <StaggerItem key={area.title} className="h-full">
                    <div className="glow-card card-sheen group h-full rounded-lg border border-border bg-card p-6 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-white/6">
                      <div className="flex items-start justify-between">
                        <span className="grid size-10 place-items-center rounded-lg bg-white/6 transition-colors group-hover:bg-white/10">
                          <Icon className="size-5 text-accent" />
                        </span>
                        <span className="tnum text-xs font-semibold text-muted-foreground/60">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <h3 className="mt-5 text-[15px] font-semibold text-card-foreground">
                        {area.title}
                      </h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                        {area.description}
                      </p>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </section>

          {/* Sponsorlara sunulanlar */}
          <section className="pt-16">
            <Reveal>
              <div className="card-sheen rounded-xl border border-border bg-card p-8 sm:p-10">
                <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
                  <div>
                    <span className="kicker text-accent">Sponsorlarımıza</span>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-card-foreground">
                      Destekleriniz karşılığında sunduklarımız
                    </h2>
                    <p className="mt-4 text-[14.5px] leading-relaxed text-muted-foreground">
                      Destekçilerimiz, nitelikli eğitim fırsatlarının
                      yaygınlaşmasına katkı sunarken kurumsal markalarını genç
                      ve dinamik bir katılımcı kitlesiyle buluşturur. Paket ve
                      bütçe kademeleri talebinize göre birlikte belirlenir.
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {sponsorBenefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex gap-3 rounded-md border border-border bg-white/4 px-4 py-3"
                      >
                        <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-white/10">
                          <Check className="size-2.5 text-accent" />
                        </span>
                        <span className="text-[13.5px] leading-relaxed text-muted-foreground">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </section>

          {/* Başvuru formu */}
          <section id="sponsor-basvuru" className="scroll-mt-20 pb-4 pt-16">
            <Reveal>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Sponsorluk başvurusu
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                Formu doldurduğunuzda organizasyon ekibimiz en kısa sürede size
                dönüş yapacaktır. Sorularınız için{" "}
                <a
                  href={`mailto:${event.contact.email}`}
                  className="text-accent underline underline-offset-2"
                >
                  {event.contact.email}
                </a>{" "}
                adresine de yazabilirsiniz.
              </p>
            </Reveal>

            <Reveal delay={0.08} className="mt-8">
              <SponsorForm />
            </Reveal>
          </section>
        </div>
        </SponsorGate>
      </main>

      <Footer />
    </>
  );
}
