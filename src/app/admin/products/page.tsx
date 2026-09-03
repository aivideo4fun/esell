/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Trash2,
  Tag,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  X,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload,
  Check,
} from "lucide-react";

interface ProductImage {
  url: string;
}

interface ProductCategory {
  id?: string;
  name?: string;
  slug?: string;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

interface AdminProduct {
  id: string;
  title: string;
  price: number | string;
  originalPrice?: number | string;
  slug?: string;
  badge?: string;
  category?: ProductCategory;
  images?: ProductImage[];
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCsvUploading, setIsCsvUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const csvInputRef = useRef<HTMLInputElement>(null);

  // Form State (Only Light Image URLs Links)
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["M", "L"]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "50",
    categorySlug: "fashion",
    badge: "BESTSELLER",
  });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      let res = await fetch("/api/admin/categories");
      if (!res.ok) {
        res = await fetch("/api/categories");
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
        setFormData((prev) => ({
          ...prev,
          categorySlug: prev.categorySlug || data.categories[0].slug,
        }));
      } else {
        setCategories([
          { id: "cat-1", name: "Fashion", slug: "fashion", icon: "🛍️" },
          { id: "cat-2", name: "Gadgets", slug: "gadgets", icon: "⚡" },
          { id: "cat-3", name: "Kitchen", slug: "kitchen", icon: "🍳" },
        ]);
      }
    } catch {
      setCategories([
        { id: "cat-1", name: "Fashion", slug: "fashion", icon: "🛍️" },
        { id: "cat-2", name: "Gadgets", slug: "gadgets", icon: "⚡" },
        { id: "cat-3", name: "Kitchen", slug: "kitchen", icon: "🍳" },
      ]);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch {
      console.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
    void fetchProducts();
  }, [fetchCategories, fetchProducts]);

  // Handle Multi-Link Inputs
  const handleImageUrlChange = (index: number, value: string) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const addImageField = () => {
    if (imageUrls.length < 5) setImageUrls([...imageUrls, ""]);
  };

  const removeImageField = (index: number) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Create Single Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const validImages = imageUrls.filter((url) => url.trim() !== "");
    if (validImages.length === 0) {
      alert("Kam se kam 1 photo URL zaroor daalein!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrls: validImages,
          sizes: formData.categorySlug.toLowerCase().includes("fashion") ? selectedSizes : [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setImageUrls([""]);
        setSelectedSizes(["M", "L"]);
        setFormData({
          title: "",
          description: "",
          price: "",
          originalPrice: "",
          stock: "50",
          categorySlug: categories[0]?.slug || "fashion",
          badge: "BESTSELLER",
        });
        void fetchProducts();
      } else {
        alert("Error: " + (data.error || "Product save nahi hua"));
      }
    } catch {
      alert("Error saving product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product
  const handleDelete = async (id: string) => {
    if (!confirm("Kya aap is product ko delete karna chahte hain?")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert("Delete failed");
    }
  };

  // 1. Download Sample CSV Template
  const handleDownloadSampleCsv = () => {
    const csvContent =
      "title,price,originalPrice,category,stock,badge,sizes,imageUrls,description\n" +
      '"Slim Fit Cotton Shirt",799,1499,fashion,50,BESTSELLER,"S, M, L, XL","https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600","100% Breathable cotton casual shirt."\n' +
      '"Wireless Bluetooth Earbuds",1499,2999,gadgets,80,TRENDING,"","https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600","Active noise cancellation with deep bass."\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "catchbuddy_bulk_products_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Upload CSV & Bulk Insert
  const handleCsvFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCsvUploading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);

        if (lines.length <= 1) {
          alert("CSV file empty hai ya sirf header hai.");
          setIsCsvUploading(false);
          return;
        }

        // CSV parsing
        const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
        const parsedProducts = [];

        for (let i = 1; i < lines.length; i++) {
          // Regex regex to split by commas outside quotes
          const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
          const cleanRow = row.map((val) => val.trim().replace(/^["']|["']$/g, ""));

          const obj: Record<string, string> = {};
          headers.forEach((header, index) => {
            obj[header] = cleanRow[index] || "";
          });

          if (obj.title && obj.price) {
            parsedProducts.push(obj);
          }
        }

        if (parsedProducts.length === 0) {
          alert("CSV parse karne par koi product nahi mila. Please sample CSV format check karein.");
          setIsCsvUploading(false);
          return;
        }

        // Send to backend
        const res = await fetch("/api/admin/products/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: parsedProducts }),
        });

        const data = await res.json();
        if (data.success) {
          alert(data.message || `${parsedProducts.length} products successfully live ho gaye!`);
          void fetchProducts();
        } else {
          alert("Upload failed: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
        alert("CSV process karne mein error aaya. Format check karein.");
      } finally {
        setIsCsvUploading(false);
        if (csvInputRef.current) csvInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  const isFashionCategory = formData.categorySlug.toLowerCase().includes("fashion");

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Top Header & Bulk Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Product Inventory Manager</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Single form ya bulk CSV upload se instant products live karein
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sample CSV Download */}
          <button
            onClick={handleDownloadSampleCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-200"
            title="Download CSV Format Template"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Sample CSV
          </button>

          {/* Bulk CSV Upload */}
          <button
            onClick={() => csvInputRef.current?.click()}
            disabled={isCsvUploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isCsvUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {isCsvUploading ? "Importing..." : "Bulk CSV Upload"}
          </button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvFileUpload}
            className="hidden"
          />

          {/* Single Add Product */}
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Add Single Product Modal Form */}
      {showModal && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-black text-slate-950 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" /> New Product Details
            </h3>
            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Instant Live
            </span>
          </div>

          <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1">
                Product Title / Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Slim Fit Cotton Casual Shirt"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1">
                Selling Price (₹) *
              </label>
              <input
                required
                type="number"
                placeholder="799"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1">
                Original MRP / Cut Price (₹) *
              </label>
              <input
                required
                type="number"
                placeholder="1499"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1">
                Category *
              </label>
              <select
                value={formData.categorySlug}
                onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-blue-600 outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug} className="text-slate-900 font-bold">
                    {c.icon ? `${c.icon} ` : "📦 "} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1">
                Badge
              </label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-blue-600 outline-none cursor-pointer"
              >
                <option value="BESTSELLER">🔥 Bestseller</option>
                <option value="TRENDING">⚡ Trending</option>
                <option value="LIMITED DEAL">⏳ Limited Deal</option>
                <option value="NEW ARRIVAL">✨ New Arrival</option>
              </select>
            </div>

            {/* Fashion Sizes Selector */}
            {isFashionCategory && (
              <div className="sm:col-span-2 bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-2">
                <label className="text-xs font-black text-blue-900 uppercase tracking-wider block">
                  👕 Available Sizes for Fashion
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_SIZES.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Multiple Photo Link Inputs */}
            <div className="sm:col-span-2 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4 text-blue-600" /> Photo URLs (Paste Image Web Links)
                </label>
                {imageUrls.length < 5 && (
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-xs font-black text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    + Add Another Image Link
                  </button>
                )}
              </div>

              {imageUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-600 w-28 shrink-0">
                    {index === 0 ? "Cover Photo:" : `Photo ${index + 1}:`}
                  </span>
                  <input
                    required={index === 0}
                    type="url"
                    placeholder={
                      index === 0
                        ? "https://example.com/product-main.jpg"
                        : "https://example.com/gallery-2.jpg"
                    }
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none"
                  />
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1">
                Description / Highlights
              </label>
              <textarea
                rows={2}
                placeholder="Product specifications, bullet points, fabric..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-950 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Live Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Complete Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-bold">Products load ho rahe hain...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-black text-slate-900">Abhi koi products nahi hain.</p>
            <p className="text-xs text-slate-500 font-medium">Bulk CSV upload ya upar button se product add karein.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Badge</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
              {products.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={item.images?.[0]?.url || "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80"}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="font-black text-slate-950 block text-sm">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {item.images?.length || 1} photo(s) • /{item.slug}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 uppercase font-black text-xs text-blue-600">
                    {item.category?.name || "General"}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-black">
                      <Tag className="w-3 h-3" /> {item.badge}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-slate-950 text-sm">₹{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-slate-400 line-through ml-1.5 text-xs font-normal">₹{item.originalPrice}</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}