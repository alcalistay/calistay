"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Wordmark } from "./wordmark";
import { useSettings } from "@/components/providers/settings-provider";

const baseLinks = [
  { href: "/#hakkinda", label: "Hakkında" },
  { href: "/#komiteler", label: "Komiteler" },
];

const sponsorLink = { href: "/sponsor", label: "Sponsorluk" };

/** Aktif bölüm göstergesi yalnızca ana sayfadaki çapa bağlantıları için. */
const sectionIds = ["hakkinda", "komiteler"];

/**
 * Zemin sayfa boyunca aynı tonda olduğu için navbar renk değiştirmez;
 * kaydırıldığında yalnızca hafif bir bulanıklık ve alt kenarlık kazanır.
 */
export function Navbar({
  /** Alt sayfalarda çapa bağlantıları bulunmadığı için gözlemci kapatılır. */
  observeSections = true,
  activePath,
}: {
  observeSections?: boolean;
  activePath?: string;
}) {
  const { settings } = useSettings();
  const links = settings.sponsorPageEnabled
    ? [...baseLinks, sponsorLink]
    : baseLinks;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 40));

  useEffect(() => {
    if (!observeSections) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [observeSections]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    activePath === href || (href.startsWith("/#") && active === href.slice(2));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out",
          scrolled
            ? "border-b border-border bg-deep/80 backdrop-blur-md"
            : "border-b border-transparent",
        )}
      >
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 lg:px-8">
          <Link href="/" aria-label="ALÇAL'26 — ana sayfa" className="text-foreground">
            <Wordmark size={28} />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3.5 py-2 text-sm font-medium transition-colors duration-300",
                  isActive(link.href)
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:bg-white/6 hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Birincil eylem: delege başvurusu. */}
            <Link
              href="/#basvuru"
              className="ml-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:glow-primary"
            >
              Başvur
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            className="-mr-2 grid size-10 place-items-center rounded-md text-foreground md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-deep md:hidden"
          >
            <div className="flex h-full flex-col justify-center gap-2 px-7">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i + 0.05, duration: 0.45 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-border py-4 text-2xl font-semibold tracking-tight text-foreground"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.45 }}
                className="mt-8"
              >
                <Link
                  href="/#basvuru"
                  onClick={() => setOpen(false)}
                  className="inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
                >
                  Başvur
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
