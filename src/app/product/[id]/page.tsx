/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
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
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Star,
  MessageSquarePlus,
  BadgeCheck
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

interface ProductImage {
  id?: string;
  url: string;
  isPrimary?: boolean;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  badge?: string;
  images: ProductImage[];
  sizes?: string[];
  colors?: string[];
}

interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
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

  // Gallery slider & Fullscreen states
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Variant selections
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  // Customer Reviews State
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewPhone, setReviewPhone] = useState<string>("");
  const [reviewName, setReviewName] = useState<string>("");

  const rawId = params?.id;
  const currentSlugOrId = Array.isArray(rawId) ? rawId[0] : (rawId as string);

  const fetchReviews = useCallback(async (productId: string) => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.avgRating) setAvgRating(data.avgRating);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load products");
        const json = await res.json();

        const productList: Product[] = Array.isArray(json)
          ? json
          : json.products || [];

        const target = decodeURIComponent(currentSlugOrId || "").toLowerCase();

        const found = productList.find(
          (p) =>
            p.id.toLowerCase() === target ||
            (p.slug && p.slug.toLowerCase() === target)
        );

        if (found) {
          setProduct(found);
          setActiveImageIndex(0);
          if (found.sizes && found.sizes.length > 0) {
            setSelectedSize(found.sizes[0]);
          }
          if (found.colors && found.colors.length > 0) {
            setSelectedColor(found.colors[0]);
          }
          void fetchReviews(found.id);
        } else {
          setError("Product not found");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load product";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    if (currentSlugOrId) {
      void fetchProduct();
    }
  }, [currentSlugOrId, fetchReviews]);

  const allImages = (product?.images && product.images.length > 0)
    ? product.images.map((img) => img.url)
    : ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80"];

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

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
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (reviewPhone.replace(/\D/g, "").length < 10) {
      alert("Order verify karne ke liye apna 10-digit WhatsApp number dalein.");
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
          phone: reviewPhone,
          customerName: reviewName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Thank you! Aapka verified review submit ho gaya hai.");
        setShowReviewModal(false);
        setReviewComment("");
        setReviewPhone("");
        setReviewName("");
        void fetchReviews(product.id);
      } else {
        alert(data.error || "Review submit nahi ho saka.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setReviewSubmitting(false);
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

  const currentActiveImage = allImages[activeImageIndex] || allImages[0];
  const sellingPrice = product.price;
  const origPrice = product.originalPrice || Math.round(sellingPrice * 1.4);
  const discount = Math.round(((origPrice - sellingPrice) / origPrice) * 100);
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = (product.stock ?? 1) <= 0;

  const getFullItemTitle = () => {
    const extra: string[] = [];
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
      image: currentActiveImage,
      quantity: qty,
    });
    if (cart.openCart) cart.openCart();
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    cart.addItem({
      id: product.id,
      title: getFullItemTitle(),
      price: product.price,
      image: currentActiveImage,
      quantity: qty,
    });
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-white text-[#0f172a] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between">
          <nav className="text-xs font-bold text-[#64748b] flex items-center gap-2">
            <Link href="/" className="hover:text-[#065f46]">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#065f46]">Shop</Link>
            <span>/</span>
            <span className="text-[#0f172a] truncate max-w-xs">{product.title}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  title: product.title,
                  price: sellingPrice,
                  originalPrice: origPrice,
                  image: currentActiveImage,
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-[#0f172a] text-xs font-bold rounded-xl transition cursor-pointer shadow-xs border border-gray-200"
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

        {/* Main Product Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* IMAGE GALLERY SLIDER */}
          <div className="lg:col-span-6 space-y-4">
            <div 
              onClick={() => setIsLightboxOpen(true)}
              className="relative aspect-square w-full rounded-3xl bg-[#f8fafc] border border-gray-200 overflow-hidden flex items-center justify-center p-6 group cursor-zoom-in"
            >
              <img
                src={currentActiveImage}
                alt={product.title}
                className={`object-contain w-full h-full transition-all duration-300 ${
                  isOutOfStock ? "grayscale opacity-75" : "group-hover:scale-105"
                }`}
              />

              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md flex items-center justify-center border border-slate-200 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md flex items-center justify-center border border-slate-200 transition cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white p-2 rounded-xl text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
              </span>

              {allImages.length > 1 && (
                <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 font-bold px-2.5 py-1 rounded-lg text-xs border border-slate-200 shadow-2xs">
                  {activeImageIndex + 1} / {allImages.length}
                </span>
              )}

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

            {/* Thumbnail Row */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
                {allImages.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition p-1.5 bg-[#f8fafc] shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-[#16a34a] ring-2 ring-[#16a34a]/30 shadow-sm"
                        : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFO & BUY ACTIONS */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-xs font-bold">
                <Zap className="w-3.5 h-3.5 fill-[#16a34a]" /> Direct Verified Dispatch
              </div>
              <div className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{avgRating} ({reviews.length} Verified Reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[#0f172a] leading-tight capitalize">
              {product.title}
            </h1>

            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-[#f8fafc] border border-gray-200">
              <span className="text-3xl font-black text-[#065f46]">₹{sellingPrice}</span>
              <span className="text-base font-bold text-[#64748b] line-through">₹{origPrice}</span>
              <span className="text-xs font-black text-[#16a34a] bg-[#f0fdf4] px-2.5 py-1 rounded-md border border-[#bbf7d0]">
                Flat ₹50 Extra Off on Prepaid UPI
              </span>
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
                    onClick={() => setQty((q) => (product.stock ? Math.min(product.stock, Math.min(9, q + 1)) : Math.min(9, q + 1)))}
                    className="px-3.5 py-1.5 text-sm font-black text-[#0f172a] hover:bg-gray-200 rounded-r-xl transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
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

        {/* CUSTOMER REVIEWS & RATINGS SECTION */}
        <div className="pt-10 border-t border-gray-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#0f172a] flex items-center gap-2">
                Customer Reviews &amp; Ratings
              </h2>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Only verified buyers who received delivery can review this product.
              </p>
            </div>

            {/* Write a Review Button */}
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#065f46] hover:bg-[#044e39] text-white text-xs font-black rounded-2xl transition cursor-pointer shadow-md shadow-emerald-950/20 active:scale-95"
            >
              <MessageSquarePlus className="w-4 h-4" /> Write a Review
            </button>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-3xl border border-gray-200 space-y-2">
              <Star className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-black text-gray-700">No reviews yet for this product.</p>
              <p className="text-[11px] text-gray-500">
                Agar aapne yeh product buy aur receive kar liya hai, toh &quot;Write a Review&quot; par click karke rating share karein!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-[#0f172a]">{rev.customerName}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <BadgeCheck className="w-3 h-3 text-emerald-600" /> Verified Delivered Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* WRITE A REVIEW MODAL (DELIVERY VERIFIED) */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-[#0f172a] flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Share Verified Review
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Picker */}
              <div>
                <label className="text-[11px] font-black uppercase text-gray-700 block mb-1.5">
                  Rating:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className="p-1 transition cursor-pointer hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-gray-700 ml-2">
                    {reviewRating} Star{reviewRating > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Delivery Verification Phone */}
              <div>
                <label className="text-[11px] font-black uppercase text-gray-700 block mb-1">
                  WhatsApp / Order Mobile Number *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="10-digit number used during order"
                  maxLength={10}
                  value={reviewPhone}
                  onChange={(e) => setReviewPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:border-[#16a34a] focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  System check karega ki aapka is number par order DELIVER hua hai ya nahi.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-gray-700 block mb-1">
                  Your Display Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul S."
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:border-[#16a34a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-gray-700 block mb-1">
                  Your Feedback / Experience *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Product quality, delivery speed, packaging kaisa tha?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:border-[#16a34a] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-5 py-2 bg-[#065f46] hover:bg-[#044e39] text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {reviewSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify & Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition cursor-pointer"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition cursor-pointer"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[80vh] w-full flex items-center justify-center">
            <img
              src={currentActiveImage}
              alt={product.title}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}