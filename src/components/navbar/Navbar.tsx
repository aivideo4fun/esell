"use client";

import Link from "next/link";
import { Search, User, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function Navbar() {
  const { toggleCart, items } = useCart();
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-black text-gray-950 tracking-tight">
            Catch<span className="text-blue-600">Buddy</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
            <Link href="/shop" className="hover:text-blue-600 transition">Shop</Link>
            <Link href="/categories" className="hover:text-blue-600 transition">Categories</Link>
            <Link href="/track-order" className="hover:text-blue-600 transition">Track Order</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-5 text-gray-700">
            <Link href="/shop" className="hover:text-blue-600 transition cursor-pointer">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/admin/orders" className="hover:text-blue-600 transition cursor-pointer">
              <User className="w-5 h-5" />
            </Link>
            
            {/* Active Cart Button */}
            <button onClick={toggleCart} className="relative hover:text-blue-600 transition cursor-pointer">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}