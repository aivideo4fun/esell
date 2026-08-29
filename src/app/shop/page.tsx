"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CATEGORIES, FEATURED_PRODUCTS } from "@/lib/constants";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { Sparkles, SlidersHorizontal } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const filteredProducts =
    activeCategory === "all"
      ? FEATURED_PRODUCTS
      : FEATURED_PRODUCTS.filter(
          (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
        );

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
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href="/shop"
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
          return (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
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
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
          <SlidersHorizontal className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-700 text-sm font-semibold">No products found in this category.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block px-5 py-2 bg-gray-950 text-white text-xs font-bold rounded-full hover:bg-blue-600 transition"
          >
            Show All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
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