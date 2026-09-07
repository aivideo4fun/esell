/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  CheckSquare,
  Square,
  FolderInput,
  Search,
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
  stock?: number;
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCsvUploading, setIsCsvUploading] = useState(false);
  const [isExcelUploading, setIsExcelUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // Bulk Category Assignment State
  const [bulkTargetCategory, setBulkTargetCategory] = useState("");
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);

  const csvInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Form State
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
        setBulkTargetCategory(data.categories[0].slug);
      } else {
        const defaultCats = [
          { id: "cat-1", name: "Fashion", slug: "fashion", icon: "🛍️" },
          { id: "cat-2", name: "Gadgets", slug: "gadgets", icon: "⚡" },
          { id: "cat-3", name: "Kitchen", slug: "kitchen", icon: "🍳" },
        ];
        setCategories(defaultCats);
        setBulkTargetCategory("fashion");
      }
    } catch {
      setCategories([
        { id: "cat-1", name: "Fashion", slug: "fashion", icon: "🛍️" },
        { id: "cat-2", name: "Gadgets", slug: "gadgets", icon: "⚡" },
        { id: "cat-3", name: "Kitchen", slug: "kitchen", icon: "🍳" },
      ]);
      setBulkTargetCategory("fashion");
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

  // Filtered Products based on Search & Category
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const itemCatName = item.category?.name || "General";
      const matchesCategory = 
        selectedCategoryFilter === "ALL" || 
        itemCatName === selectedCategoryFilter ||
        item.category?.slug === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategoryFilter]);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Delete Handler
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Kya aap sach me select kiye gaye ${selectedIds.length} products ko delete karna chahte hain?`)) {
      return;
    }

    try {
      setIsBulkDeleting(true);
      const res = await fetch("/api/admin/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        setSelectedIds([]);
        alert(data.message || "Selected products deleted!");
      } else {
        alert("Bulk delete failed: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Network error during bulk delete");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Bulk Category Assign Handler
  const handleBulkAssignCategory = async () => {
    if (selectedIds.length === 0 || !bulkTargetCategory) return;

    try {
      setIsBulkAssigning(true);
      const res = await fetch("/api/admin/products/bulk-assign-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: selectedIds,
          categorySlug: bulkTargetCategory,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || "Categories updated successfully!");
        setSelectedIds([]);
        void fetchProducts();
      } else {
        alert("Failed to update categories: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Network error during bulk category update");
    } finally {
      setIsBulkAssigning(false);
    }
  };

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

  // Delete Single Product
  const handleDelete = async (id: string) => {
    if (!confirm("Kya aap is product ko delete karna chahte hain?")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
      }
    } catch {
      alert("Delete failed");
    }
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const csvContent =
      "title,price,originalPrice,category,stock,badge,sizes,imageUrls,description\n" +
      '"Slim Fit Cotton Shirt",799,1499,fashion,50,BESTSELLER,"S, M, L, XL","https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600","100% Breathable cotton casual shirt."\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "catchbuddy_bulk_products_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload CSV
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
          alert("CSV file empty hai.");
          setIsCsvUploading(false);
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
        const parsedProducts = [];

        for (let i = 1; i < lines.length; i++) {
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
        alert("CSV process karne mein error aaya.");
      } finally {
        setIsCsvUploading(false);
        if (csvInputRef.current) csvInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  // Upload Excel
  const handleExcelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      setIsExcelUploading(true);
      const res = await fetch("/api/admin/products/bulk-excel", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || "Excel products imported successfully!");
        void fetchProducts();
      } else {
        alert("Excel Import Error: " + (data.error || "Upload failed"));
      }
    } catch {
      alert("Network error while uploading Excel file.");
    } finally {
      setIsExcelUploading(false);
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  };

  const isFashionCategory = formData.categorySlug.toLowerCase().includes("fashion");
  const isAllSelected = filteredProducts.length > 0 && selectedIds.length === filteredProducts.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4">
      {/* Top Header & Bulk Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Product Inventory Manager</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Search products, filter by category, manage stock &amp; bulk assign categories
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadSampleCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Sample CSV
          </button>

          <button
            onClick={() => csvInputRef.current?.click()}
            disabled={isCsvUploading || isExcelUploading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isCsvUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            CSV Upload
          </button>
          <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCsvFileUpload} className="hidden" />

          <button
            onClick={() => excelInputRef.current?.click()}
            disabled={isExcelUploading || isCsvUploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isExcelUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Upload Excel (.xlsx)
          </button>
          <input ref={excelInputRef} type="file" accept=".xlsx, .xls" onChange={handleExcelFileUpload} className="hidden" />

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* SEARCH AND CATEGORY FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3 justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategoryFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
              selectedCategoryFilter === "ALL"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category?.name === cat.name || p.category?.slug === cat.slug).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
                  selectedCategoryFilter === cat.name
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat.icon || "📁"} {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-950">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">
              {selectedIds.length}
            </span>
            <span>products selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
              <FolderInput className="w-4 h-4 text-emerald-600" />
              <select
                value={bulkTargetCategory}
                onChange={(e) => setBulkTargetCategory(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    Move to: {c.icon ? `${c.icon} ` : ""} {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBulkAssignCategory}
                disabled={isBulkAssigning}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                {isBulkAssigning ? "Moving..." : "Apply Category"}
              </button>
            </div>

            <button
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-1.5 bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Deselect All
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isBulkDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {isBulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
            </button>
          </div>
        </div>
      )}

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

            <div className="sm:col-span-2 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4 text-blue-600" /> Photo URLs
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
                    placeholder="https://example.com/product.jpg"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 outline-none"
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
                placeholder="Product specifications..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 outline-none"
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
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-black text-slate-900">Koi products nahi mile.</p>
            <p className="text-xs text-slate-500 font-medium">Search query ya category filter change karke dekhein.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider">
              <tr>
                <th className="p-4 w-12 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-800 transition cursor-pointer"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : selectedIds.length > 0 ? (
                      <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center text-white text-[10px] font-black">
                        -
                      </div>
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Badge</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
              {filteredProducts.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`transition ${
                      isSelected ? "bg-emerald-50/50" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSelectOne(item.id)}
                        className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>

                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={
                          item.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80"
                        }
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-black text-slate-950 block text-sm">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {item.images?.length || 1} photo(s) • Stock: {item.stock ?? 'N/A'}
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
                        <span className="text-slate-400 line-through ml-1.5 text-xs font-normal">
                          ₹{item.originalPrice}
                        </span>
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}