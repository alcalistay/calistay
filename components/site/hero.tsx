"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Languages, MapPin } from "lucide-react";
import { Countdown } from "./countdown";
import { useSettings } from "@/components/providers/settings-provider";
import { event } from "@/constants/event";

const EASE = [0.22, 1, 0.36, 1] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: EASE },
});

export function Hero() {
  const { settings } = useSettings();

  const meta = [
    { icon: CalendarDays, text: settings.dateLabel },
    { icon: MapPin, text: `${event.venue.name}, ${event.venue.city}` },
    { icon: Languages, text: event.language },
  ];

  return (
    <section id="top" className="px-5 pb-24 pt-32 sm:pb-28 lg:px-8">
      {/* Zemin ışıkları sayfa katmanında (bkz. components/fx/page-glows.tsx);
          burada bölüme özel gradyan yok, aksi hâlde bölüm kenarında
          görünür bir kesim çizgisi oluşuyor. */}
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: EASE }}
          className="relative grid place-items-center"
        >
          {/* Mührün arkasında yavaşça nefes alan hale */}
          <span
            aria-hidden
            className="absolute size-[260px] rounded-full blur-3xl motion-safe:[animation:seal-halo_7s_ease-in-out_infinite] sm:size-[320px]"
            style={{
              backgroundImage:
                "radial-gradient(closest-side, color-mix(in oklch, var(--accent) 22%, transparent), transparent 70%)",
            }}
          />

          <Image
            src="/logo-white.png"
            alt="Atatürk Lisesi Çalıştayı mührü"
            width={168}
            height={168}
            priority
            className="relative size-[116px] object-contain sm:size-[148px]"
          />
        </motion.div>

        <motion.h1
          {...rise(0.12)}
          className="mt-8 text-[clamp(2.6rem,8vw,4.6rem)] font-bold leading-[1.02] tracking-tight text-foreground"
        >
          ALÇAL&rsquo;26
        </motion.h1>

        <motion.p
          {...rise(0.2)}
          className="mt-3 text-lg text-foreground/75 sm:text-xl"
        >
          {event.name}
        </motion.p>

        <motion.p
          {...rise(0.28)}
          className="mt-6 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base"
        >
          Eskişehir Atatürk Lisesi tarafından düzenlenen çalıştaya 8 komitede{" "}
          {settings.delegates} delege katılacak. Etkinlik {settings.dateLabel}
          &rsquo;da, Türkiye&rsquo;nin farklı illerinden gelen lise
          öğrencilerine açık olarak gerçekleştirilecek.
        </motion.p>

        <motion.div
          {...rise(0.36)}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href="#komiteler"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:glow-primary"
          >
            Komiteleri İncele
          </Link>
          {/* Sponsorluk sayfası kapalıysa bu yönlendirme de görünmez. */}
          {settings.sponsorPageEnabled && (
            <Link
              href="/sponsor"
              className="rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground/85 transition-colors hover:border-accent/40 hover:text-foreground"
            >
              Sponsorluk Bilgileri
            </Link>
          )}
        </motion.div>

        <motion.div {...rise(0.44)} className="mt-10 w-full max-w-md">
          <Countdown target={settings.startsAt} />
          {settings.isDatePreliminary && (
            <p className="mt-3 text-xs text-muted-foreground/70">
              Kesin gün ve saat yakında duyurulacaktır.
            </p>
          )}
        </motion.div>

        <motion.div
          {...rise(0.52)}
          className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {meta.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-2 text-[13px] text-muted-foreground"
            >
              <Icon className="size-3.5 text-accent" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
