import { cn } from "@/lib/utils";
import { Reveal } from "@/components/fx/reveal";

/** Tüm bölümlerde ortak başlık bloğu: üst etiket, kısa vurgu çizgisi, başlık, açıklama. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "center",
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "center" | "left";
  className?: string;
}) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col",
        centered ? "mx-auto items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <Reveal>
        <span className="kicker text-accent">{eyebrow}</span>
      </Reveal>

      {/* Etiketi başlıktan ayıran kısa çizgi — bölüm başlangıcını netleştirir */}
      <Reveal delay={0.04}>
        <span
          aria-hidden
          className="mt-3 block h-px w-10 bg-linear-to-r from-accent/70 to-transparent"
        />
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
      </Reveal>

      {lead && (
        <Reveal delay={0.14}>
          <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
