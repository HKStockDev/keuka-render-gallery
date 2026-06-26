"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ScanResult } from "@/lib/types";

interface ScanPreview {
  scanApiEnabled: boolean;
  onVercel: boolean;
  projectsRoot: string;
  indexedCount: number;
  totalOnDisk: number;
  newProjects: { name: string; id: string }[];
  knownProjects: { name: string; id: string }[];
  lastFullScan: string;
  lastIncrementalScan?: string;
}

export default function AdminPanel() {
  const [preview, setPreview] = useState<ScanPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState<"incremental" | "full" | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/scan");
      if (!res.ok) throw new Error("Failed to load scan status");
      setPreview(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  async function runScan(incremental: boolean) {
    setScanning(incremental ? "incremental" : "full");
    setError("");
    setScanResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incremental }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scan failed");
        return;
      }

      setScanResult(data.result);
      await loadPreview();
    } catch {
      setError("Network error during scan.");
    } finally {
      setScanning(null);
    }
  }

  function formatDate(iso?: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold">Scan Tools</h1>
            <p className="text-sm text-keuka-slate mt-0.5">
              Re-scan projects and manage the gallery index
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-keuka-accent hover:underline shrink-0"
          >
            ← Back to gallery
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {loading && (
          <p className="text-keuka-slate text-sm">Loading scan status…</p>
        )}

        {error && (
          <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
            {error}
          </div>
        )}

        {preview && (
          <>
            {/* Status cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <StatCard label="Indexed projects" value={preview.indexedCount} />
              <StatCard label="On disk" value={preview.totalOnDisk} />
              <StatCard
                label="New (not indexed)"
                value={preview.newProjects.length}
                highlight={preview.newProjects.length > 0}
              />
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-2 text-sm">
              <Row label="Projects root" value={preview.projectsRoot} />
              <Row label="Last full scan" value={formatDate(preview.lastFullScan)} />
              <Row
                label="Last incremental scan"
                value={formatDate(preview.lastIncrementalScan)}
              />
              <Row
                label="Scan API"
                value={
                  preview.scanApiEnabled
                    ? "Enabled on this host"
                    : preview.onVercel
                      ? "Disabled on Vercel (use CLI locally)"
                      : "Disabled — set ENABLE_SCAN_API=true"
                }
              />
            </div>

            {/* New projects list */}
            {preview.newProjects.length > 0 ? (
              <div className="rounded-xl border border-keuka-accent/30 bg-keuka-accent/5 p-5">
                <h2 className="font-medium text-keuka-accent mb-3">
                  {preview.newProjects.length} new project
                  {preview.newProjects.length !== 1 ? "s" : ""} ready to scan
                </h2>
                <ul className="space-y-1 text-sm text-keuka-slate">
                  {preview.newProjects.map((p) => (
                    <li key={p.id} className="font-mono">
                      {p.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-keuka-slate">
                All project folders on disk are already indexed.
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => runScan(true)}
                disabled={!!scanning || !preview.scanApiEnabled}
                className="px-5 py-2.5 rounded-lg bg-keuka-accent text-keuka-steel font-medium hover:opacity-90 transition disabled:opacity-40"
              >
                {scanning === "incremental"
                  ? "Scanning new projects…"
                  : "Scan new projects only"}
              </button>
              <button
                type="button"
                onClick={() => runScan(false)}
                disabled={!!scanning || !preview.scanApiEnabled}
                className="px-5 py-2.5 rounded-lg border border-[var(--border)] hover:border-keuka-accent/40 transition disabled:opacity-40"
              >
                {scanning === "full" ? "Running full scan…" : "Full re-scan (all projects)"}
              </button>
              <button
                type="button"
                onClick={loadPreview}
                disabled={!!scanning}
                className="px-5 py-2.5 rounded-lg border border-[var(--border)] hover:border-keuka-accent/40 transition disabled:opacity-40"
              >
                Refresh preview
              </button>
            </div>

            {!preview.scanApiEnabled && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-keuka-slate space-y-2">
                <p className="font-medium text-[var(--foreground)]">Run scan from CLI</p>
                <code className="block px-3 py-2 rounded bg-black/30 text-xs">
                  npm run scan:incremental
                </code>
                <code className="block px-3 py-2 rounded bg-black/30 text-xs">
                  npm run scan:preview
                </code>
                <p>
                  Then commit <code className="text-xs">data/gallery.json</code> and{" "}
                  <code className="text-xs">public/thumbnails/</code>, and redeploy.
                </p>
              </div>
            )}

            {scanResult && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-sm">
                <p className="font-medium text-green-300 mb-2">Scan complete</p>
                <ul className="space-y-1 text-green-200/80">
                  <li>Mode: {scanResult.mode}</li>
                  <li>Scanned: {scanResult.scannedProjects} project(s)</li>
                  <li>Skipped (known): {scanResult.skippedProjects}</li>
                  <li>Total projects: {scanResult.totalProjects}</li>
                  <li>Total images: {scanResult.totalImages}</li>
                </ul>
                <p className="mt-3 text-green-200/70">
                  Restart the dev server or redeploy to see new renders in the gallery.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-keuka-accent/40 bg-keuka-accent/5"
          : "border-[var(--border)] bg-[var(--card)]"
      }`}
    >
      <p className="text-xs text-keuka-slate uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${highlight ? "text-keuka-accent" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <span className="text-keuka-slate sm:w-44 shrink-0">{label}</span>
      <span className="font-mono text-xs break-all">{value}</span>
    </div>
  );
}
