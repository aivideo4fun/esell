"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { Sparkles, SlidersHorizontal, Loader2, Search, X } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (activeCategory && activeCategory !== "all") {
          queryParams.set("category", activeCategory);
        }
        if (searchQuery) {
          queryParams.set("search", searchQuery);
        }

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await res.json();

        if (data.success && data.products) {
          const formatted = data.products.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            price: p.price,
            originalPrice: p.originalPrice,
            category: p.category?.name || "Gadgets",
            image:
              p.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
            rating: p.rating || 4.8,
            badge: p.badge || "BESTSELLER",
          }));
          setProducts(formatted);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopProducts();
  }, [activeCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Direct Supplier Dispatch
        </div>
        <h1 className="text-3xl font-black text-gray-950">Catalog &amp; Collections</h1>
        <p className="text-sm text-gray-600 mt-1">
          Explore all trending products with 100% prepaid order safety.
        </p>

        {/* Active Search Filter Badge */}
        {searchQuery && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-bold text-gray-800">
            <Search className="w-3.5 h-3.5 text-gray-500" />
            <span>Search results for: &quot;{searchQuery}&quot;</span>
            <Link href="/shop" className="hover:text-red-600 ml-1">
              <X className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href={searchQuery ? `/shop?search=${encodeURIComponent(searchQuery)}` : "/shop"}
          className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition ${
            activeCategory === "all"
              ? "bg-gray-950 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          All Items
        </Link>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.slug;
          const href = searchQuery
            ? `/shop?category=${cat.slug}&search=${encodeURIComponent(searchQuery)}`
            : `/shop?category=${cat.slug}`;
          return (
            <Link
              key={cat.id}
              href={href}
              className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                isActive
                  ? "bg-gray-950 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span>{cat.icon}</span> {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-bold text-gray-500">Searching products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 space-y-3">
          <SlidersHorizontal className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-gray-900 text-sm font-bold">
            No products found {searchQuery ? `matching "${searchQuery}"` : "in this category"}.
          </p>
          <Link
            href="/shop"
            className="inline-block px-5 py-2.5 bg-gray-950 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition"
          >
            Clear Filters &amp; View All
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm font-bold text-gray-500">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}