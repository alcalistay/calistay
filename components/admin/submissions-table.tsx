"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  X,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { firebaseEnabled, getDb } from "@/lib/firebase";
import { toDate, type ApplicationStatus } from "@/lib/submissions";
import { committees } from "@/constants/committees";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  label: string;
  value: (row: T) => string;
  hideOnMobile?: boolean;
  detailOnly?: boolean;
};

type Row = {
  id: string;
  status: ApplicationStatus;
  createdAt: Date | null;
} & Record<string, unknown>;

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  yeni: "Yeni / Beklemede",
  kabul: "Kabul Edildi",
  red: "Reddedildi",
};

const STATUS_SHORT: Record<ApplicationStatus, string> = {
  yeni: "Yeni",
  kabul: "Kabul",
  red: "Red",
};

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  yeni: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  kabul: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  red: "border-rose-500/30 bg-rose-500/10 text-rose-400",
};

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateOnlyFormat = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "short",
});

const committeeName = (id: string) => {
  if (!id || id === "Admin" || id === "—") return "—";
  const found = committees.find((c) => c.id === id);
  if (found) return found.name;
  const legacyMap: Record<string, string> = {
    "avrupa-birligi-konseyi": "Avrupa Birliği Konseyi",
    "unhcr": "UNHCR",
    "interpol": "Interpol",
    "dunya-ticaret-orgutu": "Dünya Ticaret Örgütü",
    "turkiye-buyuk-millet-meclisi": "TBMM",
    "nato": "NATO",
  };
  if (legacyMap[id]) return legacyMap[id];
  return id
    .split("-")
    .map((w) => w.charAt(0).toLocaleUpperCase("tr") + w.slice(1))
    .join(" ");
};

// Web Tablosu İçin Genişletilmiş Varsayılan Sütun Aralıkları
const DEFAULT_WIDTHS: Record<string, number> = {
  index: 60,
  name: 220,
  school: 320,     // Okul isimleri uzun olduğu için ferah tutuldu
  committee: 200,  // 1. Tercih komite
  phone: 170,
  status: 190,
  actions: 130,
};

export function SubmissionsTable<T extends Row>({
  path,
  columns,
  searchKeys,
  emptyLabel,
  csvName,
  isDelegate = true,
}: {
  path: string;
  columns: Column<T>[];
  searchKeys: (keyof T & string)[];
  emptyLabel: string;
  csvName: string;
  isDelegate?: boolean;
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(firebaseEnabled);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "hepsi">("hepsi");
  const [committeeFilter, setCommitteeFilter] = useState<string>("hepsi");
  const [roleFilter, setRoleFilter] = useState<"hepsi" | "delege" | "chair" | "admin">("hepsi");
  const [selectedRow, setSelectedRow] = useState<T | null>(null);

  // Dışa Aktarma Menüsü Açık/Kapalı
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Web Tablosu Sütun Genişlikleri (Sürüklenebilir)
  const [colWidths, setColWidths] = useState<Record<string, number>>(DEFAULT_WIDTHS);

  // Tarayıcı hafızasından kayıtlı sütun genişliklerini getir
  useEffect(() => {
    try {
      const saved = localStorage.getItem("alcal27_admin_col_widths_v2");
      if (saved) {
        setColWidths({ ...DEFAULT_WIDTHS, ...JSON.parse(saved) });
      }
    } catch {
      // ignore
    }
  }, []);

  // Menü dışına tıklanınca kapat
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sütun genişliğini fareyle sürükleyerek genişletme
  function startResizing(colKey: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const initialWidth = colWidths[colKey] || DEFAULT_WIDTHS[colKey] || 150;

    function onMouseMove(moveEvent: MouseEvent) {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(60, initialWidth + delta);
      setColWidths((prev) => {
        const updated = { ...prev, [colKey]: newWidth };
        try {
          localStorage.setItem("alcal27_admin_col_widths_v2", JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    }

    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function resetWidths() {
    setColWidths(DEFAULT_WIDTHS);
    try {
      localStorage.removeItem("alcal27_admin_col_widths_v2");
    } catch {}
    toast.info("Sütun genişlikleri ferah varsayılanlara sıfırlandı.");
  }

  // Firestore dinleyici
  useEffect(() => {
    const db = getDb();
    if (!db) return;

    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        setRows(
          snapshot.docs.map((d) => {
            const data = d.data();
            return {
              ...data,
              id: d.id,
              status: (data.status as ApplicationStatus) ?? "yeni",
              createdAt: toDate(data.createdAt),
            } as unknown as T;
          }),
        );
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      },
    );
  }, [path]);

  // Filtrelenmiş liste
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("tr");

    return rows.filter((row) => {
      if (statusFilter !== "hepsi" && row.status !== statusFilter) return false;

      if (isDelegate && roleFilter !== "hepsi") {
        const rType = String(row.applicantType ?? "delege").toLowerCase();
        if (rType !== roleFilter) return false;
      }

      if (isDelegate && committeeFilter !== "hepsi") {
        const choices = Array.isArray(row.choices) ? (row.choices as string[]) : [];
        if (!choices.includes(committeeFilter)) return false;
      }

      if (!term) return true;
      return searchKeys.some((key) =>
        String(row[key] ?? "")
          .toLocaleLowerCase("tr")
          .includes(term),
      );
    });
  }, [rows, search, statusFilter, committeeFilter, roleFilter, searchKeys, isDelegate]);

  // İstatistikler
  const counts = useMemo(
    () => ({
      hepsi: rows.length,
      yeni: rows.filter((r) => r.status === "yeni").length,
      kabul: rows.filter((r) => r.status === "kabul").length,
      red: rows.filter((r) => r.status === "red").length,
    }),
    [rows],
  );

  async function setStatus(id: string, status: ApplicationStatus) {
    const db = getDb();
    if (!db) return;
    try {
      await updateDoc(doc(db, path, id), { status });
      toast.success(`Durum "${STATUS_SHORT[status]}" olarak güncellendi.`);
      if (selectedRow && selectedRow.id === id) {
        setSelectedRow((prev) => (prev ? { ...prev, status } : null));
      }
    } catch {
      toast.error("Durum güncellenemedi.");
    }
  }

  /** Tek bir başvuruyu kalıcı olarak sil */
  async function deleteSubmission(id: string, name?: string) {
    const displayName = name ? `"${name}" adlı` : "Bu";
    if (
      !window.confirm(
        `${displayName} başvuruyu kalıcı olarak silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`
      )
    ) {
      return;
    }

    const db = getDb();
    if (!db) return;
    try {
      await deleteDoc(doc(db, path, id));
      toast.success("Başvuru kalıcı olarak silindi.");
      if (selectedRow && selectedRow.id === id) {
        setSelectedRow(null);
      }
    } catch (err) {
      console.error("Silme hatası:", err);
      toast.error(
        "Başvuru silinemedi. Firebase Console Kuralları'nda delete izninin açık olduğundan emin olun."
      );
    }
  }

  /** Mevcut filtredeki tüm başvuruları toplu olarak sil */
  async function deleteAllSubmissions() {
    const target = filtered;
    if (target.length === 0) return;
    const count = target.length;
    if (
      !window.confirm(
        `DİKKAT: Listedeki ${count} adet başvuru kalıcı olarak silinecek!\n\nBu işlem geri alınamaz. Devam etmek istiyor musunuz?`
      )
    ) {
      return;
    }

    const db = getDb();
    if (!db) return;
    try {
      let deletedCount = 0;
      for (const r of target) {
        await deleteDoc(doc(db, path, r.id));
        deletedCount++;
      }
      toast.success(`${deletedCount} adet başvuru kalıcı olarak silindi.`);
      setSelectedRow(null);
    } catch (err) {
      console.error("Toplu silme hatası:", err);
      toast.error(
        "Başvurular silinirken bir hata oluştu. Firebase Console Kuralları'nı kontrol edin."
      );
    }
  }

  /**
   * KUSURSUZ VE SÜTUNLARI ÖZEL OLARAK GENİŞLETİLMİŞ GERÇEK EXCEL (.XLSX) DOSYASI
   * Excel'de açıldığında sütunlar sıkışmaz; Ad Soyad, Okul, Adres ve Motivasyon sütunları
   * önceden belirlenmiş geniş aralıklarla ferah ferah açılır!
   */
  function exportExcelFile(targetRows: T[], categoryLabel: string) {
    if (targetRows.length === 0) {
      toast.error(`Dışa aktarılacak "${categoryLabel}" kaydı bulunamadı.`);
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const safeTag = categoryLabel.toLocaleLowerCase("tr").replace(/[^a-z0-9]/g, "-");

    if (isDelegate) {
      const headers = [
        "Sıra",
        "Başvuru Türü",
        "Kayıt Tarihi",
        "Durum",
        "Ad Soyad",
        "Telefon",
        "E-posta",
        "Şehir",
        "Okul",
        "Sınıf",
        "Geçmiş Deneyim Sayısı",
        "Katılınan Çalıştay/MUN ve Ödüller",
        "1. Tercih Komite / Departman",
        "2. Tercih Komite",
        "3. Tercih Komite",
        "Açık Ev Adresi",
        "Motivasyon Metni",
      ];

      const dataRows = targetRows.map((row, i) => {
        const choices = Array.isArray(row.choices) ? (row.choices as string[]) : [];
        const schoolName =
          row.school === "Diğer" && row.schoolOther
            ? `${row.schoolOther} (Diğer)`
            : String(row.school || row.schoolOther || "—");

        const rawType = String(row.applicantType ?? "delege").toLowerCase();
        const roleLabel =
          rawType === "chair"
            ? "Chair"
            : rawType === "admin"
              ? "Admin"
              : "Delege";

        const awardsOrEvents = String(
          row.pastConferencesAndAwards || row.awards || "—",
        );

        const isRowAdmin = rawType === "admin";
        const choice1 =
          isRowAdmin
            ? "—"
            : committeeName(choices[0] || "");

        return [
          i + 1,
          roleLabel,
          row.createdAt ? dateFormat.format(row.createdAt) : "—",
          STATUS_SHORT[row.status] || "Yeni",
          String(row.name || "—"),
          String(row.phone || "—"),
          String(row.email || "—"),
          String(row.city || "—"),
          schoolName,
          String(row.grade || "—"),
          row.experience ? `${row.experience} konferans` : "0",
          awardsOrEvents,
          choice1,
          rawType === "admin" ? "—" : committeeName(choices[1] || ""),
          rawType === "admin" ? "—" : committeeName(choices[2] || ""),
          String(row.address || "—"),
          String(row.motivation || "—"),
        ];
      });

      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

      // EXCEL İÇİN ÖZEL GENİŞ SÜTUN ARALIKLARI (EXCELDE AÇILDIĞINDA ASLA DAR KALMAZ)
      ws["!cols"] = [
        { wch: 8 },   // Sıra
        { wch: 18 },  // Başvuru Türü (Delege / Chair / Admin)
        { wch: 22 },  // Kayıt Tarihi
        { wch: 16 },  // Durum
        { wch: 32 },  // Ad Soyad (Ultra Geniş)
        { wch: 22 },  // Telefon (Ferah)
        { wch: 36 },  // E-posta (Geniş)
        { wch: 20 },  // Şehir
        { wch: 52 },  // Okul Adı (Devasa Genişlik)
        { wch: 14 },  // Sınıf
        { wch: 22 },  // Geçmiş Deneyim Sayısı
        { wch: 45 },  // Katılınan Çalıştay/MUN ve Ödüller (Geniş)
        { wch: 34 },  // 1. Tercih Komite / Departman
        { wch: 32 },  // 2. Tercih Komite
        { wch: 32 },  // 3. Tercih Komite
        { wch: 70 },  // Açık Ev Adresi (Çok Geniş)
        { wch: 95 },  // Motivasyon Metni (Ultra Geniş ve Ferah!)
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Delege Başvuruları");
      XLSX.writeFile(wb, `${csvName}-${safeTag}-${dateStr}.xlsx`);
    } else {
      // Sponsorluk Listesi
      const headers = [
        "Sıra",
        "Kayıt Tarihi",
        "Durum",
        "Kurum Adı",
        "Yetkili Kişi",
        "Görev / Pozisyon",
        "E-posta",
        "Telefon",
        "Destek Biçimi",
        "Destek Alanları",
        "Mesaj",
      ];

      const dataRows = targetRows.map((row, i) => {
        const areas = Array.isArray(row.areas) ? (row.areas as string[]).join(", ") : "";
        return [
          i + 1,
          row.createdAt ? dateFormat.format(row.createdAt) : "—",
          STATUS_SHORT[row.status] || "Yeni",
          String(row.org || "—"),
          String(row.person || "—"),
          String(row.role || "—"),
          String(row.email || "—"),
          String(row.phone || "—"),
          String(row.kind || "—"),
          areas,
          String(row.message || "—"),
        ];
      });

      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
      ws["!cols"] = [
        { wch: 8 },
        { wch: 20 },
        { wch: 15 },
        { wch: 35 },
        { wch: 25 },
        { wch: 22 },
        { wch: 30 },
        { wch: 22 },
        { wch: 20 },
        { wch: 35 },
        { wch: 65 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sponsorluk Başvuruları");
      XLSX.writeFile(wb, `${csvName}-${safeTag}-${dateStr}.xlsx`);
    }

    setExportMenuOpen(false);
    toast.success(`Excel (.xlsx) dosyası indirildi`, {
      description: `${targetRows.length} adet kayıt dışa aktarıldı.`,
    });
  }

  /**
   * YEDEK DÜZ METİN CSV ÇIKTISI (Noktalı Virgül + UTF-8 BOM)
   */
  function exportCleanCsv(targetRows: T[], categoryLabel: string) {
    if (targetRows.length === 0) {
      toast.error(`Dışa aktarılacak "${categoryLabel}" kaydı bulunamadı.`);
      return;
    }

    const clean = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      let s = String(val);
      s = s.replace(/\r\n/g, " ").replace(/\n/g, " ").replace(/\r/g, " ");
      s = s.replace(/"/g, '""');
      return `"${s.trim()}"`;
    };

    let csvContent = "\uFEFF"; // UTF-8 BOM

    if (isDelegate) {
      const headers = [
        "Sıra",
        "Kayıt Tarihi",
        "Durum",
        "Ad Soyad",
        "Telefon",
        "E-posta",
        "Şehir",
        "Okul",
        "Sınıf",
        "Geçmiş Deneyim",
        "Varsa Ödüller",
        "1. Tercih Komite",
        "2. Tercih Komite",
        "3. Tercih Komite",
        "Açık Adres",
        "Motivasyon Metni",
      ];

      const lines = [headers.join(";")];

      targetRows.forEach((row, i) => {
        const choices = Array.isArray(row.choices) ? (row.choices as string[]) : [];
        const schoolName =
          row.school === "Diğer" && row.schoolOther
            ? `${row.schoolOther} (Diğer)`
            : String(row.school || row.schoolOther || "");

        const isRowAdmin =
          String(row.applicantType ?? "delege").toLowerCase() === "admin";
        const line = [
          i + 1,
          row.createdAt ? dateFormat.format(row.createdAt) : "—",
          STATUS_SHORT[row.status] || "Yeni",
          clean(row.name),
          clean(row.phone),
          clean(row.email),
          clean(row.city),
          clean(schoolName),
          clean(row.grade || "—"),
          clean(row.experience ? `${row.experience} konferans` : "0"),
          clean(row.pastConferencesAndAwards || row.awards || "—"),
          clean(isRowAdmin ? "—" : committeeName(choices[0] || "")),
          clean(isRowAdmin ? "—" : committeeName(choices[1] || "")),
          clean(isRowAdmin ? "—" : committeeName(choices[2] || "")),
          clean(row.address),
          clean(row.motivation),
        ];

        lines.push(line.join(";"));
      });

      csvContent += lines.join("\r\n");
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    const safeTag = categoryLabel.toLocaleLowerCase("tr").replace(/[^a-z0-9]/g, "-");
    link.download = `${csvName}-${safeTag}-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportMenuOpen(false);
    toast.success(`CSV listesi indirildi!`, {
      description: `${targetRows.length} adet "${categoryLabel}" kaydı CSV formatında indirildi.`,
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. ÜST İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Toplam */}
        <div
          onClick={() => setStatusFilter("hepsi")}
          className={cn(
            "cursor-pointer rounded-xl border p-4 transition-all duration-200",
            statusFilter === "hepsi"
              ? "border-accent bg-accent/10 shadow-sm"
              : "border-border bg-card/60 hover:bg-card hover:border-border/80",
          )}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[12px] font-medium uppercase tracking-wider">
              Toplam
            </span>
            <Users className="size-4" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {counts.hepsi}
          </div>
          <span className="mt-1 block text-[11px] text-muted-foreground">
            Tüm başvurular
          </span>
        </div>

        {/* Yeni (Bekleyen) */}
        <div
          onClick={() => setStatusFilter("yeni")}
          className={cn(
            "cursor-pointer rounded-xl border p-4 transition-all duration-200",
            statusFilter === "yeni"
              ? "border-amber-500/50 bg-amber-500/10 shadow-sm"
              : "border-border bg-card/60 hover:bg-card hover:border-amber-500/30",
          )}
        >
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[12px] font-medium uppercase tracking-wider">
              İncelenecek
            </span>
            <Clock className="size-4" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-400 sm:text-3xl">
            {counts.yeni}
          </div>
          <span className="mt-1 block text-[11px] text-muted-foreground">
            İnceleme bekliyor
          </span>
        </div>

        {/* Kabul Edilen */}
        <div
          onClick={() => setStatusFilter("kabul")}
          className={cn(
            "cursor-pointer rounded-xl border p-4 transition-all duration-200",
            statusFilter === "kabul"
              ? "border-emerald-500/50 bg-emerald-500/10 shadow-sm"
              : "border-border bg-card/60 hover:bg-card hover:border-emerald-500/30",
          )}
        >
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[12px] font-medium uppercase tracking-wider">
              Kabul
            </span>
            <CheckCircle2 className="size-4" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-400 sm:text-3xl">
            {counts.kabul}
          </div>
          <span className="mt-1 block text-[11px] text-muted-foreground">
            Onaylanan delegeler
          </span>
        </div>

        {/* Reddedilen */}
        <div
          onClick={() => setStatusFilter("red")}
          className={cn(
            "cursor-pointer rounded-xl border p-4 transition-all duration-200",
            statusFilter === "red"
              ? "border-rose-500/50 bg-rose-500/10 shadow-sm"
              : "border-border bg-card/60 hover:bg-card hover:border-rose-500/30",
          )}
        >
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[12px] font-medium uppercase tracking-wider">
              Red
            </span>
            <XCircle className="size-4" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-400 sm:text-3xl">
            {counts.red}
          </div>
          <span className="mt-1 block text-[11px] text-muted-foreground">
            Reddedilenler
          </span>
        </div>
      </div>

      {/* 2. ARAÇ ÇUBUĞU */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Sol Filtreler */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Durum Butonları */}
          <div className="inline-flex rounded-lg border border-border bg-white/[0.03] p-1">
            {(["hepsi", "yeni", "kabul", "red"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                  statusFilter === key
                    ? "bg-accent/20 text-accent shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {key === "hepsi" ? "Tümü" : STATUS_SHORT[key]}
                <span className="ml-1.5 opacity-60">({counts[key]})</span>
              </button>
            ))}
          </div>

          {/* Başvuru Türü Filtresi (Delege, Chair, Admin) */}
          {isDelegate && (
            <div className="inline-flex rounded-lg border border-border bg-white/[0.03] p-1">
              {(["hepsi", "delege", "chair", "admin"] as const).map((rKey) => {
                const count =
                  rKey === "hepsi"
                    ? rows.length
                    : rows.filter(
                        (r) =>
                          String(r.applicantType ?? "delege").toLowerCase() ===
                          rKey,
                      ).length;
                return (
                  <button
                    key={rKey}
                    type="button"
                    onClick={() => setRoleFilter(rKey)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                      roleFilter === rKey
                        ? "bg-accent/20 text-accent shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {rKey === "hepsi"
                      ? "Tüm Roller"
                      : rKey === "chair"
                        ? "Chair"
                        : rKey === "admin"
                          ? "Admin"
                          : "Delege"}
                    <span className="ml-1.5 opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Komite Filtresi */}
          {isDelegate && (
            <div className="relative">
              <select
                value={committeeFilter}
                onChange={(e) => setCommitteeFilter(e.target.value)}
                className="h-9 rounded-lg border border-input bg-white/5 pl-3 pr-8 text-[12.5px] text-foreground outline-none transition-colors [color-scheme:dark] focus:border-ring"
              >
                <option value="hepsi">Tüm Komiteler ({rows.length})</option>
                {committees.map((c) => {
                  const comCount = rows.filter((r) =>
                    Array.isArray(r.choices) && (r.choices as string[]).includes(c.id),
                  ).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({comCount})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {/* Sağ: Arama, Sıfırlama ve GENİŞ EXCEL İNDİRME */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ad, telefon, okul veya şehir ara..."
              className="h-9.5 w-full rounded-lg border border-input bg-white/5 pl-9 pr-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>

          {/* Tablo Sütun Genişliği Sıfırlama Butonu */}
          <button
            type="button"
            onClick={resetWidths}
            title="Tablo sütun genişliklerini ferah varsayılana getir"
            className="inline-flex size-9.5 items-center justify-center rounded-lg border border-border bg-white/5 text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
          </button>

          {/* EXCEL / CSV İNDİRME DROPDOWN */}
          <div className="relative" ref={exportMenuRef}>
            <div className="inline-flex rounded-lg shadow-sm">
              {/* Ana Buton: Doğrudan Genişletilmiş .XLSX Excel Dosyası İndirir */}
              <button
                type="button"
                onClick={() =>
                  exportExcelFile(
                    filtered,
                    statusFilter === "hepsi"
                      ? "filtreli-liste"
                      : `${statusFilter}-olanlar`,
                  )
                }
                disabled={filtered.length === 0}
                title="Başvuruları Excel (.xlsx) olarak indir"
                className="inline-flex h-9.5 items-center gap-2 rounded-l-lg bg-emerald-600 px-3.5 text-[13px] font-semibold text-white transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FileSpreadsheet className="size-4" />
                <span>Excel İndir</span>
                <span className="rounded bg-black/20 px-1.5 py-0.5 text-[11px] font-bold">
                  {filtered.length}
                </span>
              </button>

              {/* Açılır Menü Oku */}
              <button
                type="button"
                onClick={() => setExportMenuOpen((prev) => !prev)}
                disabled={rows.length === 0}
                title="Kabul, red veya tüm başvurular için Excel seçenekleri"
                className="inline-flex h-9.5 items-center justify-center rounded-r-lg border-l border-emerald-700 bg-emerald-600 px-2 text-white transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>

            {/* Açılır Menü */}
            {exportMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1.5 w-72 rounded-xl border border-border bg-card p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Excel (.xlsx) Olarak İndir
                </div>

                <div className="mt-1 space-y-0.5">
                  {/* Tüm Başvurular */}
                  <button
                    type="button"
                    onClick={() => exportExcelFile(rows, "tum-basvurular")}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12.5px] font-medium text-foreground transition-colors hover:bg-white/6"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="size-3.5 text-accent" />
                      Tüm Başvurular (.xlsx)
                    </span>
                    <span className="tnum rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {counts.hepsi}
                    </span>
                  </button>

                  {/* Sadece Kabul Edilenler */}
                  <button
                    type="button"
                    onClick={() =>
                      exportExcelFile(
                        rows.filter((r) => r.status === "kabul"),
                        "kabul-edilenler",
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12.5px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                      Kabul Edilenler (.xlsx)
                    </span>
                    <span className="tnum rounded bg-emerald-500/20 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                      {counts.kabul}
                    </span>
                  </button>

                  {/* Sadece İncelenecekler (Yeni) */}
                  <button
                    type="button"
                    onClick={() =>
                      exportExcelFile(
                        rows.filter((r) => r.status === "yeni"),
                        "incelenecek-yeni",
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12.5px] font-medium text-amber-400 transition-colors hover:bg-amber-500/10"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="size-3.5 text-amber-400" />
                      İncelenecekler (Yeni) (.xlsx)
                    </span>
                    <span className="tnum rounded bg-amber-500/20 px-1.5 py-0.5 text-[11px] font-semibold text-amber-300">
                      {counts.yeni}
                    </span>
                  </button>

                  {/* Sadece Reddedilenler */}
                  <button
                    type="button"
                    onClick={() =>
                      exportExcelFile(
                        rows.filter((r) => r.status === "red"),
                        "reddedilenler",
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12.5px] font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
                  >
                    <span className="flex items-center gap-2">
                      <XCircle className="size-3.5 text-rose-400" />
                      Reddedilenler (.xlsx)
                    </span>
                    <span className="tnum rounded bg-rose-500/20 px-1.5 py-0.5 text-[11px] font-semibold text-rose-300">
                      {counts.red}
                    </span>
                  </button>

                  {/* Aktif Filtreli Liste */}
                  {(search || statusFilter !== "hepsi" || committeeFilter !== "hepsi") && (
                    <button
                      type="button"
                      onClick={() =>
                        exportExcelFile(filtered, "mevcut-filtrelenmis-liste")
                      }
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12.5px] font-medium text-foreground transition-colors hover:bg-white/6"
                    >
                      <span className="flex items-center gap-2">
                        <Filter className="size-3.5 text-accent" />
                        Mevcut Filtreli Liste (.xlsx)
                      </span>
                      <span className="tnum rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-semibold text-accent">
                        {filtered.length}
                      </span>
                    </button>
                  )}
                </div>

                {/* Alternatif Düz Metin CSV Seçeneği */}
                <div className="mt-2 border-t border-border pt-1.5">
                  <div className="px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Alternatif Format
                  </div>
                  <button
                    type="button"
                    onClick={() => exportCleanCsv(filtered, "csv-liste")}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] text-muted-foreground transition-colors hover:bg-white/6 hover:text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="size-3.5" />
                      Düz Metin (.csv) İndir
                    </span>
                    <span className="tnum text-[11px]">{filtered.length}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Toplu Silme Butonu */}
          {filtered.length > 0 && (
            <button
              type="button"
              onClick={deleteAllSubmissions}
              title="Gösterilen başvuruları kalıcı olarak sil"
              className="inline-flex h-9.5 items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 text-[12.5px] font-semibold text-rose-400 transition-colors hover:bg-rose-500/20"
            >
              <Trash2 className="size-3.5" />
              <span className="hidden sm:inline">
                {filtered.length === rows.length
                  ? "Tümünü Sil"
                  : `Filtrelenenleri Sil (${filtered.length})`}
              </span>
              <span className="sm:hidden">Sil</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. ANA TABLO (GENİŞLETİLMİŞ VE SÜRÜKLENEBİLİR SÜTUNLAR) */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="flex h-56 flex-col items-center justify-center gap-3">
            <div className="size-6 animate-spin rounded-full border-2 border-border border-t-accent" />
            <span className="text-[13px] text-muted-foreground">
              Başvurular yükleniyor…
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[14px] text-muted-foreground">
              {rows.length === 0
                ? emptyLabel
                : "Arama veya filtre kriterlerinize uyan başvuru bulunamadı."}
            </p>
            {rows.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("hepsi");
                  setCommitteeFilter("hepsi");
                }}
                className="mt-3 text-[13px] text-accent hover:underline"
              >
                Filtreleri temizle
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left" style={{ minWidth: "1250px" }}>
              <thead>
                <tr className="border-b border-border bg-white/[0.02]">
                  {/* Sıra No */}
                  <th
                    style={{ width: colWidths.index }}
                    className="relative px-3 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none"
                  >
                    #
                    <div
                      onMouseDown={(e) => startResizing("index", e)}
                      title="Sütunu genişletmek için sürükleyin"
                      className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-accent/40"
                    />
                  </th>

                  {/* Ad Soyad */}
                  <th
                    style={{ width: colWidths.name }}
                    className="relative px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none"
                  >
                    Ad Soyad
                    <div
                      onMouseDown={(e) => startResizing("name", e)}
                      title="Sütunu genişletmek için sürükleyin"
                      className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-accent/40"
                    />
                  </th>

                  {/* Okul / Şehir */}
                  <th
                    style={{ width: colWidths.school }}
                    className="relative px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none"
                  >
                    Okul / Şehir
                    <div
                      onMouseDown={(e) => startResizing("school", e)}
                      title="Sütunu genişletmek için sürükleyin"
                      className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-accent/40"
                    />
                  </th>

                  {/* 1. Tercih Komite */}
                  {isDelegate && (
                    <th
                      style={{ width: colWidths.committee }}
                      className="relative px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none"
                    >
                      1. Tercih Komite
                      <div
                        onMouseDown={(e) => startResizing("committee", e)}
                        title="Sütunu genişletmek için sürükleyin"
                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-accent/40"
                      />
                    </th>
                  )}

                  {/* Telefon */}
                  <th
                    style={{ width: colWidths.phone }}
                    className="relative px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none"
                  >
                    Telefon
                    <div
                      onMouseDown={(e) => startResizing("phone", e)}
                      title="Sütunu genişletmek için sürükleyin"
                      className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-accent/40"
                    />
                  </th>

                  {/* Durum */}
                  <th
                    style={{ width: colWidths.status }}
                    className="relative px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none"
                  >
                    Durum
                    <div
                      onMouseDown={(e) => startResizing("status", e)}
                      title="Sütunu genişletmek için sürükleyin"
                      className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-accent/40"
                    />
                  </th>

                  {/* İşlem */}
                  <th
                    style={{ width: colWidths.actions }}
                    className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none"
                  >
                    İşlem
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60">
                {filtered.map((row, index) => {
                  const isRowAdmin =
                    String(row.applicantType).toLowerCase() === "admin";
                  const choices = Array.isArray(row.choices)
                    ? (row.choices as string[])
                    : [];
                  const c1 = isRowAdmin
                    ? "—"
                    : choices[0] && choices[0] !== "Admin"
                      ? committeeName(choices[0])
                      : "—";
                  const schoolName =
                    row.school === "Diğer" && row.schoolOther
                      ? `${row.schoolOther} (Diğer)`
                      : String(row.school || row.schoolOther || "—");

                  return (
                    <tr
                      key={row.id as string}
                      onClick={() => setSelectedRow(row)}
                      className="group cursor-pointer transition-colors hover:bg-white/[0.04]"
                    >
                      {/* Sıra No */}
                      <td
                        style={{ width: colWidths.index }}
                        className="tnum px-3 py-3.5 text-center text-[12px] text-muted-foreground"
                      >
                        {index + 1}
                      </td>

                      {/* Ad Soyad */}
                      <td style={{ width: colWidths.name }} className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {isDelegate && (
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-bold border shrink-0",
                                String(row.applicantType).toLowerCase() === "chair"
                                  ? "border-amber-500/30 bg-amber-500/15 text-amber-400"
                                  : String(row.applicantType).toLowerCase() === "admin"
                                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                                    : "border-blue-500/30 bg-blue-500/15 text-blue-400",
                              )}
                            >
                              {String(row.applicantType ?? "delege").toUpperCase()}
                            </span>
                          )}
                          <span className="font-semibold text-foreground text-[13.5px] truncate">
                            {String(row.name ?? row.person ?? "—")}
                          </span>
                        </div>
                        <div className="text-[11.5px] text-muted-foreground">
                          {row.createdAt
                            ? dateOnlyFormat.format(row.createdAt)
                            : "—"}
                        </div>
                      </td>

                      {/* Okul / Şehir */}
                      <td style={{ width: colWidths.school }} className="px-4 py-3.5">
                        <div className="truncate text-[13px] text-foreground font-medium" title={schoolName}>
                          {schoolName}
                        </div>
                        <div className="text-[11.5px] text-muted-foreground">
                          {String(row.city ?? row.org ?? "")}
                          {row.grade ? ` • ${row.grade}` : ""}
                        </div>
                      </td>

                      {/* 1. Tercih Komite */}
                      {isDelegate && (
                        <td style={{ width: colWidths.committee }} className="px-4 py-3.5">
                          {isRowAdmin || c1 === "—" ? (
                            <span className="text-[12px] text-muted-foreground/60">—</span>
                          ) : (
                            <span className="inline-flex max-w-full truncate items-center rounded-md border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[12px] font-medium text-accent">
                              {c1}
                            </span>
                          )}
                        </td>
                      )}

                      {/* Telefon */}
                      <td
                        style={{ width: colWidths.phone }}
                        className="tnum whitespace-nowrap px-4 py-3.5 text-[12.5px] text-muted-foreground"
                      >
                        {String(row.phone ?? "—")}
                      </td>

                      {/* Durum Değiştirici */}
                      <td style={{ width: colWidths.status }} className="px-4 py-3.5">
                        <div
                          className="inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {(["yeni", "kabul", "red"] as const).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setStatus(row.id as string, status)}
                              className={cn(
                                "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                                row.status === status
                                  ? STATUS_BADGE[status]
                                  : "text-muted-foreground/40 hover:text-foreground hover:bg-white/5",
                              )}
                            >
                              {STATUS_SHORT[status]}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* İşlem Butonları */}
                      <td style={{ width: colWidths.actions }} className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRow(row);
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-white/5 px-2.5 py-1 text-[11.5px] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                          >
                            İncele
                            <ChevronRight className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSubmission(
                                row.id as string,
                                String(row.name ?? row.person ?? "")
                              );
                            }}
                            title="Başvuruyu kalıcı olarak sil"
                            className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-white/5 text-muted-foreground transition-colors hover:border-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. DETAY YAN PANELİ / MODAL */}
      {selectedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card p-6 shadow-2xl overflow-y-auto sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Üst Başlık */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-md border px-2.5 py-0.5 text-[11.5px] font-semibold",
                      STATUS_BADGE[selectedRow.status],
                    )}
                  >
                    {STATUS_LABELS[selectedRow.status]}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {selectedRow.createdAt
                      ? dateFormat.format(selectedRow.createdAt)
                      : ""}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {String(selectedRow.name ?? selectedRow.person ?? "Başvuru Detayı")}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Hızlı Karar Butonları */}
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white/[0.02] p-3">
              <span className="text-[12px] font-medium text-muted-foreground">
                Karar Ver:
              </span>
              <button
                type="button"
                onClick={() => setStatus(selectedRow.id, "kabul")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  selectedRow.status === "kabul"
                    ? "bg-emerald-600 text-white"
                    : "border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10",
                )}
              >
                <CheckCircle2 className="size-3.5" />
                Kabul Et
              </button>

              <button
                type="button"
                onClick={() => setStatus(selectedRow.id, "red")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  selectedRow.status === "red"
                    ? "bg-rose-600 text-white"
                    : "border border-rose-500/30 text-rose-400 hover:bg-rose-500/10",
                )}
              >
                <XCircle className="size-3.5" />
                Reddet
              </button>

              <button
                type="button"
                onClick={() => setStatus(selectedRow.id, "yeni")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                  selectedRow.status === "yeni"
                    ? "bg-amber-500/20 text-amber-300"
                    : "border border-border text-muted-foreground hover:bg-white/5",
                )}
              >
                <Clock className="size-3.5" />
                Beklemeye Al
              </button>

              <button
                type="button"
                onClick={() =>
                  deleteSubmission(
                    selectedRow.id,
                    String(selectedRow.name ?? selectedRow.person ?? "")
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/30 px-3 py-1.5 text-[12px] font-semibold text-rose-400 hover:bg-rose-500/10 sm:ml-auto"
              >
                <Trash2 className="size-3.5" />
                Başvuruyu Sil
              </button>
            </div>

            {/* Detay Bilgileri Izgarası */}
            <div className="mt-6 space-y-5 text-[13.5px]">
              {/* İletişim Butonları */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Telefon & WhatsApp */}
                <div className="rounded-xl border border-border bg-white/[0.02] p-3.5">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Telefon & İletişim
                  </div>
                  <div className="mt-1 font-semibold text-foreground">
                    {String(selectedRow.phone || "—")}
                  </div>
                  {Boolean(selectedRow.phone) && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <a
                        href={`tel:${String(selectedRow.phone).replace(/\D/g, "")}`}
                        className="inline-flex items-center gap-1 rounded border border-border bg-white/5 px-2.5 py-1 text-[11.5px] text-foreground hover:border-accent"
                      >
                        <Phone className="size-3" />
                        Ara
                      </a>
                      <a
                        href={`https://wa.me/${String(selectedRow.phone).replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11.5px] text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <MessageSquare className="size-3" />
                        WhatsApp
                      </a>
                    </div>
                  )}
                </div>

                {/* E-posta */}
                <div className="rounded-xl border border-border bg-white/[0.02] p-3.5">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    E-posta Adresi
                  </div>
                  <div className="mt-1 truncate font-semibold text-foreground">
                    {String(selectedRow.email || "—")}
                  </div>
                  {Boolean(selectedRow.email) && (
                    <div className="mt-2.5">
                      <a
                        href={`mailto:${selectedRow.email}`}
                        className="inline-flex items-center gap-1 rounded border border-border bg-white/5 px-2.5 py-1 text-[11.5px] text-foreground hover:border-accent"
                      >
                        <Mail className="size-3" />
                        E-posta Gönder
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Okul ve Eğitim Bilgisi */}
              <div className="rounded-xl border border-border bg-white/[0.02] p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Okul
                    </span>
                    <p className="mt-1 font-medium text-foreground">
                      {selectedRow.school === "Diğer" && selectedRow.schoolOther
                        ? `${selectedRow.schoolOther} (Diğer)`
                        : String(selectedRow.school || selectedRow.schoolOther || "—")}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Sınıf
                    </span>
                    <p className="mt-1 font-medium text-foreground">
                      {String(selectedRow.grade || "—")}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Şehir
                    </span>
                    <p className="mt-1 font-medium text-foreground">
                      {String(selectedRow.city || "—")}
                    </p>
                  </div>
                </div>

                {Boolean(selectedRow.address) && (
                  <div className="mt-3.5 border-t border-border pt-3">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Açık Ev Adresi
                    </span>
                    <p className="mt-1 leading-relaxed text-foreground">
                      {String(selectedRow.address)}
                    </p>
                  </div>
                )}
              </div>

              {/* Komite Tercihleri ve Deneyim */}
              {isDelegate && (
                <div className="rounded-xl border border-border bg-white/[0.02] p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {String(selectedRow.applicantType).toLowerCase() === "admin"
                      ? "Görev Alanı & Deneyim"
                      : String(selectedRow.applicantType).toLowerCase() === "chair"
                        ? "Yönetmek İstediği Komiteler & Deneyim"
                        : "Komite Tercihleri & Deneyim"}
                  </div>

                  {String(selectedRow.applicantType).toLowerCase() === "admin" ? (
                    <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-[13px] font-medium text-emerald-300">
                      İdari Ekip (Admin) — Çalıştay oturum düzeni ve salon akışında görev alır (Komite seçimi bulunmamaktadır).
                    </div>
                  ) : (
                    Array.isArray(selectedRow.choices) && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {(selectedRow.choices as string[])
                          .filter((cId) => cId && cId !== "Admin")
                          .map((cId, idx) => (
                            <div
                              key={cId}
                              className="rounded-lg border border-border bg-card p-2.5"
                            >
                              <span className="text-[11px] text-muted-foreground">
                                {idx + 1}. Tercih
                              </span>
                              <div className="font-semibold text-accent">
                                {committeeName(cId)}
                              </div>
                            </div>
                          ))}
                      </div>
                    )
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-muted-foreground">
                    <div>
                      Geçmiş Çalıştay / MUN Sayısı:{" "}
                      <strong className="text-foreground">
                        {String(selectedRow.experience ?? "0")} adet
                      </strong>
                    </div>
                  </div>

                  {Boolean(
                    selectedRow.pastConferencesAndAwards || selectedRow.awards,
                  ) && (
                    <div className="mt-3 rounded-lg border border-accent/25 bg-accent/5 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                        Daha Önce Katıldığı Çalıştay / MUN İsimleri ve Aldığı Ödüller:
                      </div>
                      <p className="mt-1.5 whitespace-pre-wrap text-[13px] font-medium leading-relaxed text-foreground">
                        {String(
                          selectedRow.pastConferencesAndAwards ||
                            selectedRow.awards,
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Motivasyon Metni */}
              {Boolean(selectedRow.motivation) && (
                <div className="rounded-xl border border-border bg-white/[0.02] p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Motivasyon Metni
                  </div>
                  <div className="mt-2 whitespace-pre-wrap rounded-lg bg-card p-3.5 text-[13px] leading-relaxed text-foreground">
                    {String(selectedRow.motivation)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
