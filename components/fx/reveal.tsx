"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Editoryal hareket dili: yalnızca sönümlü opaklık ve çok kısa bir öteleme.
 * Bulanıklık, ölçek ve yaylanma bilinçli olarak kullanılmıyor — sayfa
 * "canlanmak" yerine sakince yerleşiyor.
 */
const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  duration?: number;
  amount?: number;
};

export function Reveal({
  children,
  className,
  y = 14,
  delay = 0,
  duration = 0.7,
  amount = 0.3,
}: RevealProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function Stagger({
  children,
  className,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/**
 * Cetvel çizgisinin soldan sağa çizilmesi. Baskıdaki "kural çizgisi"
 * jestinin dijital karşılığı; bölüm başlıklarını ayırmak için kullanılır.
 */
export function RuleDraw({ className }: { className?: string }) {
  return (
    <motion.div
      aria-hidden
      className={className}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 1, ease: EASE }}
      style={{ originX: 0 }}
    />
  );
}
