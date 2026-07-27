"use client";

import type { ReactNode } from "react";
import { useSettings } from "@/components/providers/settings-provider";
import { ClosedNotice } from "./closed-notice";

/**
 * Sponsorluk sayfasının görünürlük kapısı.
 *
 * Ayarlar Firestore'dan istemci tarafında okunduğu için sunucuda 404
 * döndürmüyoruz; sayfa yükleniyor durumunda yer tutucu, kapalıysa
 * bilgilendirme kutusu gösteriyoruz. Sayfaya giden bağlantılar da
 * aynı ayara bakarak gizleniyor.
 */
export function SponsorGate({ children }: { children: ReactNode }) {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <div className="h-96 animate-pulse rounded-lg border border-border bg-card" />
      </div>
    );
  }

  if (!settings.sponsorPageEnabled) {
    return (
      <div className="mx-auto w-full max-w-2xl py-10">
        <ClosedNotice
          title="Bu sayfa şu anda yayında değil"
          note="Sponsorluk bilgileri hazırlanıyor. Duyurular için sosyal medya hesaplarımızı takip edebilirsiniz."
          showHomeLink
        />
      </div>
    );
  }

  return <>{children}</>;
}
