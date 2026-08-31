"use client";

import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Headphones, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20 text-[#0f172a]">
      
      {/* Top Value Propositions */}
      <div className="border-b border-gray-100 bg-[#f0fdf4]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-950">100% Prepaid Safe</p>
              <p className="text-[11px] text-gray-500 font-medium">Secure &amp; encrypted</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-950">Free Express Shipping</p>
              <p className="text-[11px] text-gray-500 font-medium">Pan-India delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] rounded-xl">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-950">5-Day Replacement</p>
              <p className="text-[11px] text-gray-500 font-medium">Zero-risk guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] rounded-xl">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-950">Direct Support</p>
              <p className="text-[11px] text-gray-500 font-medium">WhatsApp assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="text-2xl font-black text-gray-950 tracking-tight inline-block">
              Catch<span className="text-[#16a34a]">Buddy</span>
            </Link>
            <p className="text-xs text-gray-600 max-w-sm leading-relaxed font-medium">
              India&apos;s direct shopping store for verified smart gadgets, kitchen tools, toys, and lifestyle utilities. Quality checked before every dispatch.
            </p>
            <a
              href="https://wa.me/916350108713"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#16a34a] hover:bg-[#065f46] text-white rounded-xl text-xs font-black transition shadow-sm"
            >
              <MessageSquare className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>

          {/* Shop Collections */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-950">Shop Collections</h4>
            <ul className="space-y-2 text-xs text-gray-600 font-semibold">
              <li><Link href="/shop" className="hover:text-[#16a34a] transition">All Products</Link></li>
              <li><Link href="/shop?category=smart-gadgets" className="hover:text-[#16a34a] transition">🔌 Smart Gadgets</Link></li>
              <li><Link href="/shop?category=kitchen" className="hover:text-[#16a34a] transition">🍳 Kitchen Essentials</Link></li>
              <li><Link href="/shop?category=toys" className="hover:text-[#16a34a] transition">🧸 Toys &amp; Games</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-950">Customer Desk</h4>
            <ul className="space-y-2 text-xs text-gray-600 font-semibold">
              <li><Link href="/track-order" className="hover:text-[#16a34a] transition">Track Your Order</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-[#16a34a] transition">Shipping &amp; Delivery</Link></li>
              <li><Link href="/return-policy" className="hover:text-[#16a34a] transition">Return Policy</Link></li>
              <li><Link href="/contact" className="hover:text-[#16a34a] transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* CatchBuddy Assurance */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-950">CatchBuddy Assurance</h4>
            <ul className="space-y-2 text-xs font-semibold text-[#065f46]">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> 100% Quality Checked Items
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> Instant ₹50 Prepaid UPI Off
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> Fast Tracked Pan-India Delivery
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500 font-semibold">
          <p>© 2026 CatchBuddy Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/shipping-policy" className="hover:text-[#16a34a] transition">Shipping</Link>
            <span>•</span>
            <Link href="/return-policy" className="hover:text-[#16a34a] transition">Replacement</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[#16a34a] transition">Support</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}