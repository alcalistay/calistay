import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, initializeFirestore, setLogLevel, type Firestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Firebase yapılandırılmamışsa site yine de çalışmalı: bu durumda
 * ayarlar `constants/` altındaki varsayılanlara düşer ve formlar
 * e-posta taslağı açmaya devam eder. Böylece `.env.local` dolmadan
 * da geliştirme yapılabiliyor.
 */
export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

// Geliştirme ortamında Firestore'un geçici bağlantı retry uyarılarının
// Next.js dev overlay'ini tetiklemesini önler.
if (typeof window !== "undefined") {
  try {
    setLogLevel("silent");
  } catch {
    // yoksay
  }
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseEnabled) return null;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(config);
  }
  return app;
}

export function getDb(): Firestore | null {
  const instance = getFirebaseApp();
  if (!instance) return null;
  if (!db) {
    try {
      // Tarayıcı ve yerel ağ kısıtlamalarını (adblocker, proxy, gRPC stream kesintileri)
      // aşmak için HTTP long-polling kullanılır.
      db = initializeFirestore(instance, {
        experimentalForceLongPolling: true,
      });
    } catch {
      db = getFirestore(instance);
    }
  }
  return db;
}

export function getFirebaseAuth(): Auth | null {
  const instance = getFirebaseApp();
  if (!instance) return null;
  if (!auth) {
    auth = getAuth(instance);
  }
  return auth;
}

/** Firestore koleksiyon ve doküman yolları tek yerde. */
export const paths = {
  settingsDoc: ["site", "settings"] as const,
  applications: "applications",
  sponsorRequests: "sponsorRequests",
};
