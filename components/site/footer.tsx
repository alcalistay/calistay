"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Wordmark } from "./wordmark";
import { InstagramGlyph } from "./instagram-glyph";
import { estimateNote, event } from "@/constants/event";
import { contacts } from "@/constants/team";
import { useSettings } from "@/components/providers/settings-provider";

const baseNav = [
  { label: "Hakkında", href: "/#hakkinda" },
  { label: "Komiteler", href: "/#komiteler" },
  { label: "Başvuru", href: "/#basvuru" },
];

/**
 * Ayrı bir iletişim bölümü yok; tüm iletişim bilgileri burada toplanıyor.
 */
export function Footer() {
  const { settings } = useSettings();
  const nav = settings.sponsorPageEnabled
    ? [...baseNav, { label: "Sponsorluk", href: "/sponsor" }]
    : baseNav;

  return (
    <footer className="border-t border-border px-5 pb-12 pt-14 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-10 border-b border-border pb-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          {/* Marka */}
          <div>
            <Wordmark size={32} />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-muted-foreground">
              {event.name}. {event.dateLabel}, {event.venue.name},{" "}
              {event.venue.district} / {event.venue.city}.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <a
                href={`mailto:${event.contact.email}`}
                aria-label="E-posta gönder"
                className="grid size-9 place-items-center rounded-md border border-border bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              >
                <Mail className="size-4" />
              </a>
              <a
                href={event.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram hesabımız"
                className="grid size-9 place-items-center rounded-md border border-border bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              >
                <InstagramGlyph className="size-4" />
              </a>
            </div>
          </div>

          {/* Gezinme */}
          <div>
            <p className="kicker text-muted-foreground/70">Konferans</p>
            <ul className="mt-4 space-y-2.5">
              {nav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="kicker mt-8 text-muted-foreground/70">Organizatör</p>
            <p className="mt-4 text-[13.5px] leading-relaxed text-muted-foreground">
              {event.organizer}
              <br />
              {event.school}
            </p>
          </div>

          {/* İletişim */}
          <div>
            <p className="kicker text-muted-foreground/70">İletişim</p>

            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${event.contact.email}`}
                  className="inline-flex items-center gap-2 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="size-3.5 shrink-0 text-accent" />
                  {event.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={event.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <InstagramGlyph className="size-3.5 shrink-0 text-accent" />@
                  {event.contact.instagram}
                </a>
              </li>
              <li>
                <a
                  href={event.venue.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2 text-[13.5px] leading-relaxed text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-accent" />
                  {event.venue.address}
                </a>
              </li>
            </ul>

            {/* Yalnızca telefonu yayımlanan kişiler listelenir */}
            <ul className="mt-5 space-y-2 border-t border-border pt-4">
              {contacts
                .filter((person) => person.showPhone && person.phone)
                .map((person) => (
                  <li
                    key={person.name}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <span className="text-[13px] text-muted-foreground">
                      {person.name}
                      <span className="text-muted-foreground/60">
                        {" "}
                        · {person.role}
                      </span>
                    </span>
                    <a
                      href={`tel:${person.phone!.replace(/\s/g, "")}`}
                      className="tnum inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[12.5px] text-muted-foreground transition-colors hover:text-accent"
                    >
                      <Phone className="size-3" />
                      {person.phone}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Sitedeki yıldızlı sayıların açıklaması */}
        <p className="pt-6 text-[12.5px] text-muted-foreground">
          {estimateNote}
        </p>

        <p className="mt-3 text-[12px] text-muted-foreground/60">
          © 2026 {event.name}. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
