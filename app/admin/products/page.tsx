"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminFetch } from "@/lib/useAdminFetch";

interface Category { id: string; name: string; }

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  badge: string | null;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  category: Category | null;
  image: string | null;
}

const API_URL = "/api/products?admin=true&slim=true&limit=500";
const PAGE_SIZE = 50;

export default function AdminProductsPage() {
  const { data: products, loading, error, mutate } = useAdminFetch<Product[]>(API_URL);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  // Optimistic local overrides — keyed by product id
  const [overrides, setOverrides] = useState<Record<string, Partial<Product>>>({});
  const [toggleError, setToggleError] = useState("");

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) mutate();
      else {
        const j = await res.json();
        alert(j.error ?? "Failed to delete");
      }
    } finally {
      setDeleting(null);
    }
  }

  async function handleToggleActive(product: Product) {
    const newVal = !product.is_active;
    setOverrides((o) => ({ ...o, [product.id]: { ...o[product.id], is_active: newVal } }));
    setToggleError("");
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: newVal }),
    });
    if (!res.ok) {
      // Revert optimistic update on failure
      setOverrides((o) => ({ ...o, [product.id]: { ...o[product.id], is_active: !newVal } }));
      const j = await res.json().catch(() => ({}));
      setToggleError(j.error ?? `Failed to update active status (HTTP ${res.status})`);
    } else {
      mutate(true);
    }
  }

  async function handleToggleFeatured(product: Product) {
    const newVal = !product.is_featured;
    setOverrides((o) => ({ ...o, [product.id]: { ...o[product.id], is_featured: newVal } }));
    setToggleError("");
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_featured: newVal }),
    });
    if (!res.ok) {
      // Revert optimistic update on failure
      setOverrides((o) => ({ ...o, [product.id]: { ...o[product.id], is_featured: !newVal } }));
      const j = await res.json().catch(() => ({}));
      setToggleError(j.error ?? `Failed to update featured status (HTTP ${res.status})`);
    } else {
      mutate(true);
    }
  }

  const list = (products ?? []).map((p) => ({ ...p, ...overrides[p.id] }));
  const filtered = search
    ? list.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.category?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (p.badge ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : list;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(0); // reset to page 1 on new search
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/products/bulk-upload"
            className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Bulk Upload CSV
          </Link>
          <Link
            href="/admin/products/bulk-images"
            className="bg-white border border-amber-600 text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🖼 Bulk Images
          </Link>
          <Link
            href="/admin/products/new"
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name, category or badge…"
          className="w-full max-w-md border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <span className="text-xs text-gray-400">
          {search ? `${filtered.length} of ${list.length}` : `${list.length} products`}
        </span>
      </div>

      {toggleError && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
          <span>⚠ {toggleError}</span>
          <button onClick={() => setToggleError("")} className="text-red-400 hover:text-red-600 ml-4 font-bold">×</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-2 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-16" />
                <div className="h-3 bg-gray-100 rounded w-12" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8">
            <p className="text-red-600 font-medium text-sm">Error loading products</p>
            <p className="text-red-400 text-xs font-mono mt-1">{error}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Price</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Badge</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Rating</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Featured</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Active</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageItems.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-400">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{product.category?.name ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">₹{product.base_price}</td>
                      <td className="px-4 py-3">
                        {product.badge ? (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">{product.badge}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">★ {product.rating.toFixed(1)} ({product.review_count})</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          title={product.is_featured ? "Remove from homepage" : "Show on homepage"}
                          className={`text-lg transition-transform hover:scale-110 ${product.is_featured ? "text-amber-500" : "text-gray-300 hover:text-amber-400"}`}
                        >
                          ★
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${product.is_active ? "bg-green-500" : "bg-gray-300"}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${product.is_active ? "translate-x-4" : "translate-x-1"}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link href={`/admin/products/${product.id}`} className="text-xs text-blue-600 hover:underline">Edit</Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deleting === product.id}
                            className="text-xs text-red-500 hover:underline disabled:opacity-50"
                          >
                            {deleting === product.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                        {search ? `No products match "${search}".` : (
                          <>No products found.{" "}
                            <Link href="/admin/products/new" className="text-amber-600 hover:underline">Add your first product</Link>
                          </>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 0}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                        i === page ? "bg-amber-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages - 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
