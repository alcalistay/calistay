import {
  addDoc,
  collection,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getDb, paths } from "@/lib/firebase";

export type ApplicationStatus = "yeni" | "kabul" | "red";

export type DelegateApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
  city: string;
  experience: string;
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

export const submitApplication = (
  data: Omit<DelegateApplication, "id" | "status" | "createdAt">,
) => submit(paths.applications, data);

export const submitSponsorRequest = (
  data: Omit<SponsorRequest, "id" | "status" | "createdAt">,
) => submit(paths.sponsorRequests, data);
