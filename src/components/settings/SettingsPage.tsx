"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, FileJson, FileText, Upload, X } from "lucide-react";
import styles from "./settings.module.css";
import Navbar from "@/components/layout/Navbar";
import { useToast } from "@/contexts/ToastContext";

interface ImportAnalysis {
  total: number;
  invalid: number;
  newCount: number;
  duplicateCount: number;
  byCategory: { category: string; count: number }[];
  duplicates: { url: string; category: string }[];
}

interface ImportPreview {
  fileName: string;
  raw: unknown;
  analysis: ImportAnalysis;
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export default function SettingsPage() {
  const [exporting, setExporting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleExport = async (format: "json" | "txt") => {
    setExporting(true);
    try {
      const res = await fetch("/api/tasks/export");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Export failed");

      const date = new Date().toISOString().slice(0, 10);
      if (format === "json") {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        downloadBlob(blob, `log-horizon-backup-${date}.json`);
        toast.success(
          "Export Complete",
          `Downloaded ${data.tasks.length} links as a JSON backup.`
        );
      } else {
        const blob = new Blob([data.tasks.map((t: { url: string }) => t.url).join("\n")], {
          type: "text/plain",
        });
        downloadBlob(blob, `log-horizon-links-${date}.txt`);
        toast.success(
          "Export Complete",
          `Downloaded ${data.tasks.length} links as plain text.`
        );
      }
    } catch (err) {
      toast.error("Export Failed", err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setExporting(false);
    }
  };

  const parseFile = async (file: File): Promise<unknown> => {
    const text = await file.text();
    if (file.name.toLowerCase().endsWith(".json")) {
      return JSON.parse(text);
    }
    return text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setParsing(true);
    try {
      const raw = await parseFile(file);
      const res = await fetch("/api/tasks/import?dryRun=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(raw),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze file");
      setPreview({ fileName: file.name, raw, analysis: data.analysis });
    } catch (err) {
      toast.error("Import Failed", err instanceof Error ? err.message : "Could not read that file.");
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview) return;
    setImporting(true);
    try {
      const res = await fetch("/api/tasks/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preview.raw),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setPreview(null);
      if (data.imported > 0) {
        const dupText =
          data.duplicates > 0
            ? `, skipped ${data.duplicates} duplicate${data.duplicates === 1 ? "" : "s"}`
            : "";
        toast.success(
          "Import Complete",
          `Added ${data.imported} new link${data.imported === 1 ? "" : "s"}${dupText}.`
        );
      } else {
        toast.info("Nothing to Import", "All links in the file already exist on your board.");
      }
    } catch (err) {
      toast.error("Import Failed", err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar isLoggedIn={true} />
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>
            Backup your board, restore it, or move it to another account.
          </p>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <FileJson size={22} />
              <h2 className={styles.cardTitle}>Export Data</h2>
            </div>
            <p className={styles.cardText}>
              Download all of your links and their metadata (titles, previews, categories, order)
              as a JSON backup — or as a simple list of URLs.
            </p>
            <div className={styles.buttonRow}>
              <button
                className={styles.primaryBtn}
                onClick={() => handleExport("json")}
                disabled={exporting}
              >
                <Download size={16} />
                {exporting ? "Preparing..." : "Export as JSON"}
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() => handleExport("txt")}
                disabled={exporting}
              >
                <FileText size={16} />
                Export as .txt
              </button>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <Upload size={22} />
              <h2 className={styles.cardTitle}>Import Data</h2>
            </div>
            <p className={styles.cardText}>
              Restore a previous JSON backup or import a list of URLs (one per line in a .txt
              file). Duplicates are detected and skipped automatically.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.txt"
              onChange={handleFileChange}
              className={styles.fileInput}
            />

            {!preview ? (
              <button
                className={styles.dropzone}
                onClick={() => fileInputRef.current?.click()}
                disabled={parsing}
              >
                {parsing ? (
                  <span className={styles.dropzoneText}>Analyzing file...</span>
                ) : (
                  <>
                    <Upload size={24} />
                    <span className={styles.dropzoneTitle}>Choose a file to import</span>
                    <span className={styles.dropzoneText}>.json backup or .txt list of URLs</span>
                  </>
                )}
              </button>
            ) : (
              <div className={styles.preview}>
                <div className={styles.previewHeader}>
                  <span className={styles.previewFile}>{preview.fileName}</span>
                  <button
                    className={styles.previewClose}
                    onClick={() => setPreview(null)}
                    aria-label="Discard import"
                    disabled={importing}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{preview.analysis.total}</span>
                    <span className={styles.statLabel}>Found</span>
                  </div>
                  <div className={`${styles.stat} ${styles.statNew}`}>
                    <span className={styles.statValue}>{preview.analysis.newCount}</span>
                    <span className={styles.statLabel}>New</span>
                  </div>
                  <div className={`${styles.stat} ${styles.statDup}`}>
                    <span className={styles.statValue}>{preview.analysis.duplicateCount}</span>
                    <span className={styles.statLabel}>Duplicates</span>
                  </div>
                  {preview.analysis.invalid > 0 && (
                    <div className={`${styles.stat} ${styles.statInvalid}`}>
                      <span className={styles.statValue}>{preview.analysis.invalid}</span>
                      <span className={styles.statLabel}>Skipped</span>
                    </div>
                  )}
                </div>

                {preview.analysis.newCount > 0 && (
                  <div className={styles.categoryBreakdown}>
                    {preview.analysis.byCategory.map((c) => (
                      <span key={c.category} className={styles.categoryChip}>
                        {c.category} <b>{c.count}</b>
                      </span>
                    ))}
                  </div>
                )}

                {preview.analysis.duplicates.length > 0 && (
                  <details className={styles.duplicates}>
                    <summary>
                      {preview.analysis.duplicateCount} duplicate
                      {preview.analysis.duplicateCount === 1 ? "" : "s"} will be skipped
                    </summary>
                    <ul>
                      {preview.analysis.duplicates.map((d, i) => (
                        <li key={i}>
                          <span className={styles.dupUrl}>{d.url}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                <div className={styles.buttonRow}>
                  <button
                    className={styles.primaryBtn}
                    onClick={handleConfirmImport}
                    disabled={importing || preview.analysis.newCount === 0}
                  >
                    <ArrowRight size={16} />
                    {importing
                      ? "Importing..."
                      : `Import ${preview.analysis.newCount} link${
                          preview.analysis.newCount === 1 ? "" : "s"
                        }`}
                  </button>
                  <button
                    className={styles.secondaryBtn}
                    onClick={() => setPreview(null)}
                    disabled={importing}
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        <p className={styles.footerNote}>
          Backups include titles, descriptions, preview images, categories and column order.{" "}
          <Link href="/board" className={styles.boardLink}>
            Go to board →
          </Link>
        </p>
      </div>
    </div>
  );
}
