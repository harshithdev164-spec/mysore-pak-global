"use client";

import { useState, useRef } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WeightVariant {
  label: string;
  weight_grams: number; // matches DB column name
  price: number;
  stock_quantity: number;
}

interface ParsedProduct {
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  storage: string;
  category_slug: string;
  category_name: string;
  base_price: number;
  is_active: boolean;
  weights: WeightVariant[];
  selected: boolean;
}

// ─── Category → weight column config ─────────────────────────────────────────
const CATEGORY_MAP: Record<string, string> = {
  "mysore pak": "mysore-pak",
  "ghee sweets": "ghee-sweets",
  chocolates: "chocolates",
  namkeens: "namkeens",
};

const WEIGHT_CONFIGS: Record<string, { label: string; grams: number; col: number }[]> = {
  "mysore-pak": [
    { label: "1 KG", grams: 1000, col: 6 },
    { label: "500g", grams: 500, col: 7 },
    { label: "250g", grams: 250, col: 8 },
    { label: "100g", grams: 100, col: 9 },
    { label: "50g", grams: 50, col: 10 },
  ],
  "ghee-sweets": [
    { label: "1 KG", grams: 1000, col: 6 },
    { label: "500g", grams: 500, col: 7 },
    { label: "250g", grams: 250, col: 8 },
    { label: "100g", grams: 100, col: 9 },
  ],
  chocolates: [
    { label: "1 KG", grams: 1000, col: 6 },
    { label: "500g", grams: 500, col: 7 },
    { label: "250g", grams: 250, col: 8 },
    { label: "100g", grams: 100, col: 9 },
  ],
  namkeens: [
    { label: "100g", grams: 100, col: 6 },
    { label: "200g", grams: 200, col: 7 },
  ],
};

// ─── CSV Parsing ──────────────────────────────────────────────────────────────
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      currentRow.push(cell.trim());
      cell = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      currentRow.push(cell.trim());
      cell = "";
      if (currentRow.some((c) => c !== "")) rows.push(currentRow);
      currentRow = [];
      if (ch === "\r" && text[i + 1] === "\n") i++;
    } else {
      cell += ch;
    }
  }
  currentRow.push(cell.trim());
  if (currentRow.some((c) => c !== "")) rows.push(currentRow);
  return rows;
}

