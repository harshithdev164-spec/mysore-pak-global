"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { invalidateCache } from "@/lib/useAdminFetch";

interface Category {
  id: string;
  name: string;
}

interface WeightRow {
  id?: string;
  label: string;
  weight_grams: number;
  price: number;
  stock_quantity: number;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ingredients: string | null;
  storage: string | null;
  category_id: string | null;
  base_price: number;
  original_price: number | null;
  image: string | null;
  badge: string | null;
  is_active: boolean;
  is_bestseller: boolean;
  is_recommended: boolean;
  weights: WeightRow[];
}

const BADGES = ["", "Bestseller", "New", "Premium", "Limited Edition", "Gift Pack"];

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    ingredients: "",
    storage: "",
    category_id: "",
    base_price: "",
    original_price: "",
    image: "",
    badge: "",
    is_active: true,
    is_bestseller: false,
    is_recommended: false,
  });

  const [weights, setWeights] = useState<WeightRow[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}?admin=true`, { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/categories", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([productJson, catJson]) => {
      const p: ProductData = productJson.data;
      if (p) {
        setForm({
          name: p.name,
          slug: p.slug,
          description: p.description ?? "",
          ingredients: p.ingredients ?? "",
          storage: p.storage ?? "",
          category_id: p.category_id ?? "",
          base_price: String(p.base_price),
          original_price: p.original_price != null ? String(p.original_price) : "",
          image: p.image ?? "",
          badge: p.badge ?? "",
          is_active: p.is_active,
          is_bestseller: !!p.is_bestseller,
          is_recommended: !!p.is_recommended,
        });
        setWeights(p.weights ?? []);
      }
      setCategories(catJson.data ?? []);
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploadSuccess(false);
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("File too large — max 4 MB. Please compress the image and try again.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setUploadError(`Unsupported format "${file.type}". Use JPEG, PNG, or WebP.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      let json: { error?: string; url?: string } = {};
      try { json = await res.json(); } catch { /* non-JSON response (e.g. 413) */ }
      if (!res.ok) {
        setUploadError(json.error ?? `Upload failed (HTTP ${res.status})`);
        return;
      }
      setForm((f) => ({ ...f, image: json.url ?? "" }));
      setUploadSuccess(true);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function updateWeight(index: number, field: keyof WeightRow, value: string | number) {
    setWeights((prev) =>
      prev.map((w, i) => (i === index ? { ...w, [field]: value } : w))
    );
  }

  function addWeight() {
    setWeights((prev) => [...prev, { label: "", weight_grams: 0, price: 0, stock_quantity: 100 }]);
  }

  function removeWeight(index: number) {
    setWeights((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.slug) {
      setError("Name and slug are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        ingredients: form.ingredients || null,
        storage: form.storage || null,
        category_id: form.category_id || null,
        base_price: parseFloat(form.base_price) || 0,
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        image: form.image || null,
        badge: form.badge || null,
        is_active: form.is_active,
        is_bestseller: form.is_bestseller,
        is_recommended: form.is_recommended,
        weights: weights.map((w) => ({
          label: w.label,
          weight_grams: Number(w.weight_grams),
          price: Number(w.price),
          stock_quantity: Number(w.stock_quantity),
        })),
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to update product");
        return;
      }
      invalidateCache("/api/products?admin=true&slim=true&limit=500");
      invalidateCache(`/api/products/${id}`);
      setUploadSuccess(false);
      // Re-fetch product so form reflects latest saved state
      const fresh = await fetch(`/api/products/${id}?admin=true`, { cache: "no-store" }).then((r) => r.json());
      if (fresh.data?.weights) setWeights(fresh.data.weights);
      setSuccess("Saved!");
      setTimeout(() => setSuccess(""), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-gray-400 text-sm">Loading product...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">{success}</div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Info</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Ingredients</label>
              <textarea
                value={form.ingredients}
                onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Storage</label>
              <textarea
                value={form.storage}
                onChange={(e) => setForm((f) => ({ ...f, storage: e.target.value }))}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing & Category</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Base Price (₹) *</label>
              <input
                type="number"
                value={form.base_price}
                onChange={(e) => setForm((f) => ({ ...f, base_price: e.target.value }))}
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Original Price (₹)</label>
              <input
                type="number"
                value={form.original_price}
                onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))}
                min="0"
                step="0.01"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Image</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => { setForm((f) => ({ ...f, image: e.target.value })); setUploadSuccess(false); setUploadError(""); }}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="https://... or upload →"
                />
                <button
                  type="button"
                  onClick={() => { setUploadError(""); setUploadSuccess(false); fileInputRef.current?.click(); }}
                  disabled={uploading}
                  className="shrink-0 text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {uploading ? "Uploading…" : "Upload"}
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageUpload} />
              </div>
              {uploadError && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">⚠ {uploadError}</p>
              )}
              {uploadSuccess && (
                <p className="mt-1.5 text-xs text-green-600 font-medium">✓ Image uploaded — click Save to apply</p>
              )}
              {form.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image} alt="preview" className="mt-2 h-20 w-20 object-cover rounded-lg border border-gray-200" />
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Badge</label>
              <select
                value={form.badge}
                onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {BADGES.map((b) => (
                  <option key={b} value={b}>{b || "— None —"}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="w-4 h-4 rounded accent-amber-600"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible in store)</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_bestseller"
                checked={form.is_bestseller}
                onChange={(e) => setForm((f) => ({ ...f, is_bestseller: e.target.checked }))}
                className="w-4 h-4 rounded accent-amber-600"
              />
              <label htmlFor="is_bestseller" className="text-sm text-gray-700">Best seller (shop chip)</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_recommended"
                checked={form.is_recommended}
                onChange={(e) => setForm((f) => ({ ...f, is_recommended: e.target.checked }))}
                className="w-4 h-4 rounded accent-amber-600"
              />
              <label htmlFor="is_recommended" className="text-sm text-gray-700">Our recommendation</label>
            </div>
          </div>
        </div>

        {/* Weight Variants */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Weight Variants</h2>
            <button
              type="button"
              onClick={addWeight}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium border border-amber-300 rounded-lg px-3 py-1.5 transition-colors hover:bg-amber-50"
            >
              + Add Variant
            </button>
          </div>

          <div className="space-y-3">
            {weights.map((w, i) => (
              <div key={i} className="grid grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Label</label>
                  <input
                    type="text"
                    value={w.label}
                    onChange={(e) => updateWeight(i, "label", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="250g"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Grams</label>
                  <input
                    type="number"
                    value={w.weight_grams}
                    onChange={(e) => updateWeight(i, "weight_grams", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={w.price}
                    onChange={(e) => updateWeight(i, "price", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Stock</label>
                  <input
                    type="number"
                    value={w.stock_quantity}
                    onChange={(e) => updateWeight(i, "stock_quantity", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeWeight(i)}
                  disabled={weights.length <= 1}
                  className="text-red-400 hover:text-red-600 text-lg leading-none pb-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
