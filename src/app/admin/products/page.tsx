"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Loader2, Sparkles, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State with Multi-Image Array (Up to 5 images)
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "50",
    categorySlug: "gadgets",
    badge: "BESTSELLER",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageUrlChange = (index: number, value: string) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const addImageField = () => {
    if (imageUrls.length < 5) {
      setImageUrls([...imageUrls, ""]);
    }
  };

  const removeImageField = (index: number) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const validImages = imageUrls.filter((url) => url.trim() !== "");
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, imageUrls: validImages }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setImageUrls([""]);
        setFormData({
          title: "",
          description: "",
          price: "",
          originalPrice: "",
          stock: "50",
          categorySlug: "gadgets",
          badge: "BESTSELLER",
        });
        fetchProducts();
      } else {
        alert("Error creating product: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Something went wrong while creating the product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product from live store?")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      alert("Error deleting product");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black">Product Inventory Manager</h1>
          <p className="text-xs text-gray-700 font-semibold mt-1">
            Add, update and manage real selling products with multi-photo gallery directly to database
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Real Product
        </button>
      </div>

      {/* Add Real Product Modal Form */}
      {showModal && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gray-300 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 className="font-black text-black text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" /> New Product Details &amp; Photo Gallery
            </h3>
            <span className="text-xs font-black text-green-800 bg-green-100 px-3 py-1 rounded-full border border-green-300">
              Instant Database Live
            </span>
          </div>

          <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                Product Title / Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Wireless Portable Electric Car Air Inflator Pump"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl text-sm font-bold text-black placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                Our Selling Price (₹) *
              </label>
              <input
                required
                type="number"
                placeholder="899"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl text-sm font-bold text-black placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                Original MRP / Cut Price (₹) *
              </label>
              <input
                required
                type="number"
                placeholder="1999"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl text-sm font-bold text-black placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                Category *
              </label>
              <select
                value={formData.categorySlug}
                onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl text-sm font-bold text-black focus:border-blue-600 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.slug} className="text-black font-bold">
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                Tag / Badge
              </label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl text-sm font-bold text-black focus:border-blue-600 focus:outline-none cursor-pointer"
              >
                <option value="BESTSELLER" className="text-black font-bold">🔥 Bestseller</option>
                <option value="TRENDING" className="text-black font-bold">⚡ Trending</option>
                <option value="LIMITED DEAL" className="text-black font-bold">⏳ Limited Deal</option>
                <option value="NEW ARRIVAL" className="text-black font-bold">✨ New Arrival</option>
              </select>
            </div>

            {/* Multi-Photo Input Area */}
            <div className="sm:col-span-2 space-y-3 bg-gray-50 p-4 rounded-2xl border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4 text-blue-600" /> Product Photos (Add up to 5 URLs)
                </label>
                {imageUrls.length < 5 && (
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-xs font-black text-blue-700 hover:text-blue-900 transition underline cursor-pointer"
                  >
                    + Add Another Image Link
                  </button>
                )}
              </div>

              {imageUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-800 w-28 shrink-0">
                    {index === 0 ? "Cover (Main):" : `Gallery ${index + 1}:`}
                  </span>
                  <input
                    required={index === 0}
                    type="url"
                    placeholder={
                      index === 0
                        ? "Paste Main photo URL (.jpg / .png / web link)"
                        : "Paste additional photo link"
                    }
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="flex-1 p-2.5 bg-white border-2 border-gray-300 rounded-xl text-xs font-bold text-black placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
                  />
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="p-2 text-gray-500 hover:text-red-600 transition cursor-pointer"
                      title="Remove field"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                Product Highlights / Description
              </label>
              <textarea
                rows={3}
                placeholder="Bullet features, specifications, box contents..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl text-xs font-bold text-black placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-black rounded-xl text-xs font-black transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-blue-600 text-white rounded-xl text-xs font-black transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Publish Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Complete Products Table */}
      <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-600 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-bold">Loading real database products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-gray-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-xs font-black text-black">No database products created yet.</p>
            <p className="text-xs text-gray-600 font-semibold">
              Click &quot;Add New Real Product&quot; to list your first item with multiple photos.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 border-b-2 border-gray-200 text-black font-black uppercase tracking-wider">
              <tr>
                <th className="p-4">Product Info</th>
                <th className="p-4">Category</th>
                <th className="p-4">Badge</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-bold text-black">
              {products.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={item.images?.[0]?.url || "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80"}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-gray-300 shrink-0"
                    />
                    <div>
                      <span className="font-black text-black block text-sm">{item.title}</span>
                      <span className="text-[10px] text-gray-600 font-semibold">
                        {item.images?.length || 1} photo(s) • Slug: /{item.slug}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 uppercase font-black text-xs text-blue-700">
                    {item.category?.name || "General"}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-black">
                      <Tag className="w-3 h-3" /> {item.badge}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-black text-sm">₹{item.price}</span>
                    <span className="text-gray-500 line-through ml-1.5 text-xs font-bold">₹{item.originalPrice}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition cursor-pointer"
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