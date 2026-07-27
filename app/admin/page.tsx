"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { SettingsPanel } from "@/components/admin/settings-panel";
import {
  SubmissionsTable,
  type Column,
} from "@/components/admin/submissions-table";
import { Wordmark } from "@/components/site/wordmark";
import { paths } from "@/lib/firebase";
import { committees } from "@/constants/committees";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "ayarlar", label: "Ayarlar" },
  { id: "delege", label: "Delege başvuruları" },
  { id: "sponsor", label: "Sponsorluk başvuruları" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Komite kimliğini okunur ada çevirir. */
const committeeName = (id: string) =>
  committees.find((c) => c.id === id)?.name ?? id;

type AnyRow = Record<string, unknown>;

const delegateColumns: Column<AnyRow & { id: string }>[] = [
  { key: "name", label: "Ad Soyad", value: (r) => String(r.name ?? "") },
  { key: "school", label: "Okul", value: (r) => String(r.school ?? ""), hideOnMobile: true },
  { key: "city", label: "Şehir", value: (r) => String(r.city ?? "") },
  {
    key: "choices",
    label: "Tercihler",
    value: (r) =>
      Array.isArray(r.choices)
        ? (r.choices as string[]).map(committeeName).join(", ")
        : "",
    hideOnMobile: true,
  },
  { key: "email", label: "E-posta", value: (r) => String(r.email ?? ""), detailOnly: true },
  { key: "phone", label: "Telefon", value: (r) => String(r.phone ?? ""), detailOnly: true },
  { key: "grade", label: "Sınıf", value: (r) => String(r.grade ?? ""), detailOnly: true },
  {
    key: "experience",
    label: "Deneyim",
    value: (r) => String(r.experience ?? ""),
    detailOnly: true,
  },
  {
    key: "motivation",
    label: "Motivasyon",
    value: (r) => String(r.motivation ?? ""),
    detailOnly: true,
  },
];

const sponsorColumns: Column<AnyRow & { id: string }>[] = [
  { key: "org", label: "Kurum", value: (r) => String(r.org ?? "") },
  { key: "person", label: "Yetkili", value: (r) => String(r.person ?? "") },
  { key: "kind", label: "Biçim", value: (r) => String(r.kind ?? ""), hideOnMobile: true },
  {
    key: "areas",
    label: "Destek alanları",
    value: (r) => (Array.isArray(r.areas) ? (r.areas as string[]).join(", ") : ""),
    hideOnMobile: true,
  },
  { key: "email", label: "E-posta", value: (r) => String(r.email ?? ""), detailOnly: true },
  { key: "phone", label: "Telefon", value: (r) => String(r.phone ?? ""), detailOnly: true },
  { key: "role", label: "Görev", value: (r) => String(r.role ?? ""), detailOnly: true },
  { key: "message", label: "Mesaj", value: (r) => String(r.message ?? ""), detailOnly: true },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, configured, logout } = useAdminAuth();
  const [tab, setTab] = useState<TabId>("ayarlar");

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/admin/login");
  }, [loading, configured, user, router]);

  if (!configured) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="max-w-md rounded-lg border border-destructive/30 bg-card p-7 text-center">
          <h1 className="text-lg font-semibold text-card-foreground">
            Firebase yapılandırılmamış
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
            Panelin çalışması için proje kökünde{" "}
            <code className="text-foreground">.env.local</code> dosyasını
            oluşturup Firebase anahtarlarını eklemeniz gerekiyor. Ayrıntılar
            için README dosyasına bakın.
          </p>
        </div>
      </main>
    );
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <Wordmark size={26} showText={false} />
            <span className="text-[15px] font-semibold text-foreground">
              Yönetim paneli
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Siteyi gör
              <ExternalLink className="size-3.5" />
            </Link>

            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/admin/login");
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-3.5" />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-8">
        <p className="text-[13px] text-muted-foreground">
          Giriş yapan: <span className="text-foreground">{user.email}</span>
        </p>

        <nav className="mt-6 flex flex-wrap gap-1.5 border-b border-border pb-4">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "rounded-md px-4 py-2 text-[13.5px] font-medium transition-colors",
                tab === item.id
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:bg-white/6 hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {tab === "ayarlar" && <SettingsPanel />}

          {tab === "delege" && (
            <SubmissionsTable
              path={paths.applications}
              columns={delegateColumns}
              searchKeys={["name", "email", "school", "city"]}
              emptyLabel="Henüz delege başvurusu yok."
              csvName="delege-basvurulari"
            />
          )}

          {tab === "sponsor" && (
            <SubmissionsTable
              path={paths.sponsorRequests}
              columns={sponsorColumns}
              searchKeys={["org", "person", "email"]}
              emptyLabel="Henüz sponsorluk başvurusu yok."
              csvName="sponsorluk-basvurulari"
            />
          )}
        </div>
      </main>
    </div>
  );
}
