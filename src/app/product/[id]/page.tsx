/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ShieldCheck, Truck, RotateCcw, Zap, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cart = useCart();
  const [qty, setQty] = useState<number>(1);

  const rawId = params?.id;
  const slug = Array.isArray(rawId) ? rawId[0] : (rawId as string) || "bottel-3398";
  const title = slug.replace(/-/g, " ").toUpperCase();

  const sellingPrice = 233;
  const originalPrice = 1088;
  const discount = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
  const displayImage = "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80";

  const handleAddToCart = () => {
    cart.addItem({
      id: slug,
      title: title,
      price: sellingPrice,
      image: displayImage,
      quantity: qty,
    });
    if (cart.openCart) {
      cart.openCart();
    }
  };

  const handleBuyNow = () => {
    cart.addItem({
      id: slug,
      title: title,
      price: sellingPrice,
      image: displayImage,
      quantity: qty,
    });
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-white text-[#0f172a] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-xs font-bold text-[#64748b] mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#065f46]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#065f46]">Shop</Link>
          <span>/</span>
          <span className="text-[#0f172a] truncate max-w-xs">{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl bg-[#f8fafc] border border-gray-200 overflow-hidden flex items-center justify-center p-6">
              <img
                src={displayImage}
                alt={title}
                className="object-contain w-full h-full"
              />
              <span className="absolute top-4 left-4 bg-[#16a34a] text-white text-xs font-black px-3 py-1 rounded-lg">
                {discount}% OFF
              </span>
            </div>
          </div>

          {/* Product Info & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-xs font-bold">
              <Zap className="w-3.5 h-3.5 fill-[#16a34a]" /> Direct Verified Dispatch
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[#0f172a] leading-tight capitalize">
              {title}
            </h1>

            <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-[#f8fafc] border border-gray-200">
              <span className="text-3xl font-black text-[#065f46]">₹{sellingPrice}</span>
              <span className="text-base font-bold text-[#64748b] line-through">₹{originalPrice}</span>
              <span className="text-xs font-black text-[#16a34a] bg-[#f0fdf4] px-2.5 py-1 rounded-md border border-[#bbf7d0]">
                Flat ₹50 Extra Off on Prepaid UPI
              </span>
            </div>

            {/* Offer Banner */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#065f46]">
              <Sparkles className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed">
                <span className="font-black text-[#16a34a]">Prepaid Special:</span> Flat ₹50 Instant Discount + FREE Express Delivery on Online UPI payment!
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-black text-[#64748b] uppercase tracking-wide">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 text-sm font-black text-[#0f172a] hover:bg-gray-200 rounded-l-xl transition cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-xs font-black text-[#0f172a]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3.5 py-1.5 text-sm font-black text-[#0f172a] hover:bg-gray-200 rounded-r-xl transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-900 hover:border-[#16a34a] hover:text-[#16a34a] text-[#0f172a] font-black py-3.5 px-6 rounded-2xl transition cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#065f46] hover:bg-[#044e39] text-white font-black py-3.5 px-6 rounded-2xl transition shadow-lg shadow-emerald-950/20 active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" /> Buy Now (Instant Pay)
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center">
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-gray-100">
                <Truck className="w-5 h-5 text-[#16a34a] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-[#0f172a]">Free Express Delivery</p>
              </div>
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-gray-100">
                <ShieldCheck className="w-5 h-5 text-[#16a34a] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-[#0f172a]">100% Verified Safe</p>
              </div>
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-gray-100">
                <RotateCcw className="w-5 h-5 text-[#16a34a] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-[#0f172a]">5-Day Replacement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}