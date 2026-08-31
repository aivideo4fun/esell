/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ShieldCheck, Truck, RotateCcw, Zap, ShoppingBag, Sparkles, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice: number;
  stock: number;
  badge?: string;
  images: ProductImage[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cart = useCart();
  const [qty, setQty] = useState<number>(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const rawId = params?.id;
  const currentSlugOrId = Array.isArray(rawId) ? rawId[0] : (rawId as string);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const data: Product[] = await res.json();

        // Find product by slug or id
        const found = data.find(
          (p) =>
            p.slug.toLowerCase() === currentSlugOrId?.toLowerCase() ||
            p.id === currentSlugOrId
        );

        if (found) {
          setProduct(found);
        } else {
          setError("Product not found");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    if (currentSlugOrId) {
      fetchProduct();
    }
  }, [currentSlugOrId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-bold text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="text-2xl font-black text-gray-900">Product Not Found</h2>
        <p className="text-gray-500 text-sm">The product you are looking for does not exist or has been removed.</p>
        <Link
          href="/shop"
          className="bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-800 transition"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  // Dynamic values
  const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || "/placeholder.png";
  const sellingPrice = product.price;
  const originalPrice = product.originalPrice;
  const discount = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);

  const handleAddToCart = () => {
    cart.addItem({
      id: product.id, // Actual database ID passes to order
      title: product.title,
      price: product.price,
      image: primaryImg,
      quantity: qty,
    });
    if (cart.openCart) {
      cart.openCart();
    }
  };

  const handleBuyNow = () => {
    cart.addItem({
      id: product.id, // Actual database ID passes to order
      title: product.title,
      price: product.price,
      image: primaryImg,
      quantity: qty,
    });
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-white text-[#0f172a] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-xs font-bold text-[#64748b] mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#065f46]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#065f46]">Shop</Link>
          <span>/</span>
          <span className="text-[#0f172a] truncate max-w-xs">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl bg-[#f8fafc] border border-gray-200 overflow-hidden flex items-center justify-center p-6">
              <img
                src={primaryImg}
                alt={product.title}
                className="object-contain w-full h-full"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-[#16a34a] text-white text-xs font-black px-3 py-1 rounded-lg">
                  {discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Product Info & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-xs font-bold">
              <Zap className="w-3.5 h-3.5 fill-[#16a34a]" /> Direct Verified Dispatch
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[#0f172a] leading-tight capitalize">
              {product.title}
            </h1>

            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-[#f8fafc] border border-gray-200">
              <span className="text-3xl font-black text-[#065f46]">₹{sellingPrice}</span>
              <span className="text-base font-bold text-[#64748b] line-through">₹{originalPrice}</span>
              <span className="text-xs font-black text-[#16a34a] bg-[#f0fdf4] px-2.5 py-1 rounded-md border border-[#bbf7d0]">
                Flat ₹50 Extra Off on Prepaid UPI
              </span>
            </div>

            {/* Offer Banner */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#065f46]">
              <Sparkles className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed">
                <span className="font-black text-[#16a34a]">Prepaid Special:</span> Flat ₹50 Instant Discount + FREE Express Delivery on Online UPI payment!
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-black text-[#64748b] uppercase tracking-wide">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 text-sm font-black text-[#0f172a] hover:bg-gray-200 rounded-l-xl transition cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-xs font-black text-[#0f172a]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3.5 py-1.5 text-sm font-black text-[#0f172a] hover:bg-gray-200 rounded-r-xl transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-900 hover:border-[#16a34a] hover:text-[#16a34a] text-[#0f172a] font-black py-3.5 px-6 rounded-2xl transition cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#065f46] hover:bg-[#044e39] text-white font-black py-3.5 px-6 rounded-2xl transition shadow-lg shadow-emerald-950/20 active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" /> Buy Now (Instant Pay)
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center">
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-gray-100">
                <Truck className="w-5 h-5 text-[#16a34a] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-[#0f172a]">Free Express Delivery</p>
              </div>
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-gray-100">
                <ShieldCheck className="w-5 h-5 text-[#16a34a] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-[#0f172a]">100% Verified Safe</p>
              </div>
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-gray-100">
                <RotateCcw className="w-5 h-5 text-[#16a34a] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-[#0f172a]">5-Day Replacement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}