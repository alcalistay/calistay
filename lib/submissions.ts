import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import { getDb, paths } from "@/lib/firebase";

export type ApplicationStatus = "yeni" | "kabul" | "red";

export type SubmitResult =
  | { success: true }
  | { success: false; reason: "ALREADY_EXISTS" | "NO_DB" | "ERROR" };

export type DelegateApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  schoolOther?: string;
  grade: string;
  city: string;
  /** Delegenin kendi ev adresi. */
  address: string;
  experience: string;
  /** Varsa delegenin MUN/çalıştay ödülleri */
  awards?: string;
  choices: string[];
  motivation: string;
  status: ApplicationStatus;
  createdAt: Date | null;
};

export type SponsorRequest = {
  id: string;
  org: string;
  person: string;
  role: string;
  email: string;
  phone: string;
  kind: string;
  areas: string[];
  message: string;
  status: ApplicationStatus;
  createdAt: Date | null;
};

/** Firestore Timestamp'i Date'e çevirir; alan yoksa null döner. */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  const ts = value as Timestamp;
  return typeof ts.toDate === "function" ? ts.toDate() : null;
}

/**
 * Kaydı Firestore'a yazar.
 * Firebase yapılandırılmamışsa false döner; çağıran taraf bu durumda
 * e-posta taslağı açmaya geri düşer.
 */
async function submit(path: string, data: Record<string, unknown>) {
  const db = getDb();
  if (!db) return false;

  await addDoc(collection(db, path), {
    ...data,
    status: "yeni",
    createdAt: serverTimestamp(),
  });
  return true;
}

/**
 * Delege başvurusunu Firestore'a yazar.
 * Telefon numarasını benzersiz doküman ID'si yaparak mükerrer başvuruları
 * veritabanı seviyesinde engeller.
 */
export async function submitApplication(
  data: Omit<DelegateApplication, "id" | "status" | "createdAt">,
): Promise<SubmitResult> {
  const db = getDb();
  if (!db) return { success: false, reason: "NO_DB" };

  const cleanPhone = data.phone.replace(/\D/g, "");
  const safeEmail = data.email.trim().toLowerCase().replace(/[\/\s]/g, "_");

  // Doküman ID'si telefon numarası bazlıdır. Var olan doküman güncellenemez (update izni yoktur).
  const appRef = doc(db, paths.applications, `tel_${cleanPhone}`);

  try {
    await setDoc(appRef, {
      ...data,
      phoneNormalized: cleanPhone,
      emailNormalized: safeEmail,
      status: "yeni",
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err: unknown) {
    const errorObj = err as { code?: string; message?: string };
    if (errorObj?.code === "permission-denied") {
      return { success: false, reason: "ALREADY_EXISTS" };
    }
    console.error("Firestore submission error:", err);
    return { success: false, reason: "ERROR" };
  }
}

export const submitSponsorRequest = (
  data: Omit<SponsorRequest, "id" | "status" | "createdAt">,
) => submit(paths.sponsorRequests, data);
