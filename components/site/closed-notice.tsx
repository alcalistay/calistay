import Link from "next/link";
import { Lock } from "lucide-react";
import { event } from "@/constants/event";

/** Kapalı bir form ya da sayfa yerine gösterilen bilgilendirme kutusu. */
export function ClosedNotice({
  title,
  note,
  showHomeLink = false,
}: {
  title: string;
  note: string;
  showHomeLink?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center sm:p-10">
      <span className="mx-auto mb-5 grid size-11 place-items-center rounded-lg bg-white/6">
        <Lock className="size-5 text-accent" />
      </span>

      <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>

      <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
        {note}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href={event.contact.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-border px-5 py-2.5 text-[13px] font-medium text-foreground/85 transition-colors hover:border-accent/40 hover:text-foreground"
        >
          Duyurular için @{event.contact.instagram}
        </a>

        {showHomeLink && (
          <Link
            href="/"
            className="rounded-md bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:glow-primary"
          >
            Ana sayfaya dön
          </Link>
        )}
      </div>
    </div>
  );
}
