"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firebaseEnabled, getDb, paths } from "@/lib/firebase";
import {
  defaultSettings,
  normalizeSettings,
  type SiteSettings,
} from "@/lib/settings";

type Ctx = {
  settings: SiteSettings;
  /** İlk okuma tamamlanana kadar true. Firebase kapalıysa hep false. */
  loading: boolean;
};

const SettingsContext = createContext<Ctx>({
  settings: defaultSettings,
  loading: false,
});

/**
 * Ayarlar Firestore'dan canlı olarak dinlenir: panelden bir anahtar
 * değiştiğinde açık sekmeler yenilenmeden güncellenir.
 *
 * Sunucu tarafında admin SDK kullanılmadığı için ilk render varsayılan
 * değerlerle yapılır; bu yüzden görünürlüğe bağlı bileşenler `loading`
 * bitene kadar yer tutucu gösterir.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    const db = getDb();
    if (!db) return;

    const unsubscribe = onSnapshot(
      doc(db, ...paths.settingsDoc),
      (snapshot) => {
        setSettings(
          snapshot.exists() ? normalizeSettings(snapshot.data()) : defaultSettings,
        );
        setLoading(false);
      },
      () => {
        // Okuma başarısızsa (kural hatası, çevrimdışı) varsayılanlarla devam et.
        setSettings(defaultSettings);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
