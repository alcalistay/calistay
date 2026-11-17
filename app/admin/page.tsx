"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  LogOut,
  Users,
  Building2,
  SlidersHorizontal,
  ShieldCheck,
} from "lucide-react";
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
  { id: "delege", label: "Delege Başvuruları", icon: Users },
  { id: "sponsor", label: "Sponsorluk Başvuruları", icon: Building2 },
  { id: "ayarlar", label: "Site Kontrolleri & Ayarlar", icon: SlidersHorizontal },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Komite kimliğini okunur ada çevirir */
const committeeName = (id: string) =>
  committees.find((c) => c.id === id)?.name ?? id;

type AnyRow = Record<string, unknown>;

const delegateColumns: Column<AnyRow & { id: string }>[] = [
  { key: "name", label: "Ad Soyad", value: (r) => String(r.name ?? "") },
  {
    key: "school",
    label: "Okul",
    value: (r) => {
      const s = String(r.school ?? "");
      const other = String(r.schoolOther ?? "");
      if (s === "Diğer" && other) return `${other} (Diğer)`;
      return s || other || "—";
    },
    hideOnMobile: true,
  },
  { key: "city", label: "Şehir", value: (r) => String(r.city ?? "") },
  {
    key: "choices",
    label: "Tercihler",
    value: (r) =>
      Array.isArray(r.choices)
        ? (r.choices as string[]).map(committeeName).join(" → ")
        : "",
    hideOnMobile: true,
  },
  { key: "phone", label: "Telefon", value: (r) => String(r.phone ?? "") },
  { key: "email", label: "E-posta", value: (r) => String(r.email ?? ""), detailOnly: true },
  { key: "grade", label: "Sınıf", value: (r) => String(r.grade ?? "—"), detailOnly: true },
  {
    key: "experience",
    label: "Geçmiş Deneyim",
    value: (r) => {
      const exp = String(r.experience ?? "0");
      return `${exp} konferans/çalıştay`;
    },
    detailOnly: true,
  },
  { key: "address", label: "Açık Adres", value: (r) => String(r.address ?? ""), detailOnly: true },
  {
    key: "motivation",
    label: "Motivasyon Metni",
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
    label: "Destek Alanları",
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
  const [tab, setTab] = useState<TabId>("delege");

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/admin/login");
  }, [loading, configured, user, router]);

  if (!configured) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="max-w-md rounded-xl border border-destructive/30 bg-card p-8 text-center shadow-lg">
          <h1 className="text-lg font-semibold text-card-foreground">
            Firebase Yapılandırılmamış
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
            Panelin çalışması için proje kökündeki{" "}
            <code className="text-foreground">.env.local</code> dosyasının
            Firebase anahtarlarını içerdiğinden emin olun.
          </p>
        </div>
      </main>
    );
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
          <span className="text-[13px] text-muted-foreground">
            Yönetim paneli yükleniyor…
          </span>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ÜST BAR */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Wordmark size={26} showText={false} />
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-foreground">
                ALÇAL Yönetim Paneli
              </span>
              <span className="hidden items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-medium text-emerald-400 sm:inline-flex">
                <ShieldCheck className="size-3" />
                Canlı
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right text-[12px] text-muted-foreground sm:block">
              <span className="text-foreground font-medium">{user.email}</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
            >
              <span>Siteyi Gör</span>
              <ExternalLink className="size-3.5" />
            </Link>

            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/admin/login");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
            >
              <LogOut className="size-3.5" />
              <span>Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      {/* ANA İÇERİK */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* SEKMELER */}
        <nav className="mb-6 flex flex-wrap gap-2 border-b border-border/60 pb-3">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-medium transition-all duration-200",
                  active
                    ? "bg-accent/15 text-accent shadow-sm border border-accent/30"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground border border-transparent",
                )}
              >
                <Icon className={cn("size-4", active ? "text-accent" : "opacity-70")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* SEKME İÇERİKLERİ */}
        <div>
          {tab === "delege" && (
            <SubmissionsTable
              path={paths.applications}
              columns={delegateColumns}
              searchKeys={["name", "email", "phone", "school", "city"]}
              emptyLabel="Henüz kayıtlı bir delege başvurusu bulunmuyor."
              csvName="alcal27-delege-basvurulari"
              isDelegate={true}
            />
          )}

          {tab === "sponsor" && (
            <SubmissionsTable
              path={paths.sponsorRequests}
              columns={sponsorColumns}
              searchKeys={["org", "person", "email", "phone"]}
              emptyLabel="Henüz bir sponsorluk başvurusu bulunmuyor."
              csvName="alcal27-sponsorluk-basvurulari"
              isDelegate={false}
            />
          )}

          {tab === "ayarlar" && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}
