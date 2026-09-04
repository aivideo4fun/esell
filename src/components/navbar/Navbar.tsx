"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  Search, 
  ShieldCheck, 
  User, 
  LogOut, 
  Heart,
  Package,
  Truck,
  MapPin,
  TicketPercent,
  Bell,
  HelpCircle,
  Phone
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

interface CustomerUser {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
}

export default function Navbar() {
  const cart = useCart();
  const { wishlist } = useWishlist();

  const items = cart.items || [];
  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const wishlistCount = wishlist.length;

  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync customer details from localStorage or API
  useEffect(() => {
    const syncCustomer = () => {
      const stored = localStorage.getItem("cb_customer");
      if (stored) {
        try {
          setCustomer(JSON.parse(stored));
        } catch {
          setCustomer(null);
        }
      } else {
        // Fallback check cookie / backend session
        fetch("/api/auth/customer")
          .then((res) => res.json())
          .then((data) => {
            if (data.authenticated && data.user) {
              setCustomer(data.user);
            } else {
              setCustomer(null);
            }
          })
          .catch(() => setCustomer(null));
      }
    };

    syncCustomer();
    window.addEventListener("customer-auth-changed", syncCustomer);
    return () => window.removeEventListener("customer-auth-changed", syncCustomer);
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCartClick = () => {
    if (cart.openCart) {
      cart.openCart();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cb_customer");
    document.cookie = "customer_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setCustomer(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event("customer-auth-changed"));
    window.location.reload();
  };

  const tickerItems = [
    "ON SALE NOW",
    "PREPAID ₹50 INSTANT OFF",
    "FREE SHIPPING",
    "LIMITED TIME DEALS",
    "DIRECT DISPATCH",
  ];

  const customerMenuItems = [
    { label: "My Profile", href: "/account", icon: User },
    { label: "My Orders", href: "/orders", icon: Package },
    { label: "Track Order", href: "/orders/track", icon: Truck },
    { label: "Wishlist", href: "/wishlist", icon: Heart, badge: wishlistCount },
    { label: "Saved Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Coupons", href: "/account/coupons", icon: TicketPercent },
    { label: "Notifications", href: "/account/notifications", icon: Bell },
    { label: "Help & Support", href: "/contact", icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      {/* 1. TOP MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="text-2xl font-black tracking-tight text-[#0f172a]">
            Catch<span className="text-[#16a34a]">Buddy</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search trending gadgets, smart home tools..."
              className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-semibold text-[#0f172a] placeholder:text-[#64748b] focus:outline-none focus:border-[#16a34a]"
            />
            <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/shop"
            className="text-xs font-bold text-[#64748b] hover:text-[#065f46] transition hidden sm:inline"
          >
            Catalog
          </Link>
          <Link
            href="/orders/track"
            className="text-xs font-bold text-[#64748b] hover:text-[#065f46] transition hidden sm:flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-[#16a34a]" /> Track Order
          </Link>

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className="relative p-2 text-gray-700 hover:text-red-500 transition cursor-pointer"
            title="My Wishlist"
          >
            <Heart className="w-5 h-5 text-gray-800 hover:text-red-500" />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* User Account / Login Button */}
          {customer ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-left bg-[#f0fdf4] border border-[#bbf7d0] hover:bg-[#dcfce7] px-3 py-1.5 rounded-2xl transition cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-xs font-black shrink-0">
                  {customer.name ? customer.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-black text-[#0f172a] max-w-[120px] truncate">
                    {customer.name || "Customer"}
                  </span>
                  <span className="text-[10px] font-bold text-[#16a34a] max-w-[120px] truncate">
                    {customer.phone || customer.email || "Verified"}
                  </span>
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Account Header */}
                  <div className="p-3 border-b border-gray-100 bg-emerald-50/50 rounded-xl mb-1">
                    <p className="font-black text-[#0f172a] truncate">{customer.name || "Customer"}</p>
                    <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-600" /> {customer.phone || "No phone added"}
                    </p>
                  </div>

                  {/* Customer Portal Items */}
                  <div className="py-1 space-y-0.5">
                    {customerMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-[#f0fdf4] hover:text-[#065f46] rounded-xl font-bold transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-3.5 h-3.5 text-slate-500" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && item.badge > 0 ? (
                            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl text-left cursor-pointer transition"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold text-[#065f46] bg-[#f0fdf4] border border-[#bbf7d0] hover:bg-[#dcfce7] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition"
            >
              <User className="w-4 h-4 text-[#16a34a]" /> Login
            </Link>
          )}

          {/* Shopping Cart Button */}
          <button
            type="button"
            onClick={handleCartClick}
            className="relative p-2 text-gray-800 hover:text-[#16a34a] transition cursor-pointer"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-6 h-6 text-[#065f46]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#16a34a] text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. GREEN PROMO STRIP */}
      <div className="bg-[#16a34a] text-white text-[11px] font-black uppercase tracking-widest py-1 text-center select-none">
        LIMITED TIME: SAVE UP TO 30%
      </div>

      {/* 3. SCROLLING TICKER */}
      <div className="bg-[#0f172a] text-white py-2.5 overflow-hidden flex items-center relative select-none">
        <div className="ticker-track flex items-center gap-16 whitespace-nowrap text-xs font-black tracking-widest uppercase">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
            <div key={idx} className="flex items-center gap-16">
              <span>{item}</span>
              <span className="text-[#22c55e] text-base font-light select-none">+</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. WAVY BOTTOM CURVE */}
      <div className="relative w-full h-3 sm:h-4 bg-transparent -mt-px overflow-hidden pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full text-[#64748b] opacity-30"
          viewBox="0 0 1440 30"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,0 L1440,0 L1440,12 C1200,30 900,2 600,24 C300,34 100,6 0,20 Z" />
        </svg>

        <svg
          className="absolute inset-0 w-full h-full text-[#0f172a]"
          viewBox="0 0 1440 30"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,0 L1440,0 L1440,8 C1100,26 850,0 500,18 C250,28 80,5 0,14 Z" />
        </svg>
      </div>
    </header>
  );
}
