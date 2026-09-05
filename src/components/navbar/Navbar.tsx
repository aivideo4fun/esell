/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Phone,
  Loader2,
  X
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

interface CustomerUser {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
}

interface SearchProduct {
  id: string;
  title: string;
  slug?: string;
  price: number;
  image?: string;
  images?: string[];
}

export default function Navbar() {
  const router = useRouter();
  const cart = useCart();
  const { wishlist } = useWishlist();

  const items = cart.items || [];
  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const wishlistCount = wishlist.length;

  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live Instant Search with Debounce
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setSearchLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        const productList = data.products || (Array.isArray(data) ? data : []);
        setSearchResults(productList.slice(0, 5));
        setShowSearchDropdown(true);
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Handle Form Submit on Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearchDropdown(false);
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync customer details
  useEffect(() => {
    const syncCustomer = () => {
      const stored = localStorage.getItem("cb_customer");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCustomer(parsed);
        } catch {
          setCustomer(null);
        }
      } else {
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
    { label: "My Orders", href: "/account", icon: Package },
    { label: "Track Order", href: "/account", icon: Truck },
    { label: "Wishlist", href: "/wishlist", icon: Heart, badge: wishlistCount },
    { label: "Saved Addresses", href: "/account", icon: MapPin },
    { label: "Coupons", href: "/account", icon: TicketPercent },
    { label: "Notifications", href: "/account", icon: Bell },
    { label: "Help & Support", href: "/account", icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      {/* 1. TOP MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo with Icon + Bold Text */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 group-hover:border-emerald-400 transition">
            <Image
              src="/logo.png"
              alt="CatchBuddy Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a]">
            Catch<span className="text-[#16a34a]">Buddy</span>
          </span>
        </Link>

        {/* Search Bar with Live Suggestions Dropdown */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true);
              }}
              placeholder="Search gadgets, home utilities, electronics..."
              className="w-full pl-10 pr-10 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-semibold text-[#0f172a] placeholder:text-[#64748b] focus:outline-none focus:border-[#16a34a] focus:bg-white transition"
            />
            <button
              type="submit"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#16a34a] transition cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowSearchDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Instant Search Results Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
              {searchLoading ? (
                <div className="p-4 flex items-center justify-center gap-2 text-slate-500 font-bold">
                  <Loader2 className="w-4 h-4 animate-spin text-[#16a34a]" /> Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  <div className="px-3 py-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                    Products ({searchResults.length})
                  </div>
                  {searchResults.map((prod) => {
                    const prodImage = prod.image || (prod.images && prod.images[0]) || "/placeholder.png";
                    return (
                      <Link
                        key={prod.id}
                        href={`/products/${prod.slug || prod.id}`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-[#f0fdf4] transition"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          <img src={prodImage} alt={prod.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[#0f172a] truncate">{prod.title}</p>
                          <p className="text-[11px] font-black text-[#16a34a]">₹{prod.price}</p>
                        </div>
                      </Link>
                    );
                  })}
                  <div className="border-t border-gray-100 p-2 text-center bg-slate-50">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs font-black text-[#16a34a] hover:underline cursor-pointer"
                    >
                      View all results for &quot;{searchQuery}&quot; →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 font-bold">
                  No products found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
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
            href="/account"
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
                className="flex items-center gap-2 text-left bg-[#f0fdf4] border border-[#bbf7d0] hover:bg-[#dcfce7] px-3.5 py-2 rounded-2xl transition cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-xs font-black shrink-0">
                  {(customer.name || customer.email || "U").charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-black text-[#0f172a] max-w-[130px] truncate">
                  {customer.name || customer.email?.split("@")[0] || "Customer"}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 border-b border-gray-100 bg-emerald-50/50 rounded-xl mb-1">
                    <p className="font-black text-[#0f172a] truncate">
                      {customer.name || customer.email?.split("@")[0] || "Customer"}
                    </p>
                    {customer.phone && (
                      <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-600" /> {customer.phone}
                      </p>
                    )}
                  </div>

                  <div className="py-1 space-y-0.5">
                    {customerMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
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