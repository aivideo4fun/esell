"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  Flame,
  Zap,
} from "lucide-react";

interface ProductData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number;
  stock: number;
  rating: number;
  reviewCount: number;
  sizes: string[];
  colors: string[];
  badge: string | null;
  images: { url: string; isPrimary: boolean }[];
  category: { name: string; slug: string };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setSelectedImg(
            data.product.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80"
          );
          if (data.product.sizes?.length > 0) setSelectedSize(data.product.sizes[0]);
          if (data.product.colors?.length > 0) setSelectedColor(data.product.colors[0]);
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadProduct();
  }, [slug]);

  const discountPercent = product
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (redirectCheckout = false) => {
    if (!product) return;

    const cartItem = {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      image: selectedImg,
      quantity,
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
    };

    try {
      const existing = localStorage.getItem("cb_cart");
      let cart = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(cart)) cart = [];

      const index = cart.findIndex(
        (i: any) =>
          i.productId === cartItem.productId &&
          i.selectedSize === cartItem.selectedSize &&
          i.selectedColor === cartItem.selectedColor
      );

      if (index > -1) {
        cart[index].quantity += quantity;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem("cb_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));

      if (redirectCheckout) {
        router.push("/cart");
      } else {
        setAddedNotice(true);
        setTimeout(() => setAddedNotice(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xs font-bold text-slate-500 animate-pulse">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 space-y-4">
        <h2 className="text-lg font-black text-slate-900">Product Not Found</h2>
        <Link href="/" className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Return to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 md:pb-12 text-slate-900 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 inline-flex items-center gap-1 text-xs font-bold">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-sm font-black tracking-tight text-slate-950">
            Catch<span className="text-emerald-600">Buddy</span>
          </span>
          <Link href="/cart" className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg relative">
            <ShoppingBag className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Product Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl border border-slate-200 overflow-hidden relative shadow-xs">
              <img src={selectedImg} alt={product.title} className="w-full h-full object-cover" />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(img.url)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition ${
                      selectedImg === img.url ? "border-emerald-600" : "border-slate-200"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                {product.category?.name || "General Gadgets"}
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-1 leading-snug">
                {product.title}
              </h1>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs font-black text-emerald-800">
                  <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  ({product.reviewCount} verified ratings)
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-950">₹{product.price}</span>
                  <span className="text-sm line-through text-slate-400">₹{product.originalPrice}</span>
                  {discountPercent > 0 && (
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5">Inclusive of all taxes & free shipping</p>
              </div>

              {product.stock <= 10 && product.stock > 0 && (
                <span className="text-[11px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Only {product.stock} left!
                </span>
              )}
            </div>

            {/* Size Variants (If available) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 block">Select Size:</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-black border transition ${
                        selectedSize === s
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Variants (If available) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 block">Select Color:</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-xl text-xs font-black border transition ${
                        selectedColor === c
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-slate-900">Quantity:</span>
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-black">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleAddToCart(false)}
                className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2"
              >
                {addedNotice ? <Check className="w-4 h-4 text-emerald-600" /> : <ShoppingBag className="w-4 h-4" />}
                {addedNotice ? "Added to Cart!" : "Add to Cart"}
              </button>
              <button
                onClick={() => handleAddToCart(true)}
                className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Buy Now
              </button>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-center text-[10px] font-bold text-slate-600">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>3-5 Days Delivery</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>7 Days Replacement</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Genuine</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-2">
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Description</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sticky Mobile Bottom Bar for Checkout */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-3 px-4 flex items-center gap-3 shadow-xl">
        <button
          onClick={() => handleAddToCart(false)}
          className="flex-1 py-3 bg-slate-100 text-slate-900 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition"
        >
          {addedNotice ? <Check className="w-4 h-4 text-emerald-600" /> : <ShoppingBag className="w-4 h-4" />}
          {addedNotice ? "Added!" : "Add to Cart"}
        </button>
        <button
          onClick={() => handleAddToCart(true)}
          className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
        >
          <Zap className="w-4 h-4" /> Buy Now
        </button>
      </div>
    </div>
  );
}