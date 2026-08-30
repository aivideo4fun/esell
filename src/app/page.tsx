"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Zap, 
  CheckCircle2, 
  Flame, 
  TrendingUp, 
  Loader2 
} from "lucide-react";
import { CATEGORIES, FEATURED_PRODUCTS } from "@/lib/constants";
import ProductCard from "@/components/product/ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepageProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        const data = await res.json();

        if (data.success && data.products && data.products.length > 0) {
          const formatted = data.products.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            price: p.price,
            originalPrice: p.originalPrice,
            category: p.category?.name || "Gadgets",
            image:
              p.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
            rating: p.rating || 4.8,
            badge: p.badge || "BESTSELLER",
          }));
          setProducts(formatted);
        } else {
          setProducts(FEATURED_PRODUCTS);
        }
      } catch (err) {
        console.error("Error fetching homepage products:", err);
        setProducts(FEATURED_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageProducts();
  }, []);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* 1. Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white py-12 sm:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100/80 text-blue-800 rounded-full text-xs font-black tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Direct Verified Supplier Dispatch
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.15]">
                Premium Trending Gadgets, <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Direct to Your Doorstep.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-600 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover everyday smart utilities, lifestyle innovations, and viral products with 100% verified quality &amp; instant prepaid discounts.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gray-950 hover:bg-blue-600 text-white text-xs font-black rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  Explore Live Catalog <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> 100% Safe Prepaid Checkout
                </div>
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-200/80 text-left">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-gray-950">Free Express Delivery</p>
                  <p className="text-[11px] text-gray-500">On all UPI prepaid orders</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-gray-950">5-Day Replacements</p>
                  <p className="text-[11px] text-gray-500">Hassle-free return policy</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-gray-950">Quality Tested</p>
                  <p className="text-[11px] text-gray-500">100% Working guarantee</p>
                </div>
              </div>
            </div>

            {/* Right Hero Feature Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl p-1 shadow-2xl">
                <div className="bg-white rounded-[22px] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-lg uppercase">
                      Deal of the Day 🔥
                    </span>
                    <span className="text-[11px] font-bold text-gray-500">Limited Stock Left</span>
                  </div>

                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center p-4">
                    <img
                      src={
                        products[0]?.image ||
                        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80"
                      }
                      alt="Featured product"
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-black text-gray-950 truncate">
                      {products[0]?.title || "Smart Daily Utility Gadget"}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-gray-950">
                        ₹{products[0]?.price || 799}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        ₹{products[0]?.originalPrice || 1499}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={products[0]?.slug ? `/shop/${products[0].slug}` : "/shop"}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" /> Grab This Deal Now
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Top Categories Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Shop by Category
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Explore our most popular departments</p>
          </div>
          <Link href="/shop" className="text-xs font-bold text-blue-600 hover:underline">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORIES.map((cat: any) => (
            <Link
              key={cat.id || cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group p-4 bg-white rounded-2xl border border-gray-200 hover:border-blue-600 hover:shadow-md transition text-center space-y-2 block"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center mx-auto text-2xl transition">
                {cat.icon || "📦"}
              </div>
              <h4 className="font-black text-gray-900 text-xs">{cat.name}</h4>
              <p className="text-[10px] text-gray-400 font-semibold">{cat.count || "Explore"}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Live Trending & Database Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500 fill-red-500" /> Trending &amp; Bestsellers
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Top-rated items currently shipping across India</p>
          </div>
          <Link
            href="/shop"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl text-xs font-bold transition"
          >
            See Full Catalog
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-xs font-bold text-gray-500">Loading live store items...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Trust & Guarantee Assurance Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-950 rounded-3xl p-6 sm:p-10 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-white">Fast &amp; Free Shipping</h4>
                <p className="text-xs text-gray-400">Express delivery to 19,000+ Indian pincodes</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-green-400" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-white">100% Secure Checkout</h4>
                <p className="text-xs text-gray-400">Encrypted UPI, Cards &amp; NetBanking via Razorpay</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-white">5-Day Easy Returns</h4>
                <p className="text-xs text-gray-400">Instant replacement for defective/damaged items</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}