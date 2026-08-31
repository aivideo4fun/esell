/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Star, ShoppingBag, Zap } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";

export interface CardProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  mrp?: number;
  category?: string | { name?: string };
  image?: string;
  images?: Array<{ url: string } | string>;
  slug?: string;
}

export default function ProductCard({ product }: { product: CardProduct }) {
  const cart = useCart();
  const router = useRouter();

  const mrpVal = Number(product.originalPrice || product.mrp || 0);
  const priceVal = Number(product.price || 0);
  const discount = mrpVal > priceVal ? Math.round(((mrpVal - priceVal) / mrpVal) * 100) : 0;

  const mainImage =
    typeof product.images?.[0] === "string"
      ? product.images[0]
      : (product.images?.[0] as { url: string })?.url || product.image || "/placeholder.png";

  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || "GADGETS";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cart.addItem({
      id: product.id,
      title: product.title,
      price: priceVal,
      image: mainImage,
      quantity: 1,
    });
    if (cart.openCart) cart.openCart();
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cart.addItem({
      id: product.id,
      title: product.title,
      price: priceVal,
      image: mainImage,
      quantity: 1,
    });
    router.push("/checkout");
  };

  return (
    <div className="group bg-white rounded-3xl border border-gray-200 hover:border-[#16a34a] p-4 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between">
      <div>
        {/* Image Container with Badges */}
        <Link href={`/product/${product.slug || product.id}`}>
          <div className="relative aspect-square w-full rounded-2xl bg-[#f8fafc] overflow-hidden flex items-center justify-center p-3 mb-4">
            <img
              src={mainImage}
              alt={product.title}
              className="object-contain w-full h-full group-hover:scale-105 transition duration-500"
            />

            {/* Bestseller Badge */}
            <span className="absolute top-2.5 left-2.5 bg-black text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              BESTSELLER
            </span>

            {/* Discount Badge */}
            {discount > 0 && (
              <span className="absolute top-2.5 right-2.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                {discount}% OFF
              </span>
            )}
          </div>
        </Link>

        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#16a34a]">
            {categoryName}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>4.8</span>
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/product/${product.slug || product.id}`}>
          <h3 className="text-sm font-black text-[#0f172a] hover:text-[#16a34a] transition line-clamp-1 mb-2 capitalize">
            {product.title}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg font-black text-[#065f46]">
            ₹{priceVal}
          </span>
          {mrpVal > priceVal && (
            <span className="text-xs font-bold text-[#64748b] line-through">
              ₹{mrpVal}
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#f0fdf4] border border-[#bbf7d0] hover:bg-[#dcfce7] text-[#065f46] text-xs font-black py-2.5 px-3 rounded-xl transition cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#16a34a]" /> Add
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#065f46] hover:bg-[#044e39] text-white text-xs font-black py-2.5 px-3 rounded-xl transition shadow-md shadow-emerald-950/20 active:scale-95 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-white" /> Buy
        </button>
      </div>
    </div>
  );
}