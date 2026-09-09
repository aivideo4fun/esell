/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Plus,
  Minus,
  Flame,
  MessageCircle,
  ArrowRight,
  Tag,
  Heart
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
  const [activeCoupons, setActiveCoupons] = useState<CouponItem[]>([]);
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Dynamic Admin Banner State
  const [heroBanner, setHeroBanner] = useState({
    badge: "LIMITED TIME OFFER",
    headingMain: "Premium Gadgets,",
    headingHighlight: "Direct to Your Doorstep.",
    subtitle: "100% Verified Products • Instant Prepaid Discounts • Free Shipping"
  });

  // Deal of the Day Sliding State
  const [dealProductsList, setDealProductsList] = useState<ProductItem[]>([]);
  const [currentDealIndex, setCurrentDealIndex] = useState(0);

  const loadAdminSettingsAndProducts = (mappedProducts: ProductItem[]) => {
    try {
      const savedBanner = localStorage.getItem("cb_admin_hero_banner");
      if (savedBanner) {
        setHeroBanner(JSON.parse(savedBanner));
      }

      const savedDealsJSON = localStorage.getItem("cb_admin_deal_ids");
      if (savedDealsJSON && mappedProducts.length > 0) {
        const dealIds: string[] = JSON.parse(savedDealsJSON);
        const matchedDeals = dealIds
          .map((id) => mappedProducts.find((p) => p.id === id))
          .filter(Boolean) as ProductItem[];

        if (matchedDeals.length > 0) {
          setDealProductsList(matchedDeals);
          return;
        }
      }
      if (mappedProducts.length > 0) {
        setDealProductsList(mappedProducts.slice(0, 5));
      }
    } catch (e) {
      console.error(e);
      if (mappedProducts.length > 0) setDealProductsList(mappedProducts.slice(0, 5));
    }
  };

  useEffect(() => {
    const syncState = () => {
      try {
        const savedCart = localStorage.getItem("cb_cart");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            const map: Record<string, number> = {};
            parsed.forEach((item: any) => {
              const pid = item.productId || item.id;
              if (pid) map[pid] = item.quantity || 1;
            });
            setCartQuantities(map);
          }
        }

        const savedWishlist = localStorage.getItem("cb_wishlist");
        if (savedWishlist) {
          const parsedWish = JSON.parse(savedWishlist);
          if (Array.isArray(parsedWish)) {
            setWishlistIds(parsedWish.map((i: any) => i.id || i));
          }
        }
      } catch {}
    };

    syncState();
    window.addEventListener("storage", syncState);

    async function loadStoreData() {
      try {
        const [homeRes, couponRes] = await Promise.all([
          fetch("/api/storefront/home", { cache: "no-store" }),
          fetch("/api/admin/coupons", { cache: "no-store" })
        ]);

        const data = await homeRes.json();
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
              mrp: p.mrp || Math.round((p.price || 100) * 1.35),
              discount: p.discount || "SPECIAL",
              rating: p.rating || 4.5,
              reviews: p.reviews || "100+",
              image: p.image || p.images?.[0]?.url || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",
              stock: p.stock ?? 10,
            }));
            setProducts(mappedProducts);
            loadAdminSettingsAndProducts(mappedProducts);
          }
        }

        const couponData = await couponRes.json();
        if (couponData.success && Array.isArray(couponData.coupons)) {
          setActiveCoupons(couponData.coupons);
        }
      } catch (err) {
        console.error("Error loading store data", err);
      }
    }
    loadStoreData();

    return () => {
      window.removeEventListener("storage", syncState);
    };
  }, []);

  const toggleWishlist = (item: ProductItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let savedWishlist = JSON.parse(localStorage.getItem("cb_wishlist") || "[]");
      if (!Array.isArray(savedWishlist)) savedWishlist = [];

      const exists = savedWishlist.some((i: any) => (i.id === item.id || i === item.id));
      let updated = [];

      if (exists) {
        updated = savedWishlist.filter((i: any) => (i.id !== item.id && i !== item.id));
      } else {
        updated = [...savedWishlist, { id: item.id, slug: item.slug, title: item.title, price: item.price, image: item.image }];
      }

      localStorage.setItem("cb_wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      setWishlistIds(updated.map((i: any) => i.id || i));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (dealProductsList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentDealIndex((prev) => (prev + 1) % dealProductsList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [dealProductsList.length]);

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
      window.dispatchEvent(new Event("storage"));

      const map: Record<string, number> = {};
      cart.forEach((item: any) => {
        const pid = item.productId || item.id;
        if (pid) map[pid] = item.quantity || 1;
      });
      setCartQuantities(map);
    } catch (e) {
      console.error("Error updating cart", e);
    }
  };

  const singleActiveCoupon = activeCoupons.length > 0 ? activeCoupons[0] : null;
  const currentDealProduct = dealProductsList[currentDealIndex] || dealProductsList[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-900 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6 sm:space-y-8 mt-4">
        
        {/* 1. Hero Banner */}
        <section>
          <div className="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-block px-2.5 py-1 bg-amber-400/20 text-amber-300 rounded-md text-[10px] font-black uppercase tracking-wider mb-3">
                {heroBanner.badge}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black leading-snug">
                {heroBanner.headingMain} <br className="hidden sm:inline" />
                <span className="text-emerald-400">{heroBanner.headingHighlight}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
                {heroBanner.subtitle}
              </p>
              <div className="mt-6">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow-sm cursor-pointer"
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Top Categories */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-slate-950">Top Categories</h2>
            <Link href="/shop" className="text-xs font-bold text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          {categories.length === 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {["Gadgets", "Electronics", "Home", "Fashion", "Toys", "Beauty", "Daily", "Kids"].map((c, i) => (
                <div key={i} className="p-3 bg-white rounded-2xl border border-slate-100 text-center text-xs font-bold text-slate-600">
                  {c}
                </div>
              ))}
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

        {/* 3. Deal of the Day (Sliding 5 Products) */}
        {currentDealProduct && (() => {
          const dealMrp = currentDealProduct.mrp > currentDealProduct.price ? currentDealProduct.mrp : Math.round(currentDealProduct.price * 1.35);
          const dealDiscount = Math.round(((dealMrp - currentDealProduct.price) / dealMrp) * 100);
          const isWish = wishlistIds.includes(currentDealProduct.id);

          return (
            <section>
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 sm:p-6 transition-all duration-500">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 text-sm font-black text-emerald-900">
                    <Flame className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span>DEAL OF THE DAY ({currentDealIndex + 1}/{dealProductsList.length})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-black">
                    <span className="bg-slate-900 text-white px-2 py-1 rounded-md">{String(timeLeft.hours).padStart(2, "0")}h</span>
                    <span>:</span>
                    <span className="bg-slate-900 text-white px-2 py-1 rounded-md">{String(timeLeft.minutes).padStart(2, "0")}m</span>
                    <span>:</span>
                    <span className="bg-slate-900 text-white px-2 py-1 rounded-md">{String(timeLeft.seconds).padStart(2, "0")}s</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-4 border border-slate-200 items-center animate-fade-in relative overflow-hidden">
                  
                  {/* Top-Left Discount Badge */}
                  <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs z-10">
                    {dealDiscount}% OFF
                  </span>

                  {/* Top-Right Wishlist Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleWishlist(currentDealProduct, e)}
                    className={`absolute top-2 right-2 p-2 rounded-full border shadow-xs transition cursor-pointer z-10 backdrop-blur-xs ${
                      isWish ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white/90 border-slate-200 text-slate-600 hover:text-rose-600"
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWish ? "fill-rose-600" : ""}`} />
                  </button>

                  <img
                    src={currentDealProduct.image}
                    alt={currentDealProduct.title}
                    className="w-32 h-32 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between w-full">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 line-clamp-2">{currentDealProduct.title}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-emerald-700">₹{currentDealProduct.price}</span>
                        <span className="text-xs line-through text-slate-400 font-bold">₹{dealMrp}</span>
                      </div>
                      <Link
                        href={`/product/${currentDealProduct.slug || currentDealProduct.id}`}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* 4. Best Selling Products */}
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
              const itemMrp = item.mrp > item.price ? item.mrp : Math.round(item.price * 1.35);
              const itemDiscount = Math.round(((itemMrp - item.price) / itemMrp) * 100);
              const isWish = wishlistIds.includes(item.id);

              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs flex flex-col justify-between group relative">
                  <div>
                    <div className="block aspect-square bg-slate-50 rounded-xl overflow-hidden mb-2 relative">
                      <Link href={`/product/${item.slug || item.id}`} className="block w-full h-full">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      </Link>

                      {/* Top-Left Discount Badge */}
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs z-10 pointer-events-none">
                        {itemDiscount}% OFF
                      </span>

                      {/* Top-Right Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(item, e)}
                        className={`absolute top-2 right-2 p-2 rounded-full border shadow-xs transition cursor-pointer z-10 backdrop-blur-xs ${
                          isWish ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white/90 border-slate-200 text-slate-600 hover:text-rose-600"
                        }`}
                        title="Wishlist"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isWish ? "fill-rose-600" : ""}`} />
                      </button>
                    </div>

                    <Link href={`/product/${item.slug || item.id}`}>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">{item.title}</h3>
                    </Link>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-black text-slate-950">₹{item.price}</span>
                      <span className="text-[10px] text-slate-400 line-through font-bold">₹{itemMrp}</span>
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center bg-emerald-600 text-white rounded-xl overflow-hidden shadow-xs">
                        <button onClick={() => handleUpdateCartQty(item, -1)} className="p-1.5 hover:bg-emerald-700 transition cursor-pointer">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-black">{qty}</span>
                        <button onClick={() => handleUpdateCartQty(item, 1)} disabled={qty >= 9} className="p-1.5 hover:bg-emerald-700 disabled:opacity-40 transition cursor-pointer">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleUpdateCartQty(item, 1)} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black transition flex items-center gap-1 border border-emerald-200 cursor-pointer">
                        <ShoppingBag className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Prepaid Benefits & Single Active Coupon Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#064E3B] text-white rounded-3xl p-6 flex flex-col justify-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-300 mb-3">
              PREPAID ORDER BENEFITS (PAN INDIA)
            </h3>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-center">
              <div className="flex flex-col items-center gap-1.5 p-2 bg-emerald-800/50 rounded-2xl">
                <CreditCard className="w-5 h-5 text-emerald-300" />
                <span>Extra 5% Off</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 bg-emerald-800/50 rounded-2xl">
                <Truck className="w-5 h-5 text-emerald-300" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 bg-emerald-800/50 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <span>Priority Support</span>
              </div>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex flex-col justify-center space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-rose-600" />
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-600">AVAILABLE COUPON</h4>
            </div>
            {!singleActiveCoupon ? (
              <p className="text-xs text-slate-600 font-medium">Use code <b className="text-rose-700 font-mono">CATCH10</b> at checkout for special discount!</p>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <div className="px-3.5 py-2 bg-white border border-rose-200 rounded-xl text-xs font-black font-mono text-rose-700 shadow-2xs">
                  🏷️ {singleActiveCoupon.code}
                </div>
                <span className="text-xs text-slate-600 font-semibold">
                  {singleActiveCoupon.description || "Apply at checkout"}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 6. WhatsApp Support Section */}
        <section>
          <a
            href="https://wa.me/917976152206?text=Hi%20CatchBuddy%2C%20I%20need%20help%20with%20my%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold text-xs hover:bg-emerald-100 transition cursor-pointer shadow-xs"
          >
            <MessageCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-black">Need Help? Chat with us on WhatsApp</div>
              <div className="text-xs text-emerald-700 font-medium">+91 7976152206</div>
            </div>
          </a>
        </section>
      </main>
    </div>
  );
}