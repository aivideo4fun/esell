/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Zap, 
  ShoppingBag, 
  Sparkles, 
  Loader2, 
  Share2, 
  Check,
  Heart,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

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
  sizes?: string[];       // Future clothes support (e.g. ["S", "M", "L", "XL", "XXL"])
  colors?: string[];      // Future color support (e.g. ["Black", "White", "Navy Blue", "Olive"])
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cart = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [qty, setQty] = useState<number>(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Variant selections (Size & Color)
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  const rawId = params?.id;
  const currentSlugOrId = Array.isArray(rawId) ? rawId[0] : (rawId as string);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const data: Product[] = await res.json();

        const found = data.find(
          (p) =>
            p.slug.toLowerCase() === currentSlugOrId?.toLowerCase() ||
            p.id === currentSlugOrId
        );

        if (found) {
          setProduct(found);
          // Default first size & color if available
          if (found.sizes && found.sizes.length > 0) {
            setSelectedSize(found.sizes[0]);
          }
          if (found.colors && found.colors.length > 0) {
            setSelectedColor(found.colors[0]);
          }
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

  const handleShare = async () => {
    const productUrl = window.location.href;
    const shareData = {
      title: product?.title || "Check this product on CatchBuddy!",
      text: `Buy ${product?.title} at ₹${product?.price} on CatchBuddy!`,
      url: productUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

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

  const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || "/placeholder.png";
  const sellingPrice = product.price;
  const originalPrice = product.originalPrice;
  const discount = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = (product.stock ?? 1) <= 0;

  // Cart item title with size and color details if selected
  const getFullItemTitle = () => {
    let extra = [];
    if (selectedSize) extra.push(`Size: ${selectedSize}`);
    if (selectedColor) extra.push(`Color: ${selectedColor}`);
    return extra.length > 0 ? `${product.title} (${extra.join(", ")})` : product.title;
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    cart.addItem({
      id: product.id,
      title: getFullItemTitle(),
      price: product.price,
      image: primaryImg,
      quantity: qty,
    });
    if (cart.openCart) {
      cart.openCart();
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    cart.addItem({
      id: product.id,
      title: getFullItemTitle(),
      price: product.price,
      image: primaryImg,
      quantity: qty,
    });
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-white text-[#0f172a] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <nav className="text-xs font-bold text-[#64748b] flex items-center gap-2">
            <Link href="/" className="hover:text-[#065f46]">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#065f46]">Shop</Link>
            <span>/</span>
            <span className="text-[#0f172a] truncate max-w-xs">{product.title}</span>
          </nav>

          {/* Action Buttons: Wishlist + Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  title: product.title,
                  price: sellingPrice,
                  originalPrice: originalPrice,
                  image: primaryImg,
                  slug: product.slug,
                })
              }
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                isWishlisted
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`w-4 h-4 transition ${
                  isWishlisted ? "fill-red-500 text-red-500 scale-110" : "text-gray-700"
                }`}
              />
              <span className="hidden sm:inline">{isWishlisted ? "Saved" : "Wishlist"}</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-[#0f172a] text-xs font-bold rounded-xl transition cursor-pointer shadow-xs active:scale-95 border border-gray-200"
              title="Share this product"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span className="text-[#16a34a]">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-gray-700" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Product Image */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl bg-[#f8fafc] border border-gray-200 overflow-hidden flex items-center justify-center p-6">
              <img
                src={primaryImg}
                alt={product.title}
                className={`object-contain w-full h-full transition duration-300 ${
                  isOutOfStock ? "grayscale opacity-75" : ""
                }`}
              />
              
              {/* Badges */}
              {isOutOfStock ? (
                <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider shadow-md flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Out of Stock
                </span>
              ) : discount > 0 ? (
                <span className="absolute top-4 left-4 bg-[#16a34a] text-white text-xs font-black px-3 py-1 rounded-lg">
                  {discount}% OFF
                </span>
              ) : null}
            </div>
          </div>

          {/* Product Info & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-xs font-bold">
                <Zap className="w-3.5 h-3.5 fill-[#16a34a]" /> Direct Verified Dispatch
              </div>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Only {product.stock} left in stock!
                </span>
              )}
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

            {/* Clothes: Size Selection Option */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0f172a] uppercase tracking-wider">
                    Select Size: <span className="text-[#16a34a]">{selectedSize}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-11 py-2 px-3.5 rounded-xl text-xs font-black transition border-2 cursor-pointer ${
                        selectedSize === sz
                          ? "bg-black text-white border-black shadow-xs"
                          : "bg-white text-gray-800 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clothes & Goods: Color Selection Option */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <span className="text-xs font-black text-[#0f172a] uppercase tracking-wider block">
                  Select Color: <span className="text-[#16a34a]">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((clr) => (
                    <button
                      key={clr}
                      type="button"
                      onClick={() => setSelectedColor(clr)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold transition border-2 flex items-center gap-1.5 cursor-pointer ${
                        selectedColor === clr
                          ? "bg-[#f0fdf4] text-[#065f46] border-[#16a34a]"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {selectedColor === clr && <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />}
                      {clr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Offer Banner */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#065f46]">
              <Sparkles className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed">
                <span className="font-black text-[#16a34a]">Prepaid Special:</span> Flat ₹50 Instant Discount + FREE Express Delivery on Online UPI payment!
              </p>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
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
                    onClick={() => setQty((q) => (product.stock ? Math.min(product.stock, q + 1) : q + 1))}
                    className="px-3.5 py-1.5 text-sm font-black text-[#0f172a] hover:bg-gray-200 rounded-r-xl transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons (Disabled when Out of Stock) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 inline-flex items-center justify-center gap-2 font-black py-3.5 px-6 rounded-2xl transition shadow-xs ${
                  isOutOfStock
                    ? "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
                    : "bg-white border-2 border-gray-900 hover:border-[#16a34a] hover:text-[#16a34a] text-[#0f172a] cursor-pointer"
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> {isOutOfStock ? "Sold Out" : "Add to Cart"}
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className={`flex-1 inline-flex items-center justify-center gap-2 font-black py-3.5 px-6 rounded-2xl transition shadow-lg ${
                  isOutOfStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                    : "bg-[#065f46] hover:bg-[#044e39] text-white shadow-emerald-950/20 active:scale-95 cursor-pointer"
                }`}
              >
                <Zap className="w-4 h-4 fill-white" /> {isOutOfStock ? "Currently Unavailable" : "Buy Now (Instant Pay)"}
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