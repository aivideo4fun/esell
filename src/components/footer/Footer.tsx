"use client";

import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Headphones, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 text-[#0f172a] pt-12 pb-8">
      {/* 4 Trust Feature Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0]">
            <ShieldCheck className="w-6 h-6 text-[#16a34a] shrink-0" />
            <div>
              <h4 className="text-xs font-black text-[#0f172a]">100% Prepaid Safe</h4>
              <p className="text-[11px] text-[#64748b] font-medium">Secure &amp; encrypted</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0]">
            <Truck className="w-6 h-6 text-[#16a34a] shrink-0" />
            <div>
              <h4 className="text-xs font-black text-[#0f172a]">Free Shipping</h4>
              <p className="text-[11px] text-[#64748b] font-medium">Pan-India delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0]">
            <RotateCcw className="w-6 h-6 text-[#16a34a] shrink-0" />
            <div>
              <h4 className="text-xs font-black text-[#0f172a]">5-Day Replacement</h4>
              <p className="text-[11px] text-[#64748b] font-medium">Zero-risk guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0]">
            <Headphones className="w-6 h-6 text-[#16a34a] shrink-0" />
            <div>
              <h4 className="text-xs font-black text-[#0f172a]">Direct Support</h4>
              <p className="text-[11px] text-[#64748b] font-medium">WhatsApp assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Brand Column */}
        <div className="md:col-span-4 space-y-4">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-black tracking-tight text-[#0f172a]">
              Catch<span className="text-[#16a34a]">Buddy</span>
            </span>
          </Link>
          <p className="text-xs text-[#64748b] leading-relaxed font-medium">
            India&apos;s direct shopping store for verified smart gadgets, kitchen tools, toys, and lifestyle utilities. Quality checked before every dispatch.
          </p>
          <a
            href="https://wa.me/916350108713"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#065f46] text-white text-xs font-black px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
          </a>
        </div>

        {/* Links Column 1 */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#0f172a]">Shop Collections</h4>
          <ul className="space-y-2 text-xs font-bold text-[#64748b]">
            <li><Link href="/shop" className="hover:text-[#16a34a] transition">All Products</Link></li>
            <li><Link href="/shop?category=smart-gadgets" className="hover:text-[#16a34a] transition">⚡ Smart Gadgets</Link></li>
            <li><Link href="/shop?category=kitchen" className="hover:text-[#16a34a] transition">🍳 Kitchen Essentials</Link></li>
            <li><Link href="/shop?category=toys" className="hover:text-[#16a34a] transition">🧸 Toys &amp; Games</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#0f172a]">Customer Desk</h4>
          <ul className="space-y-2 text-xs font-bold text-[#64748b]">
            <li><Link href="/track-order" className="hover:text-[#16a34a] transition">Track Your Order</Link></li>
            <li><Link href="/shipping" className="hover:text-[#16a34a] transition">Shipping &amp; Delivery</Link></li>
            <li><Link href="/return-policy" className="hover:text-[#16a34a] transition">Return Policy</Link></li>
            <li><Link href="/contact" className="hover:text-[#16a34a] transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* Trust Badges Column */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#0f172a]">CatchBuddy Assurance</h4>
          <ul className="space-y-2 text-xs font-semibold text-[#065f46]">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> 100% Verified Quality Checked
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> Instant ₹50 Prepaid UPI Off
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> Safe Express Pan-India Courier
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#64748b] font-semibold gap-2">
        <p>&copy; {new Date().getFullYear()} CatchBuddy.in. All rights reserved.</p>
        <p>Direct Verified Dispatch &bull; Made for India</p>
      </div>
    </footer>
  );
}