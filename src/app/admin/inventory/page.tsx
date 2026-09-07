/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  RefreshCw,
  Search,
  Check,
  Loader2,
  SlidersHorizontal,
  DollarSign,
  Package,
} from "lucide-react";

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  images?: { url: string }[];
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  } | null;
}

interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  products: ProductItem[];
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [activeCatForPriceUpdate, setActiveCatForPriceUpdate] = useState<string | null>(null);
  const [priceAdjType, setPriceAdjType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [priceAdjValue, setPriceAdjValue] = useState("");
  const [isAdjustingCat, setIsAdjustingCat] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to load inventory", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInventory();
  }, [fetchInventory]);

  const handleUpdateProduct = async (id: string, newPrice: number, newStock: number) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPrice, stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, price: newPrice, stock: newStock } : p))
        );
      } else {
        alert("Update failed: " + (data.error || "Server error"));
      }
    } catch {
      alert("Network error while updating item");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCategoryPriceAdjustment = async (categoryId: string) => {
    const val = parseFloat(priceAdjValue);
    if (isNaN(val)) {
      alert("Kripya ek valid number daalein!");
      return;
    }

    if (!confirm(`Kya aap is category ke sabhi products ki prices ko modify karna chahte hain?`)) {
      return;
    }

    try {
      setIsAdjustingCat(true);
      const res = await fetch("/api/admin/products/bulk-price-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: categoryId === "uncategorized" ? null : categoryId,
          adjustmentType: priceAdjType,
          value: val,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || "Category prices updated successfully!");
        setActiveCatForPriceUpdate(null);
        setPriceAdjValue("");
        void fetchInventory();
      } else {
        alert("Failed: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Network error during category price update");
    } finally {
      setIsAdjustingCat(false);
    }
  };

  // Group products strictly by their category name or ID
  const categorizedProducts = useMemo(() => {
    const map: Record<string, CategoryGroup> = {};

    const filtered = products.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.forEach((p) => {
      const catId = p.category?.id || p.categoryId || "uncategorized";
      const catName = p.category?.name || "Uncategorized Products";
      const catSlug = p.category?.slug || "uncategorized";
      const catIcon = p.category?.icon || "📦";

      if (!map[catId]) {
        map[catId] = {
          id: catId,
          name: catName,
          slug: catSlug,
          icon: catIcon,
          products: [],
        };
      }
      map[catId].products.push(p);
    });

    return Object.values(map);
  }, [products, searchQuery]);

  const totalSkus = products.length;
  const inStockCount = products.filter((p) => p.stock > 5).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 text-slate-900 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Live Inventory &amp; Category Price Manager
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage category-wise stocks and adjust specific department prices independently.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total SKUs</span>
          <div className="text-2xl font-black text-slate-950">{totalSkus}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">In Stock</span>
          <div className="text-2xl font-black text-emerald-700">{inStockCount}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">Low Stock (≤5)</span>
          <div className="text-2xl font-black text-amber-700">{lowStockCount}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">Out of Stock</span>
          <div className="text-2xl font-black text-rose-700">{outStockCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products across categories..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-xs font-bold text-slate-400">Loading categorized inventory...</p>
        </div>
      ) : categorizedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-2">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No inventory items found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categorizedProducts.map((group) => (
            <div key={group.id} className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xl">
                    {group.icon || "📁"}
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      {group.name}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {group.products.length} {group.products.length === 1 ? "item" : "items"}
                      </span>
                    </h2>
                    <span className="text-[11px] font-mono text-slate-500">Slug: /{group.slug}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveCatForPriceUpdate(group.id);
                    setPriceAdjValue("");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-2xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust Category Prices
                </button>
              </div>

              {activeCatForPriceUpdate === group.id && (
                <div className="bg-emerald-50/80 p-4 border-b border-emerald-200 flex flex-wrap items-center gap-3 animate-in fade-in duration-200">
                  <span className="text-xs font-black text-emerald-950">
                    Modify prices for <b>{group.name}</b> only:
                  </span>
                  <select
                    value={priceAdjType}
                    onChange={(e) => setPriceAdjType(e.target.value as "PERCENT" | "FLAT")}
                    className="px-2.5 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                  <input
                    type="number"
                    placeholder={priceAdjType === "PERCENT" ? "e.g. +10 or -5" : "e.g. +100 or -50"}
                    value={priceAdjValue}
                    onChange={(e) => setPriceAdjValue(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold w-40 outline-none"
                  />
                  <button
                    onClick={() => handleCategoryPriceAdjustment(group.id)}
                    disabled={isAdjustingCat || !priceAdjValue}
                    className="px-4 py-1.5 bg-slate-950 text-white rounded-xl text-xs font-black hover:bg-emerald-800 transition cursor-pointer disabled:opacity-50"
                  >
                    {isAdjustingCat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply to this Category"}
                  </button>
                  <button
                    onClick={() => setActiveCatForPriceUpdate(null)}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <tr>
                      <th className="py-3 px-6">PRODUCT</th>
                      <th className="py-3 px-4">PRICE (₹)</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4 text-center">STOCK QUANTITY</th>
                      <th className="py-3 px-6 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {group.products.map((item) => {
                      const isUpdating = updatingId === item.id;
                      const isLowStock = item.stock > 0 && item.stock <= 5;
                      const isOutOfStock = item.stock === 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  item.images?.[0]?.url ||
                                  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80"
                                }
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <span className="font-black text-slate-900 line-clamp-1">{item.title}</span>
                                <span className="text-[10px] font-mono text-slate-400">/{item.slug}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                              <input
                                type="number"
                                defaultValue={item.price}
                                id={`price-${item.id}`}
                                className="w-24 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold font-mono text-slate-900 outline-none focus:border-emerald-600"
                              />
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {isOutOfStock ? (
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                                OUT OF STOCK
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                                LOW ({item.stock})
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                IN STOCK ({item.stock})
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="number"
                              defaultValue={item.stock}
                              id={`stock-${item.id}`}
                              className="w-20 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold font-mono text-center text-slate-900 outline-none focus:border-emerald-600"
                            />
                          </td>

                          <td className="py-3.5 px-6 text-right">
                            <button
                              onClick={() => {
                                const priceInput = (document.getElementById(`price-${item.id}`) as HTMLInputElement)?.value;
                                const stockInput = (document.getElementById(`stock-${item.id}`) as HTMLInputElement)?.value;
                                handleUpdateProduct(item.id, parseFloat(priceInput) || item.price, parseInt(stockInput) || 0);
                              }}
                              disabled={isUpdating}
                              className="px-3.5 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              Save
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}