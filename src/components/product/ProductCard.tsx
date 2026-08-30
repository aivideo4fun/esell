"use client";

import Link from "next/link";
import { Star, ShoppingBag, Zap } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: {
    id: string;
    slug?: string;
    title: string;
    price: number;
    originalPrice: number;
    category?: string;
    image: string;
    rating?: number;
    badge?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCart();

  const productLink = `/shop/${product.slug || product.id}`;
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Product Image & Badge */}
      <Link href={productLink} className="relative aspect-square bg-gray-50 overflow-hidden block">
        <img
          src={product.image || "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80"}
          alt={product.title}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-black text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-md">
            {discount}% OFF
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 space-y-3 flex flex-col justify-between grow">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
            <span className="text-blue-600 uppercase font-bold">{product.category || "Gadget"}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating || "4.8"}</span>
            </div>
          </div>
          <Link href={productLink}>
            <h3 className="font-bold text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2 border-t border-gray-100 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-gray-950">₹{product.price}</span>
            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                addItem({
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  image: product.image,
                  quantity: 1,
                })
              }
              className="py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Add
            </button>
            <button
              onClick={() => {
                addItem({
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  image: product.image,
                  quantity: 1,
                });
                openCart();
              }}
              className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" /> Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}