function parsePrice(s: string): number | null {
  const cleaned = s.replace(/[, ]/g, "").trim();
  if (!cleaned || cleaned === "-" || cleaned === "_") return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseShopifyCSV(text: string): ParsedProduct[] {
  const rows = parseCSV(text);
  const products: ParsedProduct[] = [];
  const usedSlugs = new Set<string>();

  let currentCategorySlug = "mysore-pak";
  let currentCategoryName = "Mysore Pak";

  for (const row of rows) {
    // Detect section header: col[5] matches a known category display name
    const col5 = (row[5] ?? "").trim().toLowerCase();
    const matchedSlug = CATEGORY_MAP[col5];
    if (matchedSlug) {
      currentCategorySlug = matchedSlug;
      currentCategoryName = (row[5] ?? "").trim();
      continue;
    }

    // Product row: col[1] is TRUE/FALSE and col[3] is a number
    const isActiveRaw = (row[1] ?? "").trim().toUpperCase();
    const slNo = (row[3] ?? "").trim();
    const displayName = (row[5] ?? "").trim();

    if ((isActiveRaw === "TRUE" || isActiveRaw === "FALSE") && /^\d+$/.test(slNo) && displayName) {
      const description = (row[14] ?? "").trim();
      const ingredients = (row[15] ?? "").trim();
      const shelfLife = (row[16] ?? "").trim();
      const storageCondition = (row[17] ?? "").trim();
      const allergenInfo = (row[18] ?? "").trim();

      const storage = [shelfLife && `Shelf life: ${shelfLife}`, storageCondition, allergenInfo && `Allergen: ${allergenInfo}`]
        .filter(Boolean)
        .join(" | ");

      // Build weight variants
      const weightConfig = WEIGHT_CONFIGS[currentCategorySlug] ?? [];
      const weights: WeightVariant[] = [];
      for (const wc of weightConfig) {
        const price = parsePrice(row[wc.col] ?? "");
        if (price !== null && price > 0) {
          weights.push({ label: wc.label, weight_grams: wc.grams, price, stock_quantity: 100 });
        }
      }

      // base_price = smallest weight price
      const base_price = weights.length > 0 ? Math.min(...weights.map((w) => w.price)) : 0;
      if (base_price === 0) continue; // skip rows with no price

      // Unique slug
      let slug = toSlug(displayName);
      if (usedSlugs.has(slug)) {
        slug = `${slug}-${currentCategorySlug}`;
      }
      usedSlugs.add(slug);

      products.push({
        name: displayName,
        slug,
        description,
        ingredients,
        storage,
        category_slug: currentCategorySlug,
        category_name: currentCategoryName,
        base_price,
        is_active: isActiveRaw === "TRUE",
        weights,
        selected: true,
      });
    }
  }

  return products;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BulkUploadPage() {
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [status, setStatus] = useState<"idle" | "parsed" | "uploading" | "done">("idle");
  const [result, setResult] = useState<{ inserted: number; updated: number; errors: string[] } | null>(null);
  const [parseError, setParseError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = parseShopifyCSV(text);
        if (parsed.length === 0) {
          setParseError("No valid products found. Make sure the CSV matches the Shopify export format.");
          return;
        }
        setProducts(parsed);
        setStatus("parsed");
        setResult(null);
      } catch (err) {
        setParseError(String(err));
      }
    };
    reader.readAsText(file);
  }

  function toggleAll(checked: boolean) {
    setProducts((prev) => prev.map((p) => ({ ...p, selected: checked })));
  }

  function toggleOne(idx: number) {
    setProducts((prev) => prev.map((p, i) => (i === idx ? { ...p, selected: !p.selected } : p)));
  }

  async function handleUpload() {
    const selected = products.filter((p) => p.selected);
    if (selected.length === 0) return;

    setStatus("uploading");
    setResult(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const payload = selected.map(({ selected: _, category_name: __, ...p }) => p);

    try {
      const res = await fetch("/api/admin/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: payload }),
      });
      const data = await res.json();
      setResult(data);
      setStatus("done");
    } catch (err) {
      setResult({ inserted: 0, updated: 0, errors: [String(err)] });
      setStatus("done");
    }
  }

  const selectedCount = products.filter((p) => p.selected).length;

  const byCategory = products.reduce<Record<string, ParsedProduct[]>>((acc, p, i) => {
    const key = p.category_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push({ ...p, _idx: i } as ParsedProduct & { _idx: number });
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700">
          ← Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Upload Products</h1>
      </div>

      {/* File Upload */}
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6">
        <div className="text-gray-500 mb-3 text-sm">
          Upload your Shopify products CSV (the <em>final_list_of_shopify website_products</em> format)
        </div>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
        <button
          onClick={() => fileRef.current?.click()}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
        >
          Choose CSV File
        </button>
        {parseError && <p className="mt-3 text-red-600 text-sm">{parseError}</p>}
      </div>

      {/* Parsed preview */}
      {status !== "idle" && products.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">
              Found <strong>{products.length}</strong> products across{" "}
              <strong>{Object.keys(byCategory).length}</strong> categories.{" "}
              <strong>{selectedCount}</strong> selected.
            </div>
            <div className="flex gap-3">
              <button onClick={() => toggleAll(true)} className="text-xs text-amber-700 underline">
                Select all
              </button>
              <button onClick={() => toggleAll(false)} className="text-xs text-gray-500 underline">
                Deselect all
              </button>
            </div>
          </div>

          {Object.entries(byCategory).map(([catName, catProducts]) => (
            <div key={catName} className="mb-6">
              <h2 className="text-base font-semibold text-gray-700 mb-2 border-b pb-1">{catName}</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-3 py-2 w-8">
                        <input
                          type="checkbox"
                          checked={catProducts.every((p) => p.selected)}
                          onChange={(e) => {
                            const idxs = new Set((catProducts as (ParsedProduct & { _idx: number })[]).map((p) => p._idx));
                            setProducts((prev) => prev.map((p, i) => (idxs.has(i) ? { ...p, selected: e.target.checked } : p)));
                          }}
                        />
                      </th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Slug</th>
                      <th className="px-3 py-2 text-left">Active</th>
                      <th className="px-3 py-2 text-left">Weights & Prices</th>
                      <th className="px-3 py-2 text-left max-w-xs">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(catProducts as (ParsedProduct & { _idx: number })[]).map((product) => (
                      <tr
                        key={product._idx}
                        className={product.selected ? "bg-white" : "bg-gray-50 opacity-50"}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={product.selected}
                            onChange={() => toggleOne(product._idx)}
                          />
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{product.name}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs font-mono">{product.slug}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              product.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {product.weights.map((w) => `${w.label} ₹${w.price}`).join(" · ")}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 max-w-xs truncate">
                          {product.description.slice(0, 80)}…
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Upload button */}
          {status !== "done" && (
            <div className="mt-4 flex gap-4 items-center">
              <button
                onClick={handleUpload}
                disabled={selectedCount === 0 || status === "uploading"}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-medium"
              >
                {status === "uploading" ? "Uploading…" : `Upload ${selectedCount} Products`}
              </button>
              {status === "uploading" && (
                <span className="text-sm text-gray-500">Inserting into database, please wait…</span>
              )}
            </div>
          )}
        </>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 p-5 rounded-xl border">
          <h3 className="font-semibold text-gray-800 mb-2">Upload Complete</h3>
          <div className="flex gap-6 text-sm mb-3">
            <span className="text-green-700">
              ✓ {result.inserted} inserted
            </span>
            <span className="text-blue-700">
              ↻ {result.updated} updated
            </span>
            {result.errors.length > 0 && (
              <span className="text-red-600">✗ {result.errors.length} errors</span>
            )}
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 space-y-1">
              {result.errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}
          <Link
            href="/admin/products"
            className="mt-4 inline-block bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm"
          >
            View Products
          </Link>
        </div>
      )}
    </div>
  );
}
