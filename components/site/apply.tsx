"use client";

import { useEffect, useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/fx/reveal";
import { SectionHeading } from "./section-heading";
import { ClosedNotice } from "./closed-notice";
import { useSettings } from "@/components/providers/settings-provider";
import { submitApplication, type SubmitResult } from "@/lib/submissions";
import { cn } from "@/lib/utils";
import { event } from "@/constants/event";
import { committees } from "@/constants/committees";
import { OTHER_SCHOOL_VALUE } from "@/constants/schools";
import { SchoolCombobox } from "./school-combobox";
import { CommitteeSelect } from "./committee-select";

type Errors = Partial<
  Record<
    | "name"
    | "email"
    | "phone"
    | "school"
    | "schoolOther"
    | "grade"
    | "city"
    | "address"
    | "experience"
    | "choice1"
    | "choice2"
    | "choice3"
    | "motivation",
    string
  >
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EXPERIENCE_OPTIONS = ["0", "1-3", "3-5", "5+", "10+"] as const;
type Experience = (typeof EXPERIENCE_OPTIONS)[number];

const GRADE_OPTIONS = [
  "Hazırlık",
  "9. Sınıf",
  "10. Sınıf",
  "11. Sınıf",
  "12. Sınıf",
  "Mezun",
] as const;

const MIN_MOTIVATION = 80;

/** Telefon formatlama: (5XX) XXX XX XX */
function formatPhoneNumber(val: string): string {
  let digits = val.replace(/\D/g, "");
  if (digits.startsWith("90")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  digits = digits.slice(0, 10);

  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 8)
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
}

export function Apply() {
  const { settings, loading } = useSettings();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Eskişehir");
  const [school, setSchool] = useState("");
  const [schoolOther, setSchoolOther] = useState("");
  const [grade, setGrade] = useState("");
  const [address, setAddress] = useState("");
  const [experience, setExperience] = useState<Experience>("0");
  const [choices, setChoices] = useState({ c1: "", c2: "", c3: "" });
  const [motivation, setMotivation] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [savedApp, setSavedApp] = useState<{
    name: string;
    email: string;
    date: string;
  } | null>(null);

  // Tarayıcı yerel hafızasından önceki başvuruyu kontrol et (localStorage)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("alcal27_applied");
      if (stored) {
        setSavedApp(JSON.parse(stored));
      }
    } catch {
      // localStorage erişim hatası (gizli mod veya kısıtlı tarayıcılar)
    }
  }, []);

  /**
   * Başvuru Firestore'a yazılır.
   * Firebase yapılandırılmamışsa veya geçici bir ağ aksamasında
   * `submitApplication` false döner ve e-posta taslağına yönlendirir.
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const cleanDigits = phone.replace(/\D/g, "");
    const trimmedCity = city.trim();
    const trimmedAddress = address.trim();
    const trimmedSchoolOther = schoolOther.trim();
    const trimmedMotivation = motivation.trim();

    const next: Errors = {};
    if (trimmedName.length < 3) next.name = "Ad ve soyadınızı eksiksiz yazın.";
    if (!EMAIL_RE.test(trimmedEmail))
      next.email = "Geçerli bir e-posta adresi girin.";
    if (cleanDigits.length !== 10)
      next.phone = "10 haneli telefon numaranızı girin (Örn: 5XX XXX XX XX).";
    if (trimmedCity.length < 2) next.city = "Lütfen şehrinizi yazın.";
    if (!school) {
      next.school = "Lütfen okulunuzu seçin.";
    } else if (school === OTHER_SCHOOL_VALUE && trimmedSchoolOther.length < 3) {
      next.schoolOther = "Lütfen okulunuzun adını yazın.";
    }
    if (!grade) next.grade = "Sınıfınızı seçin.";
    if (trimmedAddress.length < 10)
      next.address = "Lütfen açık adresinizi mahalle/cadde/bina no ile yazın.";

    if (!choices.c1) next.choice1 = "1. komite tercihinizi yapın.";
    if (!choices.c2) next.choice2 = "2. komite tercihinizi yapın.";
    if (!choices.c3) next.choice3 = "3. komite tercihinizi yapın.";

    if (trimmedMotivation.length < MIN_MOTIVATION) {
      next.motivation = `Motivasyon metniniz en az ${MIN_MOTIVATION} karakter olmalı (${trimmedMotivation.length}/${MIN_MOTIVATION}).`;
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Formda eksik veya hatalı alanlar var.", {
        description: "Lütfen kırmızı ile işaretlenen alanları kontrol edin.",
      });
      return;
    }

    const selectedCommittees = [choices.c1, choices.c2, choices.c3];
    const committeeLabel = (id: string) =>
      committees.find((c) => c.id === id)?.name ?? id;

    const effectiveSchool =
      school === OTHER_SCHOOL_VALUE ? trimmedSchoolOther : school;
    const fullPhone = `+90 ${phone}`;

    setSending(true);

    try {
      // 15 saniyelik timeout koruması
      const timeoutPromise = new Promise<SubmitResult>((_, reject) =>
        setTimeout(
          () => reject(new Error("Zaman aşımı: Sunucu yanıt vermedi.")),
          15000,
        ),
      );

      const storePromise = submitApplication({
        name: trimmedName,
        email: trimmedEmail,
        phone: fullPhone,
        city: trimmedCity,
        school: effectiveSchool,
        schoolOther: school === OTHER_SCHOOL_VALUE ? trimmedSchoolOther : "",
        grade,
        address: trimmedAddress,
        experience,
        choices: selectedCommittees,
        motivation: trimmedMotivation,
      });

      const res = await Promise.race([storePromise, timeoutPromise]);

      if (res.success) {
        const payload = {
          name: trimmedName,
          email: trimmedEmail,
          date: new Date().toLocaleDateString("tr-TR"),
        };
        try {
          localStorage.setItem("alcal27_applied", JSON.stringify(payload));
        } catch {
          // localStorage kısıtlıysa sessizce geç
        }
        setSavedApp(payload);
        setSent(true);
        toast.success("Başvurunuz başarıyla alındı!", {
          description: "Sonuçlar e-posta adresinize bildirilecektir.",
        });
        return;
      }

      if (res.reason === "ALREADY_EXISTS") {
        toast.error("Mükerrer Başvuru Engellendi!", {
          description:
            "Girdiğiniz telefon numarası ile sistemde zaten kayıtlı bir başvuru bulunmaktadır.",
          duration: 7000,
        });
        return;
      }

      if (res.reason === "ERROR") {
        toast.error("Başvuru gönderilemedi.", {
          description: "Lütfen internet bağlantınızı kontrol edip tekrar deneyin.",
        });
        return;
      }

      // Firebase yapılandırılmamışsa veya kapalıysa e-posta yedeği
      const mailBody = [
        `Ad Soyad: ${trimmedName}`,
        `E-posta: ${trimmedEmail}`,
        `Telefon: ${fullPhone}`,
        `Şehir: ${trimmedCity}`,
        `Okul: ${effectiveSchool}`,
        `Sınıf: ${grade}`,
        `Geçmiş Deneyim: ${experience} konferans/çalıştay`,
        `Açık Adres: ${trimmedAddress}`,
        "",
        "Komite Tercihleri:",
        `1. Tercih: ${committeeLabel(choices.c1)}`,
        `2. Tercih: ${committeeLabel(choices.c2)}`,
        `3. Tercih: ${committeeLabel(choices.c3)}`,
        "",
        "Motivasyon Metni:",
        trimmedMotivation,
      ].join("\n");

      window.location.href = `mailto:${event.contact.email}?subject=${encodeURIComponent(
        `[${event.shortName}] Delege Başvurusu — ${trimmedName}`,
      )}&body=${encodeURIComponent(mailBody)}`;

      toast.success("Başvuru taslağınız hazırlandı.", {
        description: "Açılan e-posta penceresinden göndermeniz yeterlidir.",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
      toast.error("Başvuru gönderilirken bir aksama yaşandı.", {
        description: `${message} Lütfen internet bağlantınızı kontrol edip tekrar deneyin.`,
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="basvuru" className="scroll-mt-20 px-5 py-20 sm:py-24 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <SectionHeading
          eyebrow="Başvuru"
          title="Delege Başvurusu"
          lead="Çalıştaya katılmak için formu eksiksiz doldurun. Başvurular organizasyon komitesi tarafından titizlikle değerlendirilecek ve sonuçlar e-posta ile bildirilecektir."
        />

        <Reveal className="mt-10">
          {loading ? (
            <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
          ) : !settings.applicationsOpen ? (
            <ClosedNotice
              title="Başvurular şu anda kapalı"
              note={settings.applicationsClosedNote}
            />
          ) : sent || savedApp ? (
            <div className="rounded-lg border border-accent/40 bg-card p-8 text-center sm:p-12 shadow-lg">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">
                Başvurunuz Alındı
              </h3>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                Teşekkür ederiz{" "}
                <strong>{savedApp?.name || name || "Değerli Katılımcı"}</strong>.
                Başvurunuz organizasyon komitemize ulaştı. Değerlendirme sonucu en kısa
                sürede{" "}
                <span className="text-foreground font-medium">
                  {savedApp?.email || email}
                </span>{" "}
                adresinize iletilecektir.
              </p>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem("alcal27_applied");
                  } catch {
                    // ignore
                  }
                  setSavedApp(null);
                  setSent(false);
                  setName("");
                  setEmail("");
                  setPhone("");
                  setSchool("");
                  setSchoolOther("");
                  setAddress("");
                  setMotivation("");
                  setChoices({ c1: "", c2: "", c3: "" });
                }}
                className="mt-6 inline-flex text-[12.5px] text-muted-foreground transition-colors hover:text-accent hover:underline"
              >
                Yeni veya farklı bir başvuru formu doldur
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="card-sheen rounded-lg border border-border bg-card p-6 sm:p-8"
            >
              {/* ADIM 1: KİŞİSEL BİLGİLER */}
              <Step
                no="01"
                title="Kişisel Bilgiler"
                detail="İletişim ve okul bilgilerinizi eksiksiz doldurun."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Ad Soyad */}
                <div>
                  <label
                    htmlFor="name"
                    className="text-[13px] font-medium text-foreground"
                  >
                    Ad Soyad <span className="text-accent">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    aria-invalid={Boolean(errors.name)}
                    className="mt-2 h-11 w-full rounded-md border border-input bg-white/5 px-3.5 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20 aria-invalid:border-destructive"
                  />
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </div>

                {/* E-posta */}
                <div>
                  <label
                    htmlFor="email"
                    className="text-[13px] font-medium text-foreground"
                  >
                    E-posta <span className="text-accent">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    aria-invalid={Boolean(errors.email)}
                    className="mt-2 h-11 w-full rounded-md border border-input bg-white/5 px-3.5 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20 aria-invalid:border-destructive"
                  />
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </div>

                {/* Telefon (+90 sabit) */}
                <div>
                  <label
                    htmlFor="phone"
                    className="text-[13px] font-medium text-foreground"
                  >
                    Telefon Numarası <span className="text-accent">*</span>
                  </label>
                  <div
                    className={cn(
                      "mt-2 flex h-11 w-full rounded-md border border-input bg-white/5 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
                      errors.phone && "border-destructive",
                    )}
                  >
                    <span className="inline-flex items-center rounded-l-md border-r border-input bg-white/[0.04] px-3 text-[13.5px] font-semibold text-accent select-none">
                      +90
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                      placeholder="(5XX) XXX XX XX"
                      maxLength={15}
                      aria-invalid={Boolean(errors.phone)}
                      className="h-full w-full bg-transparent px-3.5 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                  {errors.phone && <FieldError>{errors.phone}</FieldError>}
                </div>

                {/* Şehir */}
                <div>
                  <label
                    htmlFor="city"
                    className="text-[13px] font-medium text-foreground"
                  >
                    Şehir <span className="text-accent">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Eskişehir"
                    aria-invalid={Boolean(errors.city)}
                    className="mt-2 h-11 w-full rounded-md border border-input bg-white/5 px-3.5 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20 aria-invalid:border-destructive"
                  />
                  {errors.city && <FieldError>{errors.city}</FieldError>}
                </div>

                {/* Okul Seçimi (Aramalı ve Akıllı Seçici) */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="school"
                    className="text-[13px] font-medium text-foreground"
                  >
                    Okul <span className="text-accent">*</span>
                  </label>
                  <div className="mt-2">
                    <SchoolCombobox
                      value={school}
                      otherValue={schoolOther}
                      onChange={(s, other) => {
                        setSchool(s);
                        setSchoolOther(other);
                      }}
                      error={errors.school || errors.schoolOther}
                    />
                  </div>
                  {errors.school && <FieldError>{errors.school}</FieldError>}
                  {errors.schoolOther && (
                    <FieldError>{errors.schoolOther}</FieldError>
                  )}
                </div>

                {/* Sınıf (Tek Tıkla Seçim Butonları - Asla Bembeyaz Açılır Kutu Yok) */}
                <div className="sm:col-span-2">
                  <label
                    className="text-[13px] font-medium text-foreground"
                  >
                    Sınıf <span className="text-accent">*</span>
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {GRADE_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrade(g)}
                        aria-pressed={grade === g}
                        className={cn(
                          "flex h-11 items-center justify-center rounded-md border text-[13.5px] font-medium transition-all duration-200",
                          grade === g
                            ? "border-accent bg-accent/15 text-accent shadow-sm"
                            : "border-border bg-white/4 text-muted-foreground hover:border-accent/40 hover:text-foreground",
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  {errors.grade && <FieldError>{errors.grade}</FieldError>}
                </div>
              </div>

              {/* Açık Adres */}
              <div className="mt-4">
                <label
                  htmlFor="address"
                  className="text-[13px] font-medium text-foreground"
                >
                  Açık Adres <span className="text-accent">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mahalle, cadde/sokak, bina no, daire, ilçe / il"
                  aria-invalid={Boolean(errors.address)}
                  className="mt-2 w-full resize-none rounded-md border border-input bg-white/5 px-3.5 py-2.5 text-[14px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20 aria-invalid:border-destructive"
                />
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  Resmî belgeler ve acil durumlarda iletişim amacıyla
                  kullanılır.
                </p>
                {errors.address && <FieldError>{errors.address}</FieldError>}
              </div>

              {/* ADIM 2: KOMİTE TERCİHLERİ */}
              <fieldset className="mt-9 border-t border-border pt-7">
                <legend className="sr-only">Komite tercihleri</legend>

                <Step
                  no="02"
                  title="Komite Tercihleriniz"
                  required
                  detail="Lütfen öncelik sıranıza göre 3 farklı komite seçiniz. Bir komite yalnızca tek bir sırada seçilebilir."
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  {(["c1", "c2", "c3"] as const).map((slot, i) => {
                    const errorMsg =
                      i === 0
                        ? errors.choice1
                        : i === 1
                          ? errors.choice2
                          : errors.choice3;

                    const disabledIds = [
                      slot !== "c1" ? choices.c1 : "",
                      slot !== "c2" ? choices.c2 : "",
                      slot !== "c3" ? choices.c3 : "",
                    ].filter(Boolean);

                    return (
                      <div key={slot}>
                        <label className="text-[12.5px] font-medium text-muted-foreground">
                          {i + 1}. Tercih <span className="text-accent">*</span>
                        </label>
                        <div className="mt-1.5">
                          <CommitteeSelect
                            slotLabel={`${i + 1}. Tercih`}
                            value={choices[slot]}
                            onChange={(id) =>
                              setChoices((prev) => ({
                                ...prev,
                                [slot]: id,
                              }))
                            }
                            disabledIds={disabledIds}
                            error={errorMsg}
                          />
                        </div>
                        {errorMsg && <FieldError>{errorMsg}</FieldError>}
                      </div>
                    );
                  })}
                </div>
              </fieldset>

              {/* ADIM 3: GEÇMİŞ DENEYİMLER */}
              <fieldset className="mt-9 border-t border-border pt-7">
                <legend className="sr-only">Deneyim</legend>

                <Step
                  no="03"
                  title="Geçmiş Deneyiminiz"
                  detail="Daha önce katıldığınız çalıştay, MUN veya gençlik konferansı sayısı."
                />

                <div className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap">
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setExperience(option)}
                      aria-pressed={experience === option}
                      className={cn(
                        "flex items-center justify-center rounded-md border px-4 py-2.5 text-[13.5px] font-medium transition-all duration-200",
                        experience === option
                          ? "border-accent bg-accent/15 text-accent shadow-sm"
                          : "border-border bg-white/4 text-muted-foreground hover:border-accent/40 hover:text-foreground",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* ADIM 4: MOTİVASYON */}
              <div className="mt-9 border-t border-border pt-7">
                <Step
                  no="04"
                  title="Motivasyon Metniniz"
                  required
                  detail="Neden bu çalıştaya katılmak istiyorsunuz? Tercih ettiğiniz komiteler hakkında ne düşünüyorsunuz ve çalıştaya nasıl bir katkı sunmayı hedefliyorsunuz?"
                  htmlFor="motivation"
                />
                <textarea
                  id="motivation"
                  name="motivation"
                  rows={5}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Kendinizi tanıtın ve çalıştaya katılım amacınızı açıklayın..."
                  aria-invalid={Boolean(errors.motivation)}
                  className="mt-2 w-full resize-none rounded-md border border-input bg-white/5 px-3.5 py-2.5 text-[14px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20 aria-invalid:border-destructive"
                />
                <div className="mt-1.5 flex items-start justify-between gap-4">
                  <span className="text-[11.5px] text-destructive" role="alert">
                    {errors.motivation}
                  </span>
                  <span
                    className={cn(
                      "tnum shrink-0 text-[11.5px] font-medium",
                      motivation.trim().length >= MIN_MOTIVATION
                        ? "text-accent"
                        : "text-muted-foreground",
                    )}
                  >
                    {motivation.trim().length} / {MIN_MOTIVATION} karakter
                  </span>
                </div>
              </div>

              {/* GÖNDER BUTONU */}
              <button
                type="submit"
                disabled={sending}
                className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:glow-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
              >
                {sending ? "Başvuru Kaydediliyor…" : "Başvuruyu Gönder"}
                <Send className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>

              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                Sorularınız veya teknik destek için{" "}
                <a
                  href={`mailto:${event.contact.email}`}
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  {event.contact.email}
                </a>{" "}
                adresine yazabilirsiniz.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/** Form içindeki numaralı adım başlığı */
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

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 text-[11.5px] text-destructive">
      {children}
    </p>
  );
}
