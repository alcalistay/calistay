"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/fx/reveal";
import { SectionHeading } from "./section-heading";
import { ClosedNotice } from "./closed-notice";
import { useSettings } from "@/components/providers/settings-provider";
import { submitApplication } from "@/lib/submissions";
import { cn } from "@/lib/utils";
import { event } from "@/constants/event";
import { committees } from "@/constants/committees";

type Errors = Partial<
  Record<
    "name" | "email" | "phone" | "school" | "city" | "choice1" | "motivation",
    string
  >
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EXPERIENCE = ["İlk kez katılıyorum", "Daha önce katıldım"] as const;
type Experience = (typeof EXPERIENCE)[number];

const MIN_MOTIVATION = 80;

export function Apply() {
  const { settings, loading } = useSettings();
  const [experience, setExperience] = useState<Experience>(
    "İlk kez katılıyorum",
  );
  const [choices, setChoices] = useState({ c1: "", c2: "", c3: "" });
  const [motivation, setMotivation] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  /**
   * Başvuru Firestore'a yazılır. Firebase yapılandırılmamışsa
   * `submitApplication` false döner ve e-posta taslağı açmaya geri düşeriz —
   * böylece anahtarlar girilmeden de form kullanılabilir kalır.
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const school = String(form.get("school") ?? "").trim();
    const grade = String(form.get("grade") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();

    const next: Errors = {};
    if (name.length < 3) next.name = "Ad ve soyadınızı yazın.";
    if (!EMAIL_RE.test(email)) next.email = "Geçerli bir e-posta adresi girin.";
    if (phone.replace(/\D/g, "").length < 10)
      next.phone = "Geçerli bir telefon numarası girin.";
    if (school.length < 2) next.school = "Okulunuzu yazın.";
    if (city.length < 2) next.city = "Şehrinizi yazın.";
    if (!choices.c1) next.choice1 = "En az bir komite tercihi yapın.";
    if (motivation.trim().length < MIN_MOTIVATION)
      next.motivation = `Motivasyon metniniz en az ${MIN_MOTIVATION} karakter olmalı.`;

    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Formda eksik alanlar var.");
      return;
    }

    const selected = [choices.c1, choices.c2, choices.c3].filter(Boolean);
    const label = (id: string) =>
      committees.find((c) => c.id === id)?.name ?? "—";

    setSending(true);
    try {
      const stored = await submitApplication({
        name,
        email,
        phone,
        school,
        grade,
        city,
        experience,
        choices: selected,
        motivation: motivation.trim(),
      });

      if (stored) {
        setSent(true);
        toast.success("Başvurunuz alındı.", {
          description: "Sonuçlar e-posta ile bildirilecektir.",
        });
        return;
      }

      // Firebase yoksa: e-posta taslağı
      const body = [
        `Ad Soyad: ${name}`,
        `E-posta: ${email}`,
        `Telefon: ${phone}`,
        `Okul: ${school}${grade ? ` / ${grade}. sınıf` : ""}`,
        `Şehir: ${city}`,
        `Deneyim: ${experience}`,
        "",
        ...selected.map((id, i) => `${i + 1}. tercih: ${label(id)}`),
        "",
        "Motivasyon:",
        motivation.trim(),
      ].join("\n");

      window.location.href = `mailto:${event.contact.email}?subject=${encodeURIComponent(
        `[${event.shortName}] Delege başvurusu — ${name}`,
      )}&body=${encodeURIComponent(body)}`;

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

  /** Bir komite yalnızca tek bir tercih sırasında seçilebilir. */
  const optionsFor = (slot: "c1" | "c2" | "c3") =>
    committees.filter(
      (c) =>
        c.id === choices[slot] ||
        ![choices.c1, choices.c2, choices.c3].includes(c.id),
    );

  return (
    <section id="basvuru" className="scroll-mt-20 px-5 py-20 sm:py-24 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <SectionHeading
          eyebrow="Başvuru"
          title="Delege başvurusu"
          lead="Çalıştaya katılmak için formu doldurun. Başvurular organizasyon komitesi tarafından değerlendirilecek ve sonuçlar e-posta ile bildirilecektir."
        />

        <Reveal className="mt-12">
          {loading ? (
            // Ayarlar okunana kadar formu göstermeyip yer tutucu bırakıyoruz;
            // aksi hâlde kapalı bir form bir an için açık görünürdü.
            <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
          ) : !settings.applicationsOpen ? (
            <ClosedNotice
              title="Başvurular şu anda kapalı"
              note={settings.applicationsClosedNote}
            />
          ) : sent ? (
            <div className="rounded-lg border border-accent/30 bg-card p-8 text-center sm:p-10">
              <h3 className="text-lg font-semibold text-card-foreground">
                Başvurunuz alındı
              </h3>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                Başvurunuz organizasyon komitesine iletildi. Değerlendirme
                sonucu {event.contact.email} adresinden e-posta ile
                bildirilecektir.
              </p>
            </div>
          ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="card-sheen rounded-lg border border-border bg-card p-6 sm:p-8"
          >
            {/* Uzun formu okunur kılmak için numaralı adımlara bölündü */}
            <Step no="01" title="Kişisel bilgiler" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ad Soyad" name="name" placeholder="Adınız Soyadınız" error={errors.name} required />
              <Field label="E-posta" name="email" type="email" placeholder="ornek@eposta.com" error={errors.email} required />
              <Field label="Telefon" name="phone" type="tel" placeholder="+90" error={errors.phone} required />
              <Field label="Şehir" name="city" placeholder="Eskişehir" error={errors.city} required />
              <Field label="Okul" name="school" placeholder="Okulunuzun adı" error={errors.school} required />
              <Field label="Sınıf" name="grade" placeholder="Örn. 11" />
            </div>

            {/* Komite tercihleri */}
            <fieldset className="mt-9 border-t border-border pt-7">
              <legend className="sr-only">Komite tercihleri</legend>

              <Step
                no="02"
                title="Komite tercihleriniz"
                required
                detail="En az bir tercih yapın. Aynı komiteyi birden fazla sıraya yazamazsınız."
              />

              <div className="grid gap-4 sm:grid-cols-3">
                {(["c1", "c2", "c3"] as const).map((slot, i) => (
                  <div key={slot}>
                    <label
                      htmlFor={slot}
                      className="text-[12.5px] text-muted-foreground"
                    >
                      {i + 1}. tercih {i === 0 && <span className="text-accent">*</span>}
                    </label>
                    <select
                      id={slot}
                      value={choices[slot]}
                      onChange={(e) =>
                        setChoices((prev) => ({ ...prev, [slot]: e.target.value }))
                      }
                      aria-invalid={i === 0 && Boolean(errors.choice1)}
                      className="mt-1.5 h-11 w-full rounded-md border border-input bg-white/5 px-3 text-[14px] text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 aria-invalid:border-destructive"
                    >
                      <option value="">Seçiniz</option>
                      {optionsFor(slot).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {errors.choice1 && <FieldError>{errors.choice1}</FieldError>}
            </fieldset>

            {/* Deneyim ve motivasyon */}
            <fieldset className="mt-9 border-t border-border pt-7">
              <legend className="sr-only">Deneyim</legend>

              <Step
                no="03"
                title="Deneyiminiz"
                detail="Daha önce çalıştay veya benzeri bir konferansa katıldınız mı?"
              />

              <div className="flex flex-wrap gap-2">
                {EXPERIENCE.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setExperience(option)}
                    aria-pressed={experience === option}
                    className={cn(
                      "rounded-md border px-4 py-2 text-[13px] transition-colors duration-300",
                      experience === option
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-white/4 text-muted-foreground hover:border-accent/40 hover:text-foreground",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Motivasyon */}
            <div className="mt-9 border-t border-border pt-7">
              <Step
                no="04"
                title="Motivasyon metniniz"
                required
                detail="Neden bu çalıştaya katılmak istiyorsunuz, seçtiğiniz komitenin gündemi hakkında ne düşünüyorsunuz?"
                htmlFor="motivation"
              />
              <textarea
                id="motivation"
                name="motivation"
                rows={6}
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                aria-invalid={Boolean(errors.motivation)}
                className="mt-2 w-full resize-none rounded-md border border-input bg-white/5 px-3.5 py-2.5 text-[14px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20 aria-invalid:border-destructive"
              />
              <div className="mt-1.5 flex items-start justify-between gap-4">
                <span className="text-[11.5px] text-destructive" role="alert">
                  {errors.motivation}
                </span>
                <span
                  className={cn(
                    "tnum shrink-0 text-[11.5px]",
                    motivation.trim().length >= MIN_MOTIVATION
                      ? "text-accent"
                      : "text-muted-foreground",
                  )}
                >
                  {motivation.trim().length} / {MIN_MOTIVATION}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="group mt-7 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:glow-primary disabled:opacity-60"
            >
              {sending ? "Gönderiliyor…" : "Başvuruyu Gönder"}
              <Send className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>

            <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
              Sorularınız için {event.contact.email} adresine
              yazabilirsiniz.
            </p>
          </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/** Form içindeki numaralı adım başlığı. */
function Step({
  no,
  title,
  detail,
  required,
  htmlFor,
}: {
  no: string;
  title: string;
  detail?: string;
  required?: boolean;
  /** Verilirse başlık, ilgili alanın etiketi olarak bağlanır. */
  htmlFor?: string;
}) {
  const Heading = htmlFor ? "label" : "p";

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2.5">
        <span className="tnum grid size-6 shrink-0 place-items-center rounded border border-border bg-white/5 text-[11px] font-semibold text-accent">
          {no}
        </span>
        <Heading
          {...(htmlFor ? { htmlFor } : {})}
          className="text-[14px] font-semibold text-foreground"
        >
          {title} {required && <span className="text-accent">*</span>}
        </Heading>
      </div>

      {detail && (
        <p className="mt-1.5 max-w-prose pl-[34px] text-[12.5px] leading-relaxed text-muted-foreground">
          {detail}
        </p>
      )}
    </div>
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
