import Image from "next/image";
import { cn } from "@/lib/utils";

/** Okulun mühür logosu + kelime markası. Zemin her yerde koyu olduğu için beyaz sürüm. */
export function Wordmark({
  className,
  size = 30,
  showText = true,
}: {
  className?: string;
  size?: number;
  showText?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo-white.png"
        alt="Atatürk Lisesi Çalıştayı logosu"
        width={size}
        height={size}
        priority
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />

      {showText && (
        <span className="text-[17px] font-semibold tracking-tight">
          ALÇAL&rsquo;26
        </span>
      )}
    </span>
  );
}
