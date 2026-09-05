"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Folder,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  RefreshCw,
  Loader2,
  Package,
  X,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  displayOrder?: number;
  productCount?: number;
  _count?: {
    products: number;
  };
  createdAt?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add Category Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("");
  const [creating, setCreating] = useState(false);

  // 1. Fetch Categories & Real Live Product Counts
  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // 2. Safe Delete Handler (POST action bypasses any 405 Method Not Allowed error)
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? Linked products will be safely unlinked.`)) {
      return;
    }

    try {
      setDeletingId(id);

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE",
          id: id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } else {
        alert("Delete Failed: " + (data.error || "Server error"));
      }
    } catch (err: any) {
      alert("Network Error: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // 3. Create Category Handler
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setCreating(true);
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          icon: newCatIcon.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.category) {
        setCategories((prev) => [data.category, ...prev]);
        setIsAddModalOpen(false);
        setNewCatName("");
        setNewCatIcon("");
      } else {
        alert(data.error || "Could not add category");
      }
    } catch {
      alert("Error adding category");
    } finally {
      setCreating(false);
    }
  };

  // Filter Categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 text-slate-900 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Category &amp; Catalog Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Organize store departments, sub-categories, and storefront mapping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCategories}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Reload categories"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            TOTAL CATEGORIES
          </span>
          <div className="text-2xl font-black text-slate-950">{categories.length}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
            ROOT DEPARTMENTS
          </span>
          <div className="text-2xl font-black text-emerald-700">{categories.length}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
            SUB-CATEGORIES
          </span>
          <div className="text-2xl font-black text-blue-700">0</div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category name or slug..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <p className="text-xs font-bold text-slate-400">Loading catalog categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Folder className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-500">No categories found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">ICON &amp; NAME</th>
                  <th className="py-3 px-4">SLUG (URL)</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">PRODUCTS LINKED</th>
                  <th className="py-3 px-4">PRIORITY ORDER</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCategories.map((cat) => {
                  const itemCount = cat.productCount ?? cat._count?.products ?? 0;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Icon */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-lg shrink-0">
                            {cat.icon || "📁"}
                          </div>
                          <span className="font-black text-slate-900 line-clamp-1">{cat.name}</span>
                        </div>
                      </td>

                      {/* Slug URL */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        /shop?category={cat.slug}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          MAIN CATEGORY
                        </span>
                      </td>

                      {/* Real Live Product Count */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Package className="w-3.5 h-3.5 text-slate-500" />
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                        #{cat.displayOrder || 0}
                      </td>

                      {/* Actions (Store link & Safe Delete) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/shop?category=${cat.slug}`}
                            target="_blank"
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition"
                            title="View storefront collection"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            disabled={deletingId === cat.id}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition disabled:opacity-40 cursor-pointer"
                            title="Delete category"
                          >
                            {deletingId === cat.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-950">Add New Category</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Watch / Kitchen Knife"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Emoji / Icon (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ⌚ or 🔪"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newCatName.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition cursor-pointer"
                >
                  {creating ? "Creating..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}