/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Search,
  Plus,
  Minus,
  Save,
  Percent,
  TrendingUp,
  X,
} from "lucide-react";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Local inputs state
  const [stockInputs, setStockInputs] = useState<{ [key: string]: number }>({});
  const [priceInputs, setPriceInputs] = useState<{ [key: string]: number }>({});

  // Bulk Percentage Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkPercent, setBulkPercent] = useState("10");
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (data.success) {
        const prods = data.products || [];
        setProducts(prods);

        const initialStock: { [key: string]: number } = {};
        const initialPrice: { [key: string]: number } = {};
        prods.forEach((p: any) => {
          initialStock[p.id] = p.stock ?? 0;
          initialPrice[p.id] = p.price ?? 0;
        });
        setStockInputs(initialStock);
        setPriceInputs(initialPrice);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Update Stock
  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      setUpdatingId(productId);
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
      } else {
        alert("Failed to update stock");
      }
    } catch {
      alert("Error updating inventory");
    } finally {
      setUpdatingId(null);
    }
  };

  // Update Price
  const handlePriceUpdate = async (productId: string, newPrice: number) => {
    if (newPrice <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    try {
      setUpdatingId(productId);
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, price: newPrice }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p))
        );
        alert("Price updated successfully!");
      } else {
        alert("Failed to update price");
      }
    } catch {
      alert("Error updating price");
    } finally {
      setUpdatingId(null);
    }
  };

  // Bulk Price Update via Percentage
  const handleBulkPriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseFloat(bulkPercent);
    if (isNaN(pct) || pct === 0) {
      alert("Please enter a valid non-zero percentage.");
      return;
    }

    if (!confirm(`Are you sure you want to change all product prices by ${pct}%?`)) {
      return;
    }

    try {
      setBulkUpdating(true);
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BULK_PRICE_PERCENTAGE",
          percentage: pct,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setIsBulkModalOpen(false);
        fetchInventory();
      } else {
        alert(data.error || "Bulk update failed");
      }
    } catch {
      alert("Network error updating bulk prices");
    } finally {
      setBulkUpdating(false);
    }
  };

  // Metrics
  const totalProducts = products.length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const inStockCount = products.filter((p) => p.stock > 5).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === "OUT_OF_STOCK") return p.stock === 0;
    if (filter === "LOW_STOCK") return p.stock > 0 && p.stock <= 5;
    if (filter === "IN_STOCK") return p.stock > 5;
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-950">Live Inventory &amp; Price Manager</h1>
          <p className="text-xs text-gray-600 font-semibold mt-1">
            Set individual item prices, increase prices in bulk by percentage, and manage real-time stock levels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer"
          >
            <Percent className="w-3.5 h-3.5 text-emerald-400" /> Bulk Price Update (%)
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border-2 border-gray-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Total SKUs</p>
          <p className="text-2xl font-black text-gray-950">{totalProducts}</p>
          <p className="text-[10px] font-bold text-gray-500">Active catalog items</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border-2 border-green-200 bg-green-50/20 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-green-700 uppercase tracking-wider">In Stock</p>
          <p className="text-2xl font-black text-green-700">{inStockCount}</p>
          <p className="text-[10px] font-bold text-green-600">Stock &gt; 5 units</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border-2 border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-amber-700 uppercase tracking-wider">Low Stock</p>
          <p className="text-2xl font-black text-amber-700">{lowStockCount}</p>
          <p className="text-[10px] font-bold text-amber-600">1 to 5 units left</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border-2 border-red-200 bg-red-50/20 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-red-700 uppercase tracking-wider">Out of Stock</p>
          <p className="text-2xl font-black text-red-700">{outOfStockCount}</p>
          <p className="text-[10px] font-bold text-red-600">Disabled on frontend</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Items" },
            { key: "IN_STOCK", label: "In Stock" },
            { key: "LOW_STOCK", label: "Low Stock (≤5)" },
            { key: "OUT_OF_STOCK", label: "Out of Stock (0)" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition cursor-pointer border ${
                filter === t.key
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search product name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-emerald-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-600 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading stock &amp; pricing...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-gray-500 space-y-2">
            <Package className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-xs font-black text-black">No products matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 border-b-2 border-gray-200 text-black font-black uppercase tracking-wider">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Price (₹)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Quick Adjust</th>
                  <th className="p-4 text-right">Exact Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-bold text-black">
                {filteredProducts.map((product) => {
                  const img = product.images?.[0]?.url || "/placeholder.png";
                  const currentInputStock = stockInputs[product.id] ?? product.stock;
                  const currentInputPrice = priceInputs[product.id] ?? product.price;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      {/* Product Details */}
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt=""
                            className="w-12 h-12 rounded-xl object-contain border border-gray-200 bg-gray-50 shrink-0"
                          />
                          <div>
                            <p className="font-black text-xs text-gray-900 line-clamp-1">{product.title}</p>
                            <p className="text-[10px] text-gray-500 font-mono">Slug: {product.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Editable Price with Save Icon */}
                      <td className="p-4 align-middle">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-gray-500 font-black">₹</span>
                          <input
                            type="number"
                            min="1"
                            value={currentInputPrice}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setPriceInputs({ ...priceInputs, [product.id]: val });
                            }}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-xs font-black text-center focus:outline-none focus:border-emerald-600 bg-white"
                          />
                          <button
                            type="button"
                            disabled={updatingId === product.id || currentInputPrice === product.price}
                            onClick={() => handlePriceUpdate(product.id, currentInputPrice)}
                            className="p-1.5 bg-[#065f46] hover:bg-[#044e39] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg transition cursor-pointer"
                            title="Save new price"
                          >
                            {updatingId === product.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 align-middle">
                        {product.stock === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 border border-red-200 rounded-lg text-[10px] font-black uppercase">
                            <XCircle className="w-3 h-3" /> Out of Stock
                          </span>
                        ) : product.stock <= 5 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-black uppercase">
                            <AlertTriangle className="w-3 h-3" /> Low ({product.stock} left)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 border border-green-200 rounded-lg text-[10px] font-black uppercase">
                            <CheckCircle2 className="w-3 h-3" /> In Stock ({product.stock})
                          </span>
                        )}
                      </td>

                      {/* Quick Adjust (+ / -) */}
                      <td className="p-4 align-middle text-center">
                        <div className="inline-flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                          <button
                            type="button"
                            disabled={updatingId === product.id || product.stock <= 0}
                            onClick={() => handleStockUpdate(product.id, Math.max(0, product.stock - 1))}
                            className="px-3 py-1 text-xs font-black hover:bg-gray-200 disabled:opacity-40 transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-black text-gray-900 min-w-8">
                            {product.stock}
                          </span>
                          <button
                            type="button"
                            disabled={updatingId === product.id}
                            onClick={() => handleStockUpdate(product.id, product.stock + 1)}
                            className="px-3 py-1 text-xs font-black hover:bg-gray-200 disabled:opacity-40 transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Exact Edit & Save Stock */}
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min="0"
                            value={currentInputStock}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setStockInputs({ ...stockInputs, [product.id]: val });
                            }}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-xs font-bold text-center focus:outline-none focus:border-emerald-600"
                          />
                          <button
                            type="button"
                            disabled={updatingId === product.id || currentInputStock === product.stock}
                            onClick={() => handleStockUpdate(product.id, currentInputStock)}
                            className="p-1.5 bg-[#065f46] hover:bg-[#044e39] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg transition cursor-pointer"
                            title="Save stock"
                          >
                            {updatingId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
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

      {/* Bulk Percentage Price Increase Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  %
                </div>
                <h3 className="text-sm font-black text-gray-950">Bulk Price Adjuster</h3>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 font-medium">
              Sabhi products ki price ek sath badhane ke liye percentage daalein (e.g. <strong>10</strong> for +10%, <strong>20</strong> for +20%).
            </p>

            <form onSubmit={handleBulkPriceSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Percentage Increase (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g. 15"
                    value={bulkPercent}
                    onChange={(e) => setBulkPercent(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold focus:outline-emerald-600"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">
                    %
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkUpdating || !bulkPercent}
                  className="px-4 py-2 bg-[#065f46] hover:bg-[#044e39] disabled:opacity-50 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                >
                  {bulkUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating all...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-3.5 h-3.5" /> Apply Percentage
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}