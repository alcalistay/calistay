import { event, stats } from "@/constants/event";

/**
 * Panelden yönetilen site ayarları.
 * Firestore'da `site/settings` dokümanında tek parça olarak tutulur.
 */
export type SiteSettings = {
  /** /sponsor sayfası ve ona giden bağlantılar görünsün mü? */
  sponsorPageEnabled: boolean;
  /** Delege başvuru formu açık mı? */
  applicationsOpen: boolean;
  /** Sponsorluk başvuru formu açık mı? */
  sponsorFormOpen: boolean;
  /** Geri sayım hedefi (ISO 8601). */
  startsAt: string;
  /** Hero ve künyede görünen tarih metni. */
  dateLabel: string;
  /** true ise "kesin tarih yakında" notu gösterilir. */
  isDatePreliminary: boolean;
  /** Kontenjanlar — istatistik kartlarını besler. */
  totalParticipants: number;
  delegates: number;
  /** Başvurular kapalıyken formun yerine gösterilecek mesaj. */
  applicationsClosedNote: string;
};

const statValue = (label: string, fallback: number) =>
  stats.find((s) => s.label === label)?.value ?? fallback;

/** Firebase yoksa veya doküman henüz oluşturulmadıysa kullanılan değerler. */
export const defaultSettings: SiteSettings = {
  sponsorPageEnabled: true,
  applicationsOpen: true,
  sponsorFormOpen: true,
  startsAt: event.startsAt,
  dateLabel: event.dateLabel,
  isDatePreliminary: event.isDatePreliminary,
  totalParticipants: statValue("Toplam katılımcı", 370),
  delegates: statValue("Delege", 300),
  applicationsClosedNote:
    "Delege başvuruları şu anda kapalıdır. Açılış tarihi sosyal medya hesaplarımızdan duyurulacaktır.",
};

/** Firestore'dan gelen ham veriyi eksik alanlara karşı güvenli hâle getirir. */
export function normalizeSettings(raw: unknown): SiteSettings {
  if (!raw || typeof raw !== "object") return defaultSettings;
  const data = raw as Partial<SiteSettings>;

  const bool = (v: unknown, fallback: boolean) =>
    typeof v === "boolean" ? v : fallback;
  const str = (v: unknown, fallback: string) =>
    typeof v === "string" && v.trim() ? v : fallback;
  const num = (v: unknown, fallback: number) =>
    typeof v === "number" && Number.isFinite(v) ? v : fallback;

  return {
    sponsorPageEnabled: bool(
      data.sponsorPageEnabled,
      defaultSettings.sponsorPageEnabled,
    ),
    applicationsOpen: bool(
      data.applicationsOpen,
      defaultSettings.applicationsOpen,
    ),
    sponsorFormOpen: bool(data.sponsorFormOpen, defaultSettings.sponsorFormOpen),
    startsAt: str(data.startsAt, defaultSettings.startsAt),
    dateLabel: str(data.dateLabel, defaultSettings.dateLabel),
    isDatePreliminary: bool(
      data.isDatePreliminary,
      defaultSettings.isDatePreliminary,
    ),
    totalParticipants: num(
      data.totalParticipants,
      defaultSettings.totalParticipants,
    ),
    delegates: num(data.delegates, defaultSettings.delegates),
    applicationsClosedNote: str(
      data.applicationsClosedNote,
      defaultSettings.applicationsClosedNote,
    ),
  };
}
