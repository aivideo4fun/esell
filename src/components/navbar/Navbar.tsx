"use client";

import Link from "next/link";
import { ShoppingBag, Search, ShieldCheck, User, Truck } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function Navbar() {
  const cart = useCart() as any;
  const items = cart.items || [];
  const cartCount = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);

  const handleCartClick = () => {
    if (typeof cart.openCart === "function") {
      cart.openCart();
    } else if (typeof cart.toggleCart === "function") {
      cart.toggleCart();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      {/* Top Notification Announcement Bar */}
      <div className="bg-black text-white text-[11px] font-bold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Truck className="w-3.5 h-3.5 text-blue-400" />
        <span>Prepaid UPI Orders: Flat ₹50 Instant Discount + Express Delivery Across India</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-black">
            Catch<span className="text-blue-600">Buddy</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search trending gadgets, smart home tools..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-black placeholder:text-gray-400 focus:outline-none focus:border-blue-600"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/shop"
            className="text-xs font-bold text-gray-700 hover:text-black transition"
          >
            Catalog
          </Link>
          <Link
            href="/track-order"
            className="text-xs font-bold text-gray-700 hover:text-black transition flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Track Order
          </Link>
          <Link
            href="/admin/login"
            className="text-xs font-bold text-gray-700 hover:text-black transition flex items-center gap-1"
          >
            <User className="w-3.5 h-3.5" /> Admin
          </Link>

          {/* Cart Icon Drawer Trigger */}
          <button
            onClick={handleCartClick}
            className="relative p-2 text-black hover:text-blue-600 transition cursor-pointer"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}