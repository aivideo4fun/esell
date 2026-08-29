"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { ShieldCheck, Truck, RotateCcw, Headphones, MessageSquare, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const { openCart } = useCart();

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      
      {/* Top Trust Strip */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-950">100% Prepaid Safe</p>
              <p className="text-[11px] text-gray-500">Secure &amp; encrypted</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-950">Free Shipping</p>
              <p className="text-[11px] text-gray-500">Pan-India delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-950">5-Day Replacement</p>
              <p className="text-[11px] text-gray-500">Zero-risk guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-950">Direct WhatsApp</p>
              <p className="text-[11px] text-gray-500">Real-time assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-black text-gray-950 tracking-tight">
              Catch<span className="text-blue-600">Buddy</span>
            </Link>
            <p className="text-xs text-gray-600 max-w-sm leading-relaxed">
              India&apos;s direct shopping store for verified smart gadgets, toys, home essentials &amp; car gear. Quality checked before every dispatch.
            </p>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition"
            >
              <MessageSquare className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>

          {/* Shop Collections */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-950 mb-3">Shop Collections</h4>
            <ul className="space-y-2 text-xs text-gray-600 font-medium">
              <li><Link href="/shop" className="hover:text-blue-600 transition">All Products</Link></li>
              <li><Link href="/shop?category=toys" className="hover:text-blue-600 transition">🧸 Toys &amp; Games</Link></li>
              <li><Link href="/shop?category=gadgets" className="hover:text-blue-600 transition">🔌 Smart Gadgets</Link></li>
              <li><Link href="/shop?category=kitchen" className="hover:text-blue-600 transition">🍳 Kitchen Essentials</Link></li>
              <li><Link href="/shop?category=car-accessories" className="hover:text-blue-600 transition">🚗 Car Accessories</Link></li>
            </ul>
          </div>

          {/* Customer Desk */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-950 mb-3">Customer Desk</h4>
            <ul className="space-y-2 text-xs text-gray-600 font-medium">
              <li>
                <button
                  type="button"
                  onClick={openCart}
                  className="hover:text-blue-600 transition text-left cursor-pointer"
                >
                  My Cart
                </button>
              </li>
              <li><Link href="/track-order" className="hover:text-blue-600 transition">Track Your Order</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-blue-600 transition">Shipping &amp; Delivery</Link></li>
              <li><Link href="/return-policy" className="hover:text-blue-600 transition">Return &amp; Refund Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600 transition">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-950 mb-3">CatchBuddy Promise</h4>
            <ul className="space-y-2.5 text-xs text-gray-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>100% Genuine Inspected Goods</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>Direct Hub Express Shipping</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>Verified GST Invoicing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>Zero-Cost Prepaid Warranty</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 CatchBuddy Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/shipping-policy" className="hover:text-gray-900 transition">Shipping</Link>
            <span>•</span>
            <Link href="/return-policy" className="hover:text-gray-900 transition">Return &amp; Refund</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gray-900 transition">Terms</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-gray-900 transition">Support</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
