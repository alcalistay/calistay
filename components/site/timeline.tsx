"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { timeline } from "@/constants/event";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Okul tarihçesi zaman çizelgesi.
 *
 * Sol rayda iki katman var: sabit soluk bir çizgi ve onun üzerine
 * kaydırmaya bağlı olarak "dolan" vurgu çizgisi. Dolgu `useScroll` ile
 * ölçülüp yayla yumuşatılıyor, böylece kaydırma dursa bile hareket
 * ani kesilmiyor. Azaltılmış hareket tercihinde çizgi baştan dolu gelir.
 */
export function Timeline() {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.55"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <ol ref={ref} className="relative mt-10">
      {/* Sabit ray */}
      <span
        aria-hidden
        className="absolute bottom-2 left-[6px] top-2 w-px bg-border"
      />

      {/* Dolan ray */}
      <motion.span
        aria-hidden
        style={{ scaleY: reduced ? 1 : progress }}
        className="absolute bottom-2 left-[6px] top-2 w-px origin-top bg-linear-to-b from-accent via-accent to-accent/20"
      />

      {timeline.map((item, i) => (
        <motion.li
          key={item.year}
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: i * 0.04, ease: EASE }}
          className="relative flex gap-5 pb-9 pl-8 last:pb-0 sm:gap-7 sm:pl-10"
        >
          {/* Düğüm — çekirdeğin çevresinde yumuşak bir hale */}
          <span
            aria-hidden
            className="absolute left-0 top-1.5 grid size-[13px] place-items-center rounded-full border border-accent/45 bg-background shadow-[0_0_14px_-2px_color-mix(in_oklch,var(--accent)_65%,transparent)]"
          >
            <span className="size-[5px] rounded-full bg-accent" />
          </span>

          <div className="min-w-0">
            <p className="tnum text-[15px] font-semibold leading-none text-accent">
              {item.year}
            </p>
            <p className="mt-2 max-w-prose text-[14px] leading-relaxed text-muted-foreground">
              {item.text}
            </p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
