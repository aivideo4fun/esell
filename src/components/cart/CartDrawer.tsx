/* eslint-disable @next/next/no-img-element */
"use client";

import { useCart, CartItem } from "@/hooks/useCart";
import { ShoppingBag, X, Trash2, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const cart = useCart();
  const router = useRouter();

  const isOpen = cart.isOpen ?? false;
  const items: CartItem[] = cart.items || [];
  const closeCart = cart.closeCart || (() => {});

  const subtotal = items.reduce(
    (sum: number, item: CartItem) => sum + Number(item.price) * (item.quantity || 1),
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Dark Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* 1. Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#16a34a]" />
              <h2 className="text-base sm:text-lg font-black text-[#0f172a]">
                Your Shopping Cart
              </h2>
              <span className="text-xs font-bold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded-md border border-[#bbf7d0]">
                {items.length} items
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#f0fdf4] flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-[#16a34a]" />
                </div>
                <p className="text-sm font-black text-[#0f172a]">Your cart is empty</p>
                <p className="text-xs text-[#64748b]">Add viral gadgets to start saving!</p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-2 text-xs font-black text-white bg-[#065f46] px-5 py-2.5 rounded-xl hover:bg-[#044e39] transition cursor-pointer"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              items.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 rounded-2xl bg-gray-50 border border-gray-200"
                >
                  <div className="relative w-20 h-20 bg-white rounded-xl border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.title}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-black text-[#0f172a] line-clamp-1">
                        {item.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => cart.removeItem && cart.removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm font-black text-[#065f46]">
                      ₹{item.price}
                    </p>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            cart.updateQuantity
                              ? cart.updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))
                              : null
                          }
                          className="px-2 py-0.5 text-xs font-black text-[#0f172a] hover:bg-gray-100 rounded-l-lg cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-black text-[#0f172a]">
                          {item.quantity || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            cart.updateQuantity
                              ? cart.updateQuantity(item.id, (item.quantity || 1) + 1)
                              : null
                          }
                          className="px-2 py-0.5 text-xs font-black text-[#0f172a] hover:bg-gray-100 rounded-r-lg cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 3. Footer / Checkout Actions */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-white border-t border-gray-200 space-y-4">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#065f46] text-xs font-bold">
                <Zap className="w-3.5 h-3.5 fill-[#16a34a] text-[#16a34a]" />
                <span>Flat ₹50 Instant Off with Prepaid Checkout</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-[#0f172a]">Subtotal:</span>
                <span className="text-xl font-black text-[#065f46]">₹{subtotal}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  closeCart();
                  router.push("/checkout");
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#065f46] hover:bg-[#044e39] text-white font-black py-3.5 rounded-2xl transition shadow-lg shadow-emerald-950/20 active:scale-95 cursor-pointer"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[11px] font-bold text-[#64748b] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16a34a]" /> 100% Safe &amp; Verified Delivery
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
