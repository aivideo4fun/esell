/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const cart = useCart();

  const handleMoveToCart = (item: any) => {
    cart.addItem({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    toggleWishlist(item);
    if (cart.openCart) cart.openCart();
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            My Wishlist ({wishlist.length})
          </h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-gray-50 rounded-3xl border border-gray-200">
            <Heart className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="font-bold text-gray-700 text-base">Your wishlist is empty</p>
            <p className="text-xs text-gray-500">Explore products and tap the heart icon to save items for later.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#065f46] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition"
            >
              Explore Shop <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-[#f8fafc] p-4 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => toggleWishlist(item)}
                    className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-xs rounded-full text-red-500 hover:bg-red-50 border border-gray-200 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <Link href={`/product/${item.slug || item.id}`}>
                    <h3 className="font-bold text-xs text-gray-900 line-clamp-2 hover:text-emerald-700 transition">
                      {item.title}
                    </h3>
                  </Link>

                  <div className="flex items-baseline gap-2">
                    <span className="font-black text-sm text-[#065f46]">₹{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">₹{item.originalPrice}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}