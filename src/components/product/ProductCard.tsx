"use client";

import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/constants";
import { useCart } from "@/hooks/useCart";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between">
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-4">
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full z-10">
            {product.badge}
          </span>
        )}
        <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md z-10">
          {discount}% OFF
        </span>
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div>
        <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-1">
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          <span>{product.rating}</span>
        </div>
        
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition">
            {product.title}
          </h3>
        </Link>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
        <div>
          <span className="text-lg font-black text-gray-950">₹{product.price}</span>
          <span className="text-xs text-gray-400 line-through ml-2">₹{product.originalPrice}</span>
        </div>

        <button
          onClick={() => addItem(product)}
          aria-label="Add to cart"
          className="p-2 rounded-xl bg-gray-900 text-white hover:bg-blue-600 transition-colors duration-200"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}