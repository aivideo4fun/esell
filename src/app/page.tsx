"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
  Check,
  Flame,
  MessageCircle,
  User,
  ArrowRight,
  X,
  Navigation,
  Loader2,
} from "lucide-react";

interface CategoryItem {
  id?: string;
  name: string;
  slug?: string;
  icon?: string | null;
}

interface ProductItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  mrp: number;
  discount: string;
  rating: number;
  reviews: string;
  image: string;
}

interface CouponItem {
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
}

export default function HomePage() {
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 36, seconds: 45 });

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<CouponItem | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

  // Location States
  const [pincode, setPincode] = useState("341512");
  const [city, setCity] = useState("Nagaur");
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [tempPincode, setTempPincode] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Customer Authentication State
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);

  const syncCustomerAuth = () => {
    try {
      const stored = localStorage.getItem("cb_customer") || localStorage.getItem("cb_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  const syncCartCount = () => {
    try {
      const savedCart = localStorage.getItem("cb_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          const count = parsed.reduce(
            (sum: number, item: { quantity?: number }) => sum + (item.quantity || 1),
            0
          );
          setCartCount(count);
          return;
        }
      }
      setCartCount(0);
    } catch {
      setCartCount(0);
    }
  };

  const resolveCityFromPincode = async (code: string) => {
    try {
      const res = await fetch(`/api/pincode?code=${code}`);
      const data = await res.json();
      if (data.success && data.city) {
        setCity(data.city);
        localStorage.setItem("cb_city", data.city);
        localStorage.setItem("cb_pincode", code);
      }
    } catch {}
  };

  useEffect(() => {
    syncCartCount();
    syncCustomerAuth();

    const savedPin = localStorage.getItem("cb_pincode") || "341512";
    setPincode(savedPin);
    const savedCity = localStorage.getItem("cb_city");
    if (savedCity) {
      setCity(savedCity);
    } else {
      resolveCityFromPincode(savedPin);
    }

    async function loadStoreData() {
      try {
        const res = await fetch("/api/storefront/home");
        const data = await res.json();
        if (data.success) {
          if (data.categories?.length > 0) {
            setCategories(data.categories);
          }
          if (data.products?.length > 0) {
            const mappedProducts = data.products.map((p: any) => ({
              id: p.id,
              slug: p.slug || p.id,
              title: p.title || p.name || "Product",
              price: p.price || 0,
              mrp: p.mrp || Math.round((p.price || 100) * 1.3),
              discount: p.discount || "SPECIAL",
              rating: p.rating || 4.5,
              reviews: p.reviews || "100+",
              image: p.image || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",
            }));
            setProducts(mappedProducts);
          }
          if (data.coupon) {
            setActiveCoupon(data.coupon);
          }
        }
      } catch (err) {
        console.error("Using fallback data", err);
      }
    }
    loadStoreData();

    window.addEventListener("storage", syncCartCount);
    window.addEventListener("storage", syncCustomerAuth);
    window.addEventListener("customer-auth-changed", syncCustomerAuth);

    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("storage", syncCustomerAuth);
      window.removeEventListener("customer-auth-changed", syncCustomerAuth);
    };
  }, []);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickAdd = (product: ProductItem) => {
    try {
      const existing = localStorage.getItem("cb_cart");
      let cart = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(cart)) cart = [];

      const index = cart.findIndex((i: { productId: string }) => i.productId === product.id);

      if (index > -1) {
        cart[index].quantity += 1;
      } else {
        cart.push({
          productId: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          originalPrice: product.mrp,
          image: product.image,
          quantity: 1,
          selectedSize: null,
          selectedColor: null,
        });
      }

      localStorage.setItem("cb_cart", JSON.stringify(cart));
      syncCartCount();

      setAddedItemIds((prev) => [...prev, product.id]);
      setTimeout(() => {
        setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
      }, 1500);
    } catch (e) {
      console.error("Error adding to cart", e);
    }
  };

  const handleSavePincode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = tempPincode.replace(/\D/g, "").slice(0, 6);
    if (cleanPin.length !== 6) {
      setLocationError("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      const res = await fetch(`/api/pincode?code=${cleanPin}`);
      const data = await res.json();
      if (data.success && data.city) {
        setPincode(cleanPin);
        setCity(data.city);
        localStorage.setItem("cb_pincode", cleanPin);
        localStorage.setItem("cb_city", data.city);
        setIsPincodeModalOpen(false);
        setTempPincode("");
        setLocationError("");
      } else {
        setLocationError("Pincode not found. Please check.");
      }
    } catch {
      setLocationError("Failed to verify pincode.");
    }
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`/api/location/gps?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();

          if (data.success && data.pincode) {
            setPincode(data.pincode);
            setCity(data.city);
            localStorage.setItem("cb_pincode", data.pincode);
            localStorage.setItem("cb_city", data.city);
            setIsPincodeModalOpen(false);
            setLocationError("");
          } else {
            setLocationError("Could not detect pincode from GPS. Please type it manually.");
          }
        } catch {
          setLocationError("Failed to fetch GPS location.");
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission denied. Please allow GPS in browser settings.");
        } else {
          setLocationError("GPS location request timed out.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 md:pb-0 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 sm:px-8 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 group-hover:border-emerald-300 transition">
                <Image
                  src="/logo.png"
                  alt="CatchBuddy Icon"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 flex items-center">
                Catch<span className="text-emerald-600">Buddy</span>
              </span>
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg mx-8 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gadgets, home utilities, electronics..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold focus:outline-emerald-600"
            />
            <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/orders" className="hidden md:inline-flex text-xs font-bold text-slate-700 hover:text-emerald-600">
              My Orders
            </Link>
            
            <Link
              href={currentUser ? "/account" : "/login"}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-600"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>{currentUser ? currentUser.name?.split(" ")[0] || "Account" : "Account"}</span>
            </Link>

            <Link href="/cart" className="relative p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="md:hidden mt-2 relative">
          <input
            id="mobile-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gadgets, home utilities..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-600"
          />
          <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </header>

      {/* Delivery Ribbon */}
      <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              setLocationError("");
              setIsPincodeModalOpen(true);
            }}
            className="flex items-center gap-2 text-left group hover:opacity-85 transition cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 self-start mt-0.5" />
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-600 font-medium">Delivering to:</span>
                <span className="text-xs font-black text-slate-950 font-mono tracking-tight underline decoration-dotted">
                  {pincode}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 line-clamp-1">
                {city}
              </span>
            </div>
          </button>
          <span className="text-[10px] font-black text-emerald-700 hidden sm:flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Free Express Delivery
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6 sm:space-y-8 mt-4">
      
        {/* 1. Hero Banner Section with 3 Points */}
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

              {/* 3 Checkmark Points Added Here */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-xs font-bold text-slate-200">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct Supplier Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Safe Prepaid Checkout</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Fast Delivery Pan India</span>
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

        {/* 2. Value Badges */}
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

        {/* 3. Top Categories */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-slate-950">Top Categories</h2>
            <Link href="/shop" className="text-xs font-bold text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          {categories.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-200">
              No main categories available from database.
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 text-center">
              {categories.map((cat, idx) => (
                <Link
                  key={cat.id || idx}
                  href={`/shop?category=${encodeURIComponent(cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"))}`}
                  className="flex flex-col items-center gap-1.5 group p-2.5 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-emerald-300 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    {cat.icon || "📦"}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 line-clamp-1 group-hover:text-emerald-700">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 4. Deal of the Day (Moved Up) */}
        <section>
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm font-black text-emerald-900">
                <Flame className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span>DEAL OF THE DAY</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-black">
                <span className="bg-slate-900 text-white px-2 py-1 rounded-md">{String(timeLeft.hours).padStart(2, "0")}h</span>
                <span>:</span>
                <span className="bg-slate-900 text-white px-2 py-1 rounded-md">{String(timeLeft.minutes).padStart(2, "0")}m</span>
                <span>:</span>
                <span className="bg-slate-900 text-white px-2 py-1 rounded-md">{String(timeLeft.seconds).padStart(2, "0")}s</span>
              </div>
            </div>

            {products[0] && (
              <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-4 border border-slate-200 items-center">
                <img
                  src={products[0].image}
                  alt={products[0].title}
                  className="w-32 h-32 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between w-full">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 line-clamp-2">{products[0].title}</h3>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="text-lg font-black text-emerald-700">₹{products[0].price}</span>
                      <span className="text-xs line-through text-slate-400 ml-1">₹{products[0].mrp}</span>
                    </div>
                    <Link
                      href={`/product/${products[0].slug || products[0].id}`}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 5. Best Selling Products (Moved Up) */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-slate-950">Best Selling Products</h2>
            <Link href="/shop" className="text-xs font-bold text-emerald-600 hover:underline">
              View all
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-xs text-slate-400 border border-slate-200">
              No products found from database. Please add products via Admin Panel.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {products.map((item) => {
                const isAdded = addedItemIds.includes(item.id);
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
                    <div>
                      <Link href={`/product/${item.slug || item.id}`} className="block aspect-square bg-slate-50 rounded-xl overflow-hidden mb-2 relative">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                          {item.discount}
                        </span>
                      </Link>
                      <Link href={`/product/${item.slug || item.id}`}>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">{item.title}</h3>
                      </Link>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs sm:text-sm font-black text-slate-950">₹{item.price}</div>
                        <div className="text-[10px] text-slate-400 line-through">₹{item.mrp}</div>
                      </div>
                      <button
                        onClick={() => handleQuickAdd(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition ${
                          isAdded ? "bg-emerald-600 text-white" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        {isAdded ? "Added" : "Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 6. Benefits & Dynamic Admin Coupon Banner (Moved Down) */}
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
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 mt-1">SPECIAL OFFER</h4>
              <h3 className="text-base font-black text-slate-950 mt-0.5">
                {activeCoupon ? (activeCoupon.discountType === "PERCENTAGE" ? `${activeCoupon.discountValue}% OFF` : activeCoupon.discountType === "FLAT" ? `Flat ₹${activeCoupon.discountValue} OFF` : "Free Shipping Offer") : "Get Flat 10% Off"}
              </h3>
              <p className="text-xs text-slate-600 font-medium">{activeCoupon?.description || "On Your Next Order"}</p>
              <div className="mt-2.5 inline-block px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-black font-mono text-rose-700">
                Use Code: {activeCoupon?.code || "CATCH10"}
              </div>
            </div>
            <div className="text-5xl">🎁</div>
          </div>
        </section>

        {/* 7. WhatsApp Support */}
        <section>
          <a
            href="https://wa.me/917976152206?text=Hi%20CatchBuddy%2C%20I%20need%20help%20with%20my%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold text-xs hover:bg-emerald-100 transition"
          >
            <MessageCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-black">Need Help? Chat with us on WhatsApp</div>
              <div className="text-xs text-emerald-700 font-medium">+91 7976152206</div>
            </div>
          </a>
        </section>
      </main>

      {/* Pincode Modal */}
      {isPincodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-950">Choose Delivery Location</h3>
              <button onClick={() => setIsPincodeModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition"
            >
              {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              Use Current Location (GPS)
            </button>
            <form onSubmit={handleSavePincode} className="space-y-2.5">
              <input
                type="text"
                maxLength={6}
                value={tempPincode}
                onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit Pincode"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
              />
              <button type="submit" disabled={tempPincode.length !== 6} className="w-full py-2.5 bg-slate-950 text-white rounded-xl text-xs font-black">
                Apply Pincode
              </button>
            </form>
            {locationError && <p className="text-[11px] font-bold text-rose-600">{locationError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}