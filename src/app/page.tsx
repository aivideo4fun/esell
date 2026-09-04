"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  ShoppingBag,
  MapPin,
  ChevronDown,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Star,
  Plus,
  Flame,
  MessageCircle,
  Home,
  LayoutGrid,
  Package,
  User,
  ArrowRight,
} from "lucide-react";

// Fallback Categories
const DEFAULT_CATEGORIES = [
  { name: "Gadgets", icon: "🎧" },
  { name: "Home", icon: "🏠" },
  { name: "Kitchen", icon: "🍳" },
  { name: "Car Access.", icon: "🚗" },
  { name: "Beauty", icon: "💄" },
  { name: "Toys", icon: "🧸" },
  { name: "Smart Home", icon: "💡" },
  { name: "More", icon: "•••" },
];

// Fallback Best Sellers
const DEFAULT_PRODUCTS = [
  {
    id: "m10-earbuds",
    slug: "m10-earbuds",
    title: "M10 Wireless Earbuds Bluetooth 5.3",
    price: 699,
    mrp: 1499,
    discount: "53% OFF",
    rating: 4.4,
    reviews: "1.2k",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",
  },
  {
    id: "portable-blender",
    slug: "portable-blender",
    title: "Mini Portable Blender USB Rechargeable",
    price: 599,
    mrp: 1299,
    discount: "54% OFF",
    rating: 4.3,
    reviews: "862",
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&q=80",
  },
  {
    id: "rgb-led-strip",
    slug: "rgb-led-strip",
    title: "Smart LED Strip Light USB Powered",
    price: 299,
    mrp: 699,
    discount: "57% OFF",
    rating: 4.5,
    reviews: "796",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80",
  },
  {
    id: "car-vacuum",
    slug: "car-vacuum",
    title: "Car Vacuum Cleaner High Power",
    price: 899,
    mrp: 1999,
    discount: "55% OFF",
    rating: 4.4,
    reviews: "624",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&q=80",
  },
];

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 36, seconds: 45 });
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [cartCount, setCartCount] = useState(1);

  // Live Database Fetch with Zero Break Risk
  useEffect(() => {
    async function loadStoreData() {
      try {
        const res = await fetch("/api/storefront/home");
        const data = await res.json();
        if (data.success) {
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
          }
          if (data.products && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.error("Using fallback local data", err);
      }
    }
    loadStoreData();

    // Local cart count sync
    try {
      const savedCart = localStorage.getItem("cb_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCartCount(parsed.length);
      }
    } catch {}
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-12 text-slate-900 font-sans">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1 hover:bg-slate-100 rounded-lg text-slate-700">
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
              Catch<span className="text-emerald-600">Buddy</span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
            <input
              type="text"
              placeholder="Search gadgets, home utilities, electronics..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold focus:outline-emerald-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Desktop Right Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/orders" className="hidden md:inline-flex text-xs font-bold text-slate-700 hover:text-emerald-600">
              My Orders
            </Link>
            <Link href="/login" className="hidden md:inline-flex text-xs font-bold text-slate-700 hover:text-emerald-600">
              Account
            </Link>
            <button className="md:hidden p-1 text-slate-700 hover:bg-slate-100 rounded-lg">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/cart" className="relative p-1 text-slate-700 hover:bg-slate-100 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* 2. PINCODE DELIVERY STRIP */}
      <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Delivering to: <strong className="text-slate-950">302020</strong></span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6 sm:space-y-8 mt-4">
        {/* 3. HERO BANNER */}
        <section>
          <div className="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-block px-2.5 py-1 bg-amber-400/20 text-amber-300 rounded-md text-[10px] font-black uppercase tracking-wider mb-3">
                LIMITED TIME OFFER
              </span>
              <h1 className="text-2xl sm:text-4xl font-black leading-snug">
                Premium Gadgets, <br className="hidden sm:inline" />
                <span className="text-emerald-400">Direct to Your Doorstep.</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
                100% Verified Products • Instant Prepaid Discounts • Free Shipping
              </p>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Direct Supplier Dispatch
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Safe Prepaid Checkout
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" /> Fast Delivery Pan India
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow-sm"
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. TRUST BADGES STRIP */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-bold text-slate-700">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-center gap-2.5 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Prepaid Verified</span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-center gap-2.5 shadow-2xs">
            <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Free Shipping</span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-center gap-2.5 shadow-2xs">
            <RotateCcw className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Easy Returns</span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-center gap-2.5 shadow-2xs">
            <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Secure Pay</span>
          </div>
        </section>

        {/* 5. TOP CATEGORIES */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-slate-950">Top Categories</h2>
            <Link href="/categories" className="text-xs font-bold text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 text-center">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/shop?category=${cat.name}`}
                className="flex flex-col items-center gap-1.5 group p-2 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-emerald-300 transition"
              >
                <div className="w-12 h-12 flex items-center justify-center text-2xl">
                  {cat.icon || "📦"}
                </div>
                <span className="text-[11px] font-bold text-slate-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. DEAL OF THE DAY */}
        <section>
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm font-black text-emerald-900">
                <Flame className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span>DEAL OF THE DAY</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Limited Stock Left!
                </span>
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <span className="bg-slate-900 text-white px-2 py-1 rounded-md">{String(timeLeft.hours).padStart(2, "0")}h</span>
                  <span>:</span>
                  <span className="bg-slate-900 text-white px-2 py-1 rounded-md">{String(timeLeft.minutes).padStart(2, "0")}m</span>
                  <span>:</span>
                  <span className="bg-slate-900 text-white px-2 py-1 rounded-md">{String(timeLeft.seconds).padStart(2, "0")}s</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-4 border border-slate-200">
              <img
                src={products[0]?.image || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&q=80"}
                alt="Deal item"
                className="w-full sm:w-36 h-36 rounded-xl object-cover"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {products[0]?.title || "Special Deal Product"}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mt-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{products[0]?.rating || 4.9} ({products[0]?.reviews || 250} reviews)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="text-lg font-black text-emerald-700">₹{products[0]?.price || 299}</span>{" "}
                    <span className="text-xs line-through text-slate-400 ml-1">₹{products[0]?.mrp || 699}</span>
                    <span className="text-xs font-bold text-emerald-600 ml-2">{products[0]?.discount || "50% OFF"}</span>
                  </div>
                  <Link
                    href={`/product/${products[0]?.slug || products[0]?.id}`}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. BEST SELLING PRODUCTS (2 Cols Mobile, 4 Cols Desktop) */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-slate-950">Best Selling Products</h2>
            <Link href="/shop" className="text-xs font-bold text-emerald-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {products.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs flex flex-col justify-between hover:shadow-sm transition"
              >
                <div>
                  <Link href={`/product/${item.slug || item.id}`} className="block aspect-square bg-slate-50 rounded-xl overflow-hidden mb-2 relative">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      {item.discount}
                    </span>
                  </Link>
                  <Link href={`/product/${item.slug || item.id}`}>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug hover:text-emerald-600">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mt-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{item.rating} ({item.reviews})</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-950">₹{item.price}</div>
                    <div className="text-[10px] text-slate-400 line-through">₹{item.mrp}</div>
                  </div>
                  <Link
                    href={`/product/${item.slug || item.id}`}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. PREPAID BENEFITS & COUPONS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#064E3B] text-white rounded-3xl p-6 text-center flex flex-col justify-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-300 mb-4">
              PREPAID ORDER BENEFITS
            </h3>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-bold">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-emerald-800/80 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-emerald-300" />
                </div>
                <span>Extra 5% Off</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-emerald-800/80 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-emerald-300" />
                </div>
                <span>Faster Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-emerald-800/80 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </div>
                <span>Priority Support</span>
              </div>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <span className="text-base">🎉</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 mt-1">NEW HERE?</h4>
              <h3 className="text-base font-black text-slate-950 mt-0.5">Get Flat 10% Off</h3>
              <p className="text-xs text-slate-600 font-medium">On Your First Order</p>
              <div className="mt-2.5 inline-block px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-black font-mono text-rose-700">
                Use Code: CATCH10
              </div>
            </div>
            <div className="text-5xl">🎁</div>
          </div>
        </section>

        {/* 9. WHATSAPP REASSURANCE */}
        <section>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold text-xs hover:bg-emerald-100 transition"
          >
            <MessageCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-black">Need Help? Chat with us on WhatsApp</div>
              <div className="text-xs text-emerald-700 font-medium">Fast support for order status & inquiries</div>
            </div>
          </a>
        </section>
      </main>

      {/* 10. MOBILE BOTTOM NAVIGATION (Hidden on Desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 py-2.5 px-6 flex items-center justify-between shadow-lg">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-emerald-600">
          <Home className="w-4 h-4" />
          <span className="text-[10px] font-black">Home</span>
        </Link>
        <Link href="/categories" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900">
          <LayoutGrid className="w-4 h-4" />
          <span className="text-[10px] font-bold">Categories</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900">
          <Search className="w-4 h-4" />
          <span className="text-[10px] font-bold">Search</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900">
          <Package className="w-4 h-4" />
          <span className="text-[10px] font-bold">Orders</span>
        </Link>
        <Link href="/login" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900">
          <User className="w-4 h-4" />
          <span className="text-[10px] font-bold">Account</span>
        </Link>
      </nav>
    </div>
  );
}