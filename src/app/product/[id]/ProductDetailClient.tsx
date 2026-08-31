"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, Zap, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export interface ProductItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  description?: string | null;
  images?: string[];
  category?: string;
  slug?: string | null;
}

export default function ProductDetailClient({ product }: { product: ProductItem }) {
  const [qty, setQty] = useState<number>(1);
  const cart = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    cart.addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || "/placeholder.png",
      quantity: qty,
    });

    if (cart.openCart) {
      cart.openCart();
    }
  };

  const handleBuyNow = () => {
    cart.addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || "/placeholder.png",
      quantity: qty,
    });

    router.push("/checkout");
  };

  return (
    <div className="space-y-5">
      {/* Prepaid Offer Alert */}
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

      {/* Action Buttons */}
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
    </div>
  );
}