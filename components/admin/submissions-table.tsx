"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { firebaseEnabled, getDb } from "@/lib/firebase";
import { toDate, type ApplicationStatus } from "@/lib/submissions";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  label: string;
  /** Tabloda gösterilecek değer. */
  value: (row: T) => string;
  /** Dar ekranlarda gizlenecek sütunlar. */
  hideOnMobile?: boolean;
  /** Satır genişlediğinde gösterilecek uzun metinler. */
  detailOnly?: boolean;
};

type Row = { id: string; status: ApplicationStatus; createdAt: Date | null } & Record<
  string,
  unknown
>;

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  yeni: "Yeni",
  kabul: "Kabul",
  red: "Red",
};

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  yeni: "border-border bg-white/6 text-muted-foreground",
  kabul: "border-accent/40 bg-accent/12 text-accent",
  red: "border-destructive/40 bg-destructive/10 text-destructive",
};

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "short",
  timeStyle: "short",
});

/**
 * Firestore koleksiyonunu canlı dinleyen, filtrelenebilir ve CSV olarak
 * dışa aktarılabilen başvuru tablosu. Hem delege hem sponsorluk
 * başvuruları için kullanılır; fark yalnızca `columns` tanımında.
 */
export function SubmissionsTable<T extends Row>({
  path,
  columns,
  searchKeys,
  emptyLabel,
  csvName,
}: {
  path: string;
  columns: Column<T>[];
  /** Arama kutusunun tarayacağı alanlar. */
  searchKeys: (keyof T & string)[];
  emptyLabel: string;
  csvName: string;
}) {
  const [rows, setRows] = useState<T[]>([]);
  // Firebase yapılandırılmamışsa okunacak bir koleksiyon yok.
  const [loading, setLoading] = useState(firebaseEnabled);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "hepsi">(
    "hepsi",
  );
  const [expanded, setExpanded] = useState<string | null>(null);

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
      () => setLoading(false),
    );
  }, [path]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("tr");
    return rows.filter((row) => {
      if (statusFilter !== "hepsi" && row.status !== statusFilter) return false;
      if (!term) return true;
      return searchKeys.some((key) =>
        String(row[key] ?? "")
          .toLocaleLowerCase("tr")
          .includes(term),
      );
    });
  }, [rows, search, statusFilter, searchKeys]);

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
    } catch {
      toast.error("Durum güncellenemedi.");
    }
  }

  function exportCsv() {
    const headers = ["Tarih", ...columns.map((c) => c.label), "Durum"];
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const lines = [
      headers.map(escape).join(","),
      ...filtered.map((row) =>
        [
          row.createdAt ? dateFormat.format(row.createdAt) : "",
          ...columns.map((c) => c.value(row)),
          STATUS_LABELS[row.status],
        ]
          .map(escape)
          .join(","),
      ),
    ];

    // BOM, Excel'in Türkçe karakterleri doğru okuması için gerekli.
    const blob = new Blob(["﻿" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${csvName}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const visible = columns.filter((c) => !c.detailOnly);
  const detailColumns = columns.filter((c) => c.detailOnly);

  return (
    <div>
      {/* Araç çubuğu */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(["hepsi", "yeni", "kabul", "red"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-[12.5px] transition-colors",
                statusFilter === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white/4 text-muted-foreground hover:text-foreground",
              )}
            >
              {key === "hepsi" ? "Hepsi" : STATUS_LABELS[key]}
              <span className="ml-1.5 opacity-60">{counts[key]}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ara"
              className="h-9 w-full rounded-md border border-input bg-white/5 pl-9 pr-3 text-[13px] text-foreground outline-none transition-colors focus:border-ring sm:w-52"
            />
          </div>

          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border px-3 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <Download className="size-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* Tablo */}
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        {loading ? (
          <div className="h-40 animate-pulse bg-card" />
        ) : filtered.length === 0 ? (
          <p className="bg-card p-10 text-center text-[13.5px] text-muted-foreground">
            {rows.length === 0 ? emptyLabel : "Filtreyle eşleşen kayıt yok."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-white/4">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tarih
                  </th>
                  {visible.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                        column.hideOnMobile && "hidden lg:table-cell",
                      )}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Durum
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((row) => {
                  const isOpen = expanded === row.id;
                  return (
                    <Fragment key={row.id as string}>
                      <tr
                        onClick={() =>
                          setExpanded(isOpen ? null : (row.id as string))
                        }
                        className="cursor-pointer border-b border-border bg-card transition-colors hover:bg-white/6"
                      >
                        <td className="tnum whitespace-nowrap px-4 py-3 text-[12.5px] text-muted-foreground">
                          {row.createdAt ? dateFormat.format(row.createdAt) : "—"}
                        </td>

                        {visible.map((column) => (
                          <td
                            key={column.key}
                            className={cn(
                              "px-4 py-3 text-[13px] text-foreground",
                              column.hideOnMobile && "hidden lg:table-cell",
                            )}
                          >
                            {column.value(row) || "—"}
                          </td>
                        ))}

                        <td className="px-4 py-3">
                          <div
                            className="flex gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(["yeni", "kabul", "red"] as const).map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setStatus(row.id as string, status)}
                                className={cn(
                                  "rounded border px-2 py-1 text-[11px] transition-colors",
                                  row.status === status
                                    ? STATUS_STYLES[status]
                                    : "border-transparent text-muted-foreground/50 hover:text-foreground",
                                )}
                              >
                                {STATUS_LABELS[status]}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>

                      {isOpen && detailColumns.length > 0 && (
                        <tr className="border-b border-border bg-white/4">
                          <td colSpan={visible.length + 2} className="px-4 py-4">
                            <dl className="grid gap-3 sm:grid-cols-2">
                              {columns.map((column) => (
                                <div key={column.key}>
                                  <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                    {column.label}
                                  </dt>
                                  <dd className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
                                    {column.value(row) || "—"}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
