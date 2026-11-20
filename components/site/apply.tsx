"use client";

import { useEffect, useState } from "react";
import {
  Send,
  CheckCircle2,
  Users,
  Award,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/fx/reveal";
import { SectionHeading } from "./section-heading";
import { ClosedNotice } from "./closed-notice";
import { useSettings } from "@/components/providers/settings-provider";
import {
  submitApplication,
  type ApplicantType,
  type SubmitResult,
} from "@/lib/submissions";
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
    | "pastConferencesAndAwards"
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

const APPLICANT_TYPES: {
  id: ApplicantType;
  label: string;
  badge: string;
  desc: string;
  icon: typeof Users;
}[] = [
  {
    id: "delege",
    label: "Delege",
    badge: "Katılımcı",
    desc: "Komitelerde delege olarak yer alır, müzakerelere katılır ve çözüm önergeleri üretir.",
    icon: Users,
  },
  {
    id: "chair",
    label: "Chair",
    badge: "Komite Başkanı",
    desc: "Komite oturumlarını yönetir, akademik tartışmaları ve raporlama sürecini koordine eder.",
    icon: Award,
  },
  {
    id: "admin",
    label: "Admin",
    badge: "İdari Ekip",
    desc: "Çalıştay süresince oturum düzeni, salon akışı ve idari işleyişte görev alır.",
    icon: ShieldCheck,
  },
];

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
  const [applicantType, setApplicantType] = useState<ApplicantType>("delege");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Eskişehir");
  const [school, setSchool] = useState("");
  const [schoolOther, setSchoolOther] = useState("");
  const [grade, setGrade] = useState("");
  const [address, setAddress] = useState("");
  const [experience, setExperience] = useState<Experience>("0");
  const [pastConferencesAndAwards, setPastConferencesAndAwards] = useState("");
  const [choices, setChoices] = useState({ c1: "", c2: "", c3: "" });
  const [motivation, setMotivation] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [savedApp, setSavedApp] = useState<{
    name: string;
    email: string;
    date: string;
    role?: string;
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const cleanDigits = phone.replace(/\D/g, "");
    const trimmedCity = city.trim();
    const trimmedAddress = address.trim();
    const trimmedSchoolOther = schoolOther.trim();
    const trimmedPastConferences = pastConferencesAndAwards.trim();
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

    // Delege ve Chair için komite seçimleri zorunludur; Admin için komite seçilmez
    if (applicantType !== "admin") {
      if (!choices.c1) next.choice1 = "1. komite tercihinizi yapın.";
      if (!choices.c2) next.choice2 = "2. komite tercihinizi yapın.";
      if (!choices.c3) next.choice3 = "3. komite tercihinizi yapın.";
    }

    // Deneyim sayısı 0'dan farklı seçilmişse geçmiş tecrübeler zorunludur
    if (experience !== "0" && !trimmedPastConferences) {
      next.pastConferencesAndAwards =
        "Geçmiş deneyim sayınızı " + experience + " seçtiğiniz için lütfen katıldığınız etkinlik veya tecrübelerinizi yazınız.";
    }

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

    const effectiveChoices =
      applicantType === "admin"
        ? []
        : [choices.c1, choices.c2, choices.c3];

    const committeeLabel = (id: string) =>
      committees.find((c) => c.id === id)?.name ?? id;

    const effectiveSchool =
      school === OTHER_SCHOOL_VALUE ? trimmedSchoolOther : school;
    const fullPhone = `+90 ${phone}`;
    const effectivePastConferences =
      trimmedPastConferences || (experience === "0" ? "Yok (İlk deneyimim)" : "");

    setSending(true);

    try {
      const timeoutPromise = new Promise<SubmitResult>((_, reject) =>
        setTimeout(
          () => reject(new Error("Zaman aşımı: Sunucu yanıt vermedi.")),
          15000,
        ),
      );

      const storePromise = submitApplication({
        applicantType,
        name: trimmedName,
        email: trimmedEmail,
        phone: fullPhone,
        city: trimmedCity,
        school: effectiveSchool,
        schoolOther: school === OTHER_SCHOOL_VALUE ? trimmedSchoolOther : "",
        grade,
        address: trimmedAddress,
        experience,
        pastConferencesAndAwards: effectivePastConferences,
        awards: effectivePastConferences,
        choices: effectiveChoices,
        motivation: trimmedMotivation,
      });

      const res = await Promise.race([storePromise, timeoutPromise]);

      if (res.success) {
        const payload = {
          name: trimmedName,
          email: trimmedEmail,
          date: new Date().toLocaleDateString("tr-TR"),
          role: applicantType,
        };
        try {
          localStorage.setItem("alcal27_applied", JSON.stringify(payload));
        } catch {
          // ignore
        }
        setSavedApp(payload);
        setSent(true);

        // Adaya arka planda otomatik teyit e-postası gönder
        fetch("/api/mail/application-received", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            applicantType,
            choices: effectiveChoices,
          }),
        }).catch((err) => {
          console.warn("[Apply] Otomatik teyit e-postası gönderilemedi:", err);
        });

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

      // E-posta yedeği
      const roleLabel =
        applicantType === "chair"
          ? "Chair"
          : applicantType === "admin"
            ? "Admin"
            : "Delege";

      const mailBody = [
        `Başvuru Türü: ${roleLabel}`,
        `Ad Soyad: ${trimmedName}`,
        `E-posta: ${trimmedEmail}`,
        `Telefon: ${fullPhone}`,
        `Şehir: ${trimmedCity}`,
        `Okul: ${effectiveSchool}`,
        `Sınıf: ${grade}`,
        `Geçmiş Deneyim: ${experience} konferans/çalıştay`,
        pastConferencesAndAwards.trim()
          ? `Katılınan Çalıştay / MUN ve Ödüller: ${pastConferencesAndAwards.trim()}`
          : "",
        `Açık Adres: ${trimmedAddress}`,
        "",
        applicantType === "admin"
          ? "Rol: Admin Ekibi"
          : `Komite Tercihleri: 1. ${committeeLabel(choices.c1)} | 2. ${committeeLabel(choices.c2)} | 3. ${committeeLabel(choices.c3)}`,
        "",
        "Motivasyon Metni:",
        trimmedMotivation,
      ].join("\n");

      window.location.href = `mailto:${event.contact.email}?subject=${encodeURIComponent(
        `[${event.shortName}] ${roleLabel} Başvurusu — ${trimmedName}`,
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

  const roleTitle =
    applicantType === "chair"
      ? "Chair Başvurusu"
      : applicantType === "admin"
        ? "Admin Başvurusu"
        : "Delege Başvurusu";

  return (
    <section id="basvuru" className="scroll-mt-20 px-5 py-20 sm:py-24 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <SectionHeading
          eyebrow="Başvuru"
          title={roleTitle}
          lead="Çalıştayımıza katılmak için formu eksiksiz doldurun. Delege, Chair ve Admin başvuruları organizasyon komitemiz tarafından titizlikle değerlendirilip sonuçlar e-posta ile iletilecektir."
        />

        <Reveal className="mt-10" amount={0.01}>
          {loading ? (
            <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
          ) : !settings.applicationsOpen ? (
            <ClosedNotice
              title="Başvurular şu anda kapalı"
              note={settings.applicationsClosedNote}
            />
          ) : sent || savedApp ? (
            <div className="rounded-2xl border border-accent/40 bg-card p-8 text-center sm:p-12 shadow-lg">
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
                  setPastConferencesAndAwards("");
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
              className="card-sheen rounded-2xl border border-border bg-card p-6 sm:p-9 shadow-xl"
            >
              {/* ========================================================= */}
              {/* BAŞVURU TÜRÜ (DELEGE, CHAIR, ADMIN)                       */}
              {/* ========================================================= */}
              <div className="mb-9 border-b border-border pb-8">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold text-accent">
                    ★
                  </span>
                  <h3 className="text-[15px] font-bold tracking-tight text-foreground sm:text-base">
                    Başvuru Türü
                  </h3>
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Çalıştayımıza hangi rolde katılmak istediğinizi seçiniz.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {APPLICANT_TYPES.map((t) => {
                    const isSelected = applicantType === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setApplicantType(t.id);
                          setErrors({});
                        }}
                        className={cn(
                          "group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200",
                          isSelected
                            ? "border-accent bg-accent/15 text-foreground shadow-md shadow-accent/10 ring-1 ring-accent"
                            : "border-border bg-white/4 text-muted-foreground hover:border-accent/40 hover:bg-white/8 hover:text-foreground",
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                "grid size-9 place-items-center rounded-lg transition-colors",
                                isSelected
                                  ? "bg-accent text-background"
                                  : "bg-white/5 text-muted-foreground group-hover:text-foreground",
                              )}
                            >
                              <Icon className="size-4.5" />
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
                                isSelected
                                  ? "border border-accent/40 bg-accent/20 text-accent"
                                  : "border border-border bg-white/5 text-muted-foreground",
                              )}
                            >
                              {t.badge}
                            </span>
                          </div>

                          <h4 className="mt-3 text-[15px] font-bold text-foreground">
                            {t.label}
                          </h4>
                          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                            {t.desc}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              isSelected ? "bg-accent" : "bg-white/20",
                            )}
                          />
                          <span
                            className={
                              isSelected
                                ? "font-bold text-accent"
                                : "text-muted-foreground"
                            }
                          >
                            {isSelected ? "Seçildi" : "Seç"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ========================================================= */}
              {/* ADIM 1: KİŞİSEL BİLGİLER                                   */}
              {/* ========================================================= */}
              <Step
                no="01"
                title="Kişisel Bilgiler"
                detail="İletişim ve okul bilgilerinizi eksiksiz doldurunuz."
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
                    <span className="inline-flex select-none items-center rounded-l-md border-r border-input bg-white/[0.04] px-3 text-[13.5px] font-semibold text-accent">
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

                {/* Okul Seçimi */}
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

                {/* Sınıf */}
                <div className="sm:col-span-2">
                  <label className="text-[13px] font-medium text-foreground">
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

              {/* ========================================================= */}
              {/* ADIM 2: KOMİTE TERCİHLERİ (DELEGE & CHAIR İÇİN)             */}
              {/* ========================================================= */}
              {applicantType !== "admin" && (
                <fieldset className="mt-9 border-t border-border pt-7">
                  <legend className="sr-only">Tercihler</legend>
                  <Step
                    no="02"
                    title={
                      applicantType === "chair"
                        ? "Yönetmek İstediğiniz Komiteler"
                        : "Komite Tercihleriniz"
                    }
                    required
                    detail={
                      applicantType === "chair"
                        ? "Chair (Komite Başkanı) olarak oturumlarını yönetmek istediğiniz 3 farklı komiteyi öncelik sıranıza göre seçiniz."
                        : "Lütfen delege olarak katılmak istediğiniz 3 farklı komiteyi öncelik sıranıza göre seçiniz."
                    }
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
              )}

              {/* ========================================================= */}
              {/* GEÇMİŞ DENEYİM VE ÖDÜLLER                                  */}
              {/* ========================================================= */}
              <fieldset className="mt-9 border-t border-border pt-7">
                <legend className="sr-only">Deneyim ve Ödüller</legend>

                <Step
                  no={applicantType === "admin" ? "02" : "03"}
                  title="Geçmiş Deneyim ve Tecrübe"
                  required
                  detail="Daha önce katıldığınız çalıştay veya MUN sayısı ve tecrübeleriniz."
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

                {/* DAHA ÖNCE KATILDIĞINIZ ÇALIŞTAY / MUN İSİMLERİ VE ALDIĞINIZ ÖDÜLLER */}
                <div className="mt-5">
                  <label
                    htmlFor="pastConferencesAndAwards"
                    className="text-[13px] font-medium text-foreground"
                  >
                    Daha önce katıldığınız çalıştay / MUN isimleri, tecrübeleriniz ve aldığınız ödüller{" "}
                    {experience === "0" ? (
                      <span className="text-[12px] font-normal text-muted-foreground">
                        (İlk defa katılıyorsanız boş bırakabilirsiniz)
                      </span>
                    ) : (
                      <span className="text-accent">* (Zorunlu)</span>
                    )}
                  </label>
                  <textarea
                    id="pastConferencesAndAwards"
                    name="pastConferencesAndAwards"
                    rows={3}
                    value={pastConferencesAndAwards}
                    onChange={(e) => {
                      setPastConferencesAndAwards(e.target.value);
                      if (errors.pastConferencesAndAwards) {
                        setErrors((prev) => ({
                          ...prev,
                          pastConferencesAndAwards: undefined,
                        }));
                      }
                    }}
                    placeholder="Örn: HASAL'24 (Best Delegate), KFLMUN'23 (Outstanding Delegate), ALÇAL'25 (Delege / Chair / Admin)... (Deneyiminiz yoksa 'Yok' veya 'İlk deneyimim' yazabilirsiniz)"
                    aria-invalid={Boolean(errors.pastConferencesAndAwards)}
                    className="mt-2 w-full resize-none rounded-md border border-input bg-white/5 px-3.5 py-2.5 text-[14px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20 aria-invalid:border-destructive"
                  />
                  <p className="mt-1 text-[11.5px] text-muted-foreground">
                    Daha önce katıldığınız çalıştay veya MUN konferanslarındaki tecrübelerinizi ve varsa kazandığınız ödülleri belirtiniz. Deneyiminiz yoksa &apos;Yok&apos; veya &apos;İlk deneyimim&apos; yazabilirsiniz.
                  </p>
                  {errors.pastConferencesAndAwards && (
                    <FieldError>{errors.pastConferencesAndAwards}</FieldError>
                  )}
                </div>
              </fieldset>

              {/* ========================================================= */}
              {/* MOTİVASYON METNİ                                           */}
              {/* ========================================================= */}
              <div className="mt-9 border-t border-border pt-7">
                <Step
                  no={applicantType === "admin" ? "03" : "04"}
                  title={
                    applicantType === "chair"
                      ? "Chair Motivasyon Metniniz"
                      : applicantType === "admin"
                        ? "Admin Motivasyon Metniniz"
                        : "Motivasyon Metniniz"
                  }
                  required
                  detail={
                    applicantType === "chair"
                      ? "Neden ALÇAL'27'de Chair (Komite Başkanı) olmak istiyorsunuz? Oturum yönetimi deneyiminiz ve komite vizyonunuzdan bahsediniz."
                      : applicantType === "admin"
                        ? "Neden ALÇAL'27 İdari Ekibinde (Admin) yer almak istiyorsunuz? Çalıştay işleyişine nasıl katkı sağlarsınız?"
                        : "Neden bu çalıştaya katılmak istiyorsunuz? Tercih ettiğiniz komiteler hakkında ne düşünüyorsunuz ve çalıştaya nasıl bir katkı sunmayı hedefliyorsunuz?"
                  }
                  htmlFor="motivation"
                />
                <textarea
                  id="motivation"
                  name="motivation"
                  rows={5}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Kendinizi tanıtınız ve çalıştaya katılım amacınızı açıklayınız..."
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
              <div className="mt-9 flex flex-col items-center gap-3 border-t border-border pt-7 sm:flex-row sm:justify-between">
                <p className="text-center text-[12px] text-muted-foreground sm:text-left">
                  Formu göndererek verilerinizin çalıştay organizasyonu
                  kapsamında işlenmesini kabul etmiş olursunuz.
                </p>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[14px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:glow-primary disabled:opacity-50 sm:w-auto"
                >
                  <Send className="size-4" />
                  <span>
                    {sending
                      ? "Gönderiliyor..."
                      : applicantType === "chair"
                        ? "Chair Başvurusunu Gönder"
                        : applicantType === "admin"
                          ? "Admin Başvurusunu Gönder"
                          : "Delege Başvurusunu Gönder"}
                  </span>
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

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
  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-2">
        <span className="tnum text-xs font-semibold text-accent">{no}</span>
        {htmlFor ? (
          <label
            htmlFor={htmlFor}
            className="text-[15px] font-semibold text-foreground cursor-pointer"
          >
            {title}
            {required && <span className="text-accent ml-1">*</span>}
          </label>
        ) : (
          <h4 className="text-[15px] font-semibold text-foreground">
            {title}
            {required && <span className="text-accent ml-1">*</span>}
          </h4>
        )}
      </div>
      {detail && (
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
          {detail}
        </p>
      )}
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-[12px] text-destructive" role="alert">
      {children}
    </p>
  );
}
