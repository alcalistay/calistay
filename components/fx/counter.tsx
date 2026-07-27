"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

const trFormat = new Intl.NumberFormat("tr-TR");

type CounterProps = {
  to: number;
  /** Yıl gibi değerlerde binlik ayracı istenmez. */
  grouped?: boolean;
  duration?: number;
  className?: string;
};

/**
 * Viewport'a girdiğinde 0'dan hedefe sayan rakam.
 *
 * Değer React state'ine hiç uğramaz; her karede doğrudan DOM'a yazılır.
 * Bu sayede iki saniyelik animasyon boyunca tek bir yeniden render olmaz.
 * Sunucuda ve `prefers-reduced-motion` altında nihai değer basılır, böylece
 * JavaScript çalışmasa bile sayı doğru görünür.
 */
export function Counter({
  to,
  grouped = true,
  duration = 2,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();

  const final = grouped ? trFormat.format(to) : String(to);

  // JS devreye girdiğinde sayacı sıfıra çeker; sunucu çıktısı ise nihai
  // değeri gösterir. Kartlar ilk ekranın altında olduğu için sıçrama görünmez.
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    node.textContent = grouped ? trFormat.format(0) : "0";
  }, [grouped, reduced]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;

    if (reduced) {
      node.textContent = final;
      return;
    }

    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        const rounded = Math.round(latest);
        node.textContent = grouped ? trFormat.format(rounded) : String(rounded);
      },
    });

    return () => controls.stop();
  }, [inView, to, duration, grouped, reduced, final]);

  return (
    <span ref={ref} className={`tnum ${className ?? ""}`}>
      {final}
    </span>
  );
}
