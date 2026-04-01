"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";

type ResultStatus = "success" | "no_match" | "error";

interface UploadResult {
  file: string;
  slug: string;
  product?: string;
  status: ResultStatus;
  message?: string;
  url?: string;
}

interface Summary {
  total: number;
  success: number;
  no_match: number;
  error: number;
}

const STATUS_STYLE: Record<ResultStatus, string> = {
  success:  "bg-green-50  text-green-700  border-green-200",
  no_match: "bg-amber-50  text-amber-700  border-amber-200",
  error:    "bg-red-50    text-red-700    border-red-200",
};

const STATUS_LABEL: Record<ResultStatus, string> = {
  success:  "✓ Updated",
  no_match: "? No match",
  error:    "✕ Error",
};

export default function BulkImagesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...accepted.filter((f) => !existing.has(f.name))];
    });
    setResults(null);
    setSummary(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: true,
  });

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }

  async function handleUpload() {
    if (!files.length) return;
    setUploading(true);
    setResults(null);
    setSummary(null);

    // Split into batches of 3 MB to stay under Vercel's 4.5 MB body limit
    const BATCH_BYTES = 3 * 1024 * 1024;
    const batches: File[][] = [];
    let current: File[] = [];
    let currentSize = 0;
    for (const f of files) {
      if (currentSize + f.size > BATCH_BYTES && current.length > 0) {
        batches.push(current);
        current = [];
        currentSize = 0;
      }
      current.push(f);
      currentSize += f.size;
    }
    if (current.length) batches.push(current);

    try {
      const allResults: UploadResult[] = [];

      for (const batch of batches) {
        const formData = new FormData();
        batch.forEach((f) => formData.append("files", f));

        const res = await fetch("/api/upload/bulk", { method: "POST", body: formData });

        // Read as text first — guards against non-JSON error pages (e.g. 413)
        const text = await res.text();
        let data: { results: UploadResult[]; summary: Summary };
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Server error: ${text.slice(0, 120)}`);
        }

        if (!res.ok) throw new Error((data as { error?: string }).error ?? "Upload failed");
        allResults.push(...data.results);
      }

      const success  = allResults.filter((r) => r.status === "success").length;
      const no_match = allResults.filter((r) => r.status === "no_match").length;
      const error    = allResults.filter((r) => r.status === "error").length;

      setResults(allResults);
      setSummary({ total: allResults.length, success, no_match, error });
      setFiles((prev) =>
        prev.filter((f) =>
          allResults.find((r) => r.file === f.name && r.status !== "success")
        )
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Image Upload</h1>
          <p className="text-sm text-gray-500 mt-1">
            Name your images after the product slug (e.g. <code className="bg-gray-100 px-1 rounded text-xs">namkeen-chaat.jpg</code>) and they&apos;ll be matched and updated automatically.
          </p>
        </div>
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Back to Products
        </Link>
      </div>

      {/* How it works */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        <p className="font-semibold mb-1">How filename matching works</p>
        <ul className="list-disc list-inside space-y-0.5 text-amber-700">
          <li>File <code className="bg-amber-100 px-1 rounded text-xs">Namkeen Chaat.jpg</code> → matches product slug <code className="bg-amber-100 px-1 rounded text-xs">namkeen-chaat</code></li>
          <li>File <code className="bg-amber-100 px-1 rounded text-xs">classic-mysore-pak.webp</code> → matches slug <code className="bg-amber-100 px-1 rounded text-xs">classic-mysore-pak</code></li>
          <li>Spaces become hyphens, case is ignored, special characters are stripped</li>
        </ul>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-amber-400 bg-amber-50" : "border-gray-200 hover:border-amber-300 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">🖼️</div>
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? "Drop images here…" : "Drag & drop product images here"}
        </p>
        <p className="text-xs text-gray-400 mt-1">or click to browse · JPG, PNG, WebP · max 4 MB each</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-5 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{files.length} image{files.length !== 1 ? "s" : ""} queued</span>
            <button onClick={() => setFiles([])} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear all</button>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {files.map((f) => (
              <div key={f.name} className="flex items-center gap-3 px-4 py-2.5">
                <img
                  src={URL.createObjectURL(f)}
                  alt={f.name}
                  className="w-9 h-9 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{f.name}</p>
                  <p className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</p>
                </div>
                <button onClick={() => removeFile(f.name)} className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none">×</button>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {uploading ? "Uploading & matching…" : `Upload ${files.length} image${files.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {summary && results && (
        <div className="mt-6">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Updated", value: summary.success,  color: "text-green-600 bg-green-50 border-green-200" },
              { label: "No match", value: summary.no_match, color: "text-amber-600 bg-amber-50 border-amber-200" },
              { label: "Errors",   value: summary.error,    color: "text-red-600   bg-red-50   border-red-200"   },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Results table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Results — {summary.total} files processed</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  {r.url && (
                    <img src={r.url} alt={r.file} className="w-9 h-9 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                  )}
                  {!r.url && (
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.file}</p>
                    <p className="text-xs text-gray-400">
                      {r.product ? `→ ${r.product}` : `slug: ${r.slug}`}
                      {r.message ? ` · ${r.message}` : ""}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_STYLE[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
