"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSettings } from "@/components/providers/settings-provider";
import { submitSponsorRequest } from "@/lib/submissions";
import { ClosedNotice } from "./closed-notice";
import { event } from "@/constants/event";
import { supportAreas } from "@/constants/sponsorship";

const SUPPORT_KINDS = ["Ayni destek", "Nakdi destek", "Her ikisi de"] as const;
type SupportKind = (typeof SUPPORT_KINDS)[number];

type Errors = Partial<
  Record<"org" | "person" | "email" | "message" | "areas", string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const areaOptions = [...supportAreas.map((a) => a.title), "Diğer"];

/**
 * Sponsorluk başvuru formu.
 *
 * Kayıt Firestore'a yazılır. Firebase yapılandırılmamışsa
 * `submitSponsorRequest` false döner ve e-posta taslağı açmaya geri düşeriz;
 * böylece anahtarlar girilmeden de form kullanılabilir kalır.
 */
export function SponsorForm() {
  const { settings, loading } = useSettings();
  const [areas, setAreas] = useState<string[]>([]);
  const [kind, setKind] = useState<SupportKind>("Her ikisi de");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggleArea = (area: string) =>
    setAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const org = String(form.get("org") ?? "").trim();
    const person = String(form.get("person") ?? "").trim();
    const role = String(form.get("role") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    const next: Errors = {};
    if (org.length < 2) next.org = "Kurum adını yazın.";
    if (person.length < 2) next.person = "Yetkili kişinin adını yazın.";
    if (!EMAIL_RE.test(email)) next.email = "Geçerli bir e-posta adresi girin.";
    if (areas.length === 0) next.areas = "En az bir destek alanı seçin.";
    if (message.length < 12) next.message = "Biraz daha ayrıntı verir misiniz?";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Formda eksik alanlar var.");
      return;
    }

    setSending(true);
    try {
      const stored = await submitSponsorRequest({
        org,
        person,
        role,
        email,
        phone,
        kind,
        areas,
        message,
      });

      if (stored) {
        setSent(true);
        toast.success("Başvurunuz alındı.", {
          description: "Organizasyon ekibimiz en kısa sürede dönüş yapacaktır.",
        });
        return;
      }

      const lines = [
        `Kurum: ${org}`,
        `Yetkili: ${person}${role ? ` (${role})` : ""}`,
        `E-posta: ${email}`,
        phone ? `Telefon: ${phone}` : "",
        `Destek biçimi: ${kind}`,
        `Destek alanları: ${areas.join(", ")}`,
        "",
        message,
      ].filter(Boolean);

      const subject = `[${event.shortName}] Sponsorluk başvurusu — ${org}`;
      window.location.href = `mailto:${event.contact.email}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(lines.join("\n"))}`;

      toast.success("Başvuru taslağınız hazırlandı.", {
        description: "Açılan e-posta penceresinden göndermeniz yeterli.",
      });
    } catch {
      toast.error("Başvuru gönderilemedi.", {
        description: "Lütfen birazdan tekrar deneyin.",
      });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
    );
  }

  if (!settings.sponsorFormOpen) {
    return (
      <ClosedNotice
        title="Sponsorluk başvuruları şu anda kapalı"
        note={`Destek sunmak isterseniz ${event.contact.email} adresine doğrudan yazabilirsiniz.`}
      />
    );
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-accent/30 bg-card p-8 text-center sm:p-10">
        <h3 className="text-lg font-semibold text-card-foreground">
          Başvurunuz alındı
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
          Organizasyon ekibimiz en kısa sürede sizinle iletişime geçecektir.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="card-sheen rounded-lg border border-border bg-card p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Kurum adı"
          name="org"
          placeholder="Şirket / kurum adı"
          error={errors.org}
          required
        />
        <Field
          label="Yetkili kişi"
          name="person"
          placeholder="Ad Soyad"
          error={errors.person}
          required
        />
        <Field label="Görev / unvan" name="role" placeholder="Örn. Pazarlama Müdürü" />
        <Field
          label="E-posta"
          name="email"
          type="email"
          placeholder="ornek@kurum.com"
          error={errors.email}
          required
        />
        <Field label="Telefon" name="phone" type="tel" placeholder="+90" />
      </div>

      {/* Destek alanları — çoklu seçim */}
      <fieldset className="mt-6">
        <legend className="text-[13px] font-medium text-foreground">
          Hangi alanlarda destek sunabilirsiniz?{" "}
          <span className="text-accent">*</span>
        </legend>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {areaOptions.map((area) => {
            const checked = areas.includes(area);
            return (
              <label
                key={area}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-[13.5px] transition-colors duration-300",
                  checked
                    ? "border-accent/50 bg-white/8 text-foreground"
                    : "border-border bg-white/4 text-muted-foreground hover:border-accent/30 hover:text-foreground",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleArea(area)}
                  className="size-4 shrink-0 accent-[var(--accent)]"
                />
                {area}
              </label>
            );
          })}
        </div>

        {errors.areas && <FieldError>{errors.areas}</FieldError>}
      </fieldset>

      {/* Destek biçimi */}
      <fieldset className="mt-6">
        <legend className="text-[13px] font-medium text-foreground">
          Destek biçimi
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUPPORT_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={cn(
                "rounded-md border px-4 py-2 text-[13px] transition-colors duration-300",
                kind === k
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white/4 text-muted-foreground hover:border-accent/40 hover:text-foreground",
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="message" className="text-[13px] font-medium text-foreground">
          Mesajınız <span className="text-accent">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Sunmayı düşündüğünüz desteğin kapsamı, beklentileriniz ve varsa sorularınız."
          aria-invalid={Boolean(errors.message)}
          className="mt-2 w-full resize-none rounded-md border border-input bg-white/5 px-3.5 py-2.5 text-[14px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20 aria-invalid:border-destructive"
        />
        {errors.message && <FieldError>{errors.message}</FieldError>}
      </div>

      <button
        type="submit"
        disabled={sending}
        className="group mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:glow-primary disabled:opacity-60"
      >
        {sending ? "Gönderiliyor…" : "Başvuruyu Gönder"}
        <Send className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
      </button>

      <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
        Sorularınız için {event.contact.email} adresine yazabilirsiniz.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-[13px] font-medium text-foreground">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className="mt-2 h-11 w-full rounded-md border border-input bg-white/5 px-3.5 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20 aria-invalid:border-destructive"
      />
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 text-[11.5px] text-destructive">
      {children}
    </p>
  );
}
