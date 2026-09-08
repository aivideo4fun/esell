/* eslint-disable @next/next/no-img-element */
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
  Minus,
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
  stock?: number;
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
  const [allStoreProducts, setAllStoreProducts] = useState<ProductItem[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<CouponItem | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});

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

  const syncCartState = () => {
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
          
          const map: Record<string, number> = {};
          parsed.forEach((item: any) => {
            const pid = item.productId || item.id;
            if (pid) map[pid] = item.quantity || 1;
          });
          setCartQuantities(map);
          return;
        }
      }
      setCartCount(0);
      setCartQuantities({});
    } catch {
      setCartCount(0);
      setCartQuantities({});
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
    syncCartState();
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
              stock: p.stock ?? 10,
            }));
            setProducts(mappedProducts);
            setAllStoreProducts(mappedProducts);
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

    window.addEventListener("storage", syncCartState);
    window.addEventListener("storage", syncCustomerAuth);
    window.addEventListener("customer-auth-changed", syncCustomerAuth);

    return () => {
      window.removeEventListener("storage", syncCartState);
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

  // Filtered live search results as user types
  const liveSearchResults = searchQuery.trim() 
    ? allStoreProducts.filter((p) => p.title.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleUpdateCartQty = (product: ProductItem, delta: number) => {
    try {
      const existing = localStorage.getItem("cb_cart");
      let cart = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(cart)) cart = [];

      const index = cart.findIndex((i: { productId: string; id?: string }) => (i.productId === product.id || i.id === product.id));
      const currentQty = index > -1 ? (cart[index].quantity || 1) : 0;
      const newQty = currentQty + delta;

      if (newQty > 0) {
        const stockAvailable = typeof product.stock === "number" ? product.stock : 10;
        const maxAllowedLimit = Math.min(9, stockAvailable);

        if (newQty > maxAllowedLimit) {
          if (stockAvailable < 9) {
            alert(`Maaf kijiye, inventory mein sirf ${stockAvailable} items available hain.`);
          } else {
            alert("Aap maximum 9 quantity hi add kar sakte hain.");
          }
          return;
        }
      }

      if (index > -1) {
        cart[index].quantity = newQty;
        if (cart[index].quantity <= 0) {
          cart.splice(index, 1);
        }
      } else if (delta > 0) {
        cart.push({
          productId: product.id,
          id: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          originalPrice: product.mrp,
          image: product.image,
          quantity: 1,
          stock: product.stock,
          selectedSize: null,
          selectedColor: null,
        });
      }

      localStorage.setItem("cb_cart", JSON.stringify(cart));
      syncCartState();
    } catch (e) {
      console.error("Error updating cart", e);
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
      {/* Header with Instant Live Search Dropdown */}
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

          {/* Desktop Search Bar with Live Results Dropdown */}
          <div className="hidden md:block flex-1 max-w-lg mx-8 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search gadgets, home utilities, electronics..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold focus:outline-emerald-600"
              />
              <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Instant Dropdown Results */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                {liveSearchResults.length === 0 ? (
                  <div className="p-4 text-xs font-bold text-slate-400 text-center">No products found matching "{searchQuery}"</div>
                ) : (
                  liveSearchResults.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug || prod.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition"
                    >
                      <img src={prod.image} alt={prod.title} className="w-10 h-10 object-cover rounded-lg border" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-950 line-clamp-1">{prod.title}</h4>
                        <span className="text-xs font-black text-emerald-700">₹{prod.price}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

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

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-2 relative">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search gadgets, home utilities..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-600"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 max-h-64 overflow-y-auto">
              {liveSearchResults.length === 0 ? (
                <div className="p-3 text-xs font-bold text-slate-400 text-center">No products found</div>
              ) : (
                liveSearchResults.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.slug || prod.id}`}
                    className="flex items-center gap-3 p-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                  >
                    <img src={prod.image} alt={prod.title} className="w-9 h-9 object-cover rounded-lg border" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-950 line-clamp-1">{prod.title}</h4>
                      <span className="text-xs font-black text-emerald-700">₹{prod.price}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
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
        
        {/* Hero Banner */}
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

        {/* Best Selling Products */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-slate-950">Best Selling Products</h2>
            <Link href="/shop" className="text-xs font-bold text-emerald-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {products.map((item) => {
              const qty = cartQuantities[item.id] || 0;
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <Link href={`/product/${item.slug || item.id}`} className="block aspect-square bg-slate-50 rounded-xl overflow-hidden mb-2 relative">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </Link>
                    <Link href={`/product/${item.slug || item.id}`}>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">{item.title}</h3>
                    </Link>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs sm:text-sm font-black text-slate-950">₹{item.price}</div>
                    {qty > 0 ? (
                      <div className="flex items-center bg-emerald-600 text-white rounded-xl overflow-hidden shadow-xs">
                        <button onClick={() => handleUpdateCartQty(item, -1)} className="p-1.5 hover:bg-emerald-700 transition">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-black">{qty}</span>
                        <button onClick={() => handleUpdateCartQty(item, 1)} disabled={qty >= 9} className="p-1.5 hover:bg-emerald-700 disabled:opacity-40 transition">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleUpdateCartQty(item, 1)} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black transition flex items-center gap-1 border border-emerald-200">
                        <ShoppingBag className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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