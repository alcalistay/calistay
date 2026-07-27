import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { About } from "@/components/site/about";
import { Committees } from "@/components/site/committees";
import { Apply } from "@/components/site/apply";
import { SponsorCta } from "@/components/site/sponsor-cta";
import { Footer } from "@/components/site/footer";
import { committees } from "@/constants/committees";
import { event } from "@/constants/event";

/** Arama motorlarına etkinliği yapılandırılmış veri olarak tanıtır. */
function EventJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: event.name,
    alternateName: event.shortName,
    startDate: event.startsAt,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: "tr-TR",
    organizer: { "@type": "Organization", name: event.school },
    location: {
      "@type": "Place",
      name: event.venue.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Akcami Mh. Malhatun Sk. No: 1",
        addressLocality: event.venue.district,
        addressRegion: event.venue.city,
        addressCountry: "TR",
      },
    },
    about: committees.map((c) => c.agenda),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <EventJsonLd />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Committees />
        <Apply />
        <SponsorCta />
      </main>
      <Footer />
    </>
  );
}
