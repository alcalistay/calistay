"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { getDb, paths } from "@/lib/firebase";
import { useSettings } from "@/components/providers/settings-provider";
import type { SiteSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type ToggleKey = Extract<
  keyof SiteSettings,
  "sponsorPageEnabled" | "applicationsOpen" | "sponsorFormOpen" | "isDatePreliminary"
>;

const toggles: { key: ToggleKey; title: string; detail: string }[] = [
  {
    key: "sponsorPageEnabled",
    title: "Sponsorluk sayfası",
    detail:
      "Kapatıldığında /sponsor sayfası kapalı uyarısı gösterir; menüdeki ve ana sayfadaki bağlantılar gizlenir.",
  },
  {
    key: "applicationsOpen",
    title: "Delege başvuruları",
    detail: "Kapatıldığında ana sayfadaki başvuru formu yerine bilgilendirme çıkar.",
  },
  {
    key: "sponsorFormOpen",
    title: "Sponsorluk başvuru formu",
    detail:
      "Sayfa açık kalırken yalnızca formu kapatmak isterseniz bunu kullanın.",
  },
  {
    key: "isDatePreliminary",
    title: "Tarih kesinleşmedi notu",
    detail: "Açıkken geri sayımın altında “kesin gün ve saat yakında” yazar.",
  },
];

export function SettingsPanel() {
  const { settings } = useSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [syncedFrom, setSyncedFrom] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  // Firestore'dan yeni bir anlık görüntü geldiğinde taslağı tazele.
  // Effect yerine render sırasında yapılıyor: React'in "prop değişince
  // state'i ayarla" kalıbı, fazladan bir render turunu önlüyor.
  if (syncedFrom !== settings) {
    setSyncedFrom(settings);
    setDraft(settings);
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  async function save() {
    const db = getDb();
    if (!db) return;

    setSaving(true);
    try {
      await setDoc(doc(db, ...paths.settingsDoc), draft, { merge: true });
      toast.success("Ayarlar kaydedildi.");
    } catch {
      toast.error("Kaydedilemedi.", {
        description: "Firestore kurallarınızın yazma izni verdiğinden emin olun.",
      });
    } finally {
      setSaving(false);
    }
  }

  /** ISO tarihi <input type="datetime-local"> biçimine çevirir. */
  const toLocalInput = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours(),
    )}:${pad(d.getMinutes())}`;
  };

  return (
    <div className="space-y-4">
      {/* Görünürlük anahtarları */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold text-card-foreground">
          Görünürlük
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Değişiklikler kaydedildikten sonra açık olan tüm sekmelere anında
          yansır.
        </p>

        <div className="mt-5 divide-y divide-border">
          {toggles.map((toggle) => (
            <div
              key={toggle.key}
              className="flex items-start justify-between gap-6 py-4 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-[14px] font-medium text-foreground">
                  {toggle.title}
                </p>
                <p className="mt-1 max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
                  {toggle.detail}
                </p>
              </div>

              <Switch
                checked={draft[toggle.key]}
                onChange={(value) => update(toggle.key, value)}
                label={toggle.title}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Tarih */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold text-card-foreground">Tarih</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Geri sayım hedefi">
            <input
              type="datetime-local"
              value={toLocalInput(draft.startsAt)}
              onChange={(e) => {
                const next = new Date(e.target.value);
                if (!Number.isNaN(next.getTime()))
                  update("startsAt", next.toISOString());
              }}
              className={inputClass}
            />
          </Field>

          <Field label="Görünen tarih metni">
            <input
              type="text"
              value={draft.dateLabel}
              onChange={(e) => update("dateLabel", e.target.value)}
              placeholder="Aralık 2026"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {/* Kontenjan */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold text-card-foreground">
          Kontenjan
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Ana sayfadaki ve sponsorluk sayfasındaki istatistik kartlarını besler.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Toplam katılımcı">
            <input
              type="number"
              min={0}
              value={draft.totalParticipants}
              onChange={(e) =>
                update("totalParticipants", Number(e.target.value) || 0)
              }
              className={inputClass}
            />
          </Field>

          <Field label="Delege sayısı">
            <input
              type="number"
              min={0}
              value={draft.delegates}
              onChange={(e) => update("delegates", Number(e.target.value) || 0)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {/* Kapalı mesajı */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold text-card-foreground">
          Başvurular kapalıyken gösterilecek mesaj
        </h2>
        <textarea
          rows={3}
          value={draft.applicationsClosedNote}
          onChange={(e) => update("applicationsClosedNote", e.target.value)}
          className={cn(inputClass, "mt-4 h-auto resize-none py-2.5")}
        />
      </section>

      {/* Kaydet çubuğu */}
      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-lg border border-border bg-popover/95 p-4 backdrop-blur-md">
        <p className="text-[13px] text-muted-foreground">
          {dirty ? "Kaydedilmemiş değişiklikler var." : "Tüm değişiklikler kaydedildi."}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDraft(settings)}
            disabled={!dirty || saving}
            className="rounded-md border border-border px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            Geri al
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="rounded-md bg-primary px-5 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-md border border-input bg-white/5 px-3.5 text-[14px] text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-foreground">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
        checked
          ? "border-accent/60 bg-accent/70"
          : "border-border bg-white/8",
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-foreground transition-all duration-300",
          checked ? "left-[calc(100%-1.25rem)]" : "left-1",
        )}
      />
    </button>
  );
}
