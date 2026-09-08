/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  Flame,
  Zap,
  Heart,
  MessageSquarePlus,
  Loader2,
  AlertCircle,
  ShoppingBag
} from "lucide-react";

export default function ShopProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string>("");
  const [cartQuantity, setCartQuantity] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProductAndReviews() {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${slug}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.product) {
          const p = data.product;
          setProduct(p);
          setSelectedImg(
            p.images?.[0]?.url ||
              p.images?.[0] ||
              "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80"
          );

          const savedCart = JSON.parse(localStorage.getItem("cb_cart") || "[]");
          const existingItem = savedCart.find((i: any) => i.productId === p.id || i.id === p.id);
          if (existingItem) {
            setCartQuantity(existingItem.quantity || 1);
          }

          const savedWishlist = JSON.parse(localStorage.getItem("cb_wishlist") || "[]");
          if (savedWishlist.some((item: any) => item.id === p.id || item.slug === slug)) {
            setIsWishlisted(true);
          }

          try {
            const revRes = await fetch(`/api/products/reviews?productId=${p.id}`);
            const revData = await revRes.json();
            if (revData.success && revData.reviews) {
              setReviews(revData.reviews);
            }
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    }
    void loadProductAndReviews();
  }, [slug]);

  // Strict Inventory & Max 9 Limit Enforcement
  const updateCartQuantity = (newQty: number, redirectCheckout = false) => {
    if (!product) return;

    if (newQty < 0) newQty = 0;

    // Connect with Admin Inventory Stock & Strict Max 9 Limit
    const stockAvailable = typeof product.stock === "number" ? product.stock : 10;
    const maxAllowedLimit = Math.min(9, stockAvailable);

    if (newQty > maxAllowedLimit) {
      if (stockAvailable < 9) {
        alert(`Maaf kijiye, admin inventory mein sirf ${stockAvailable} items available hain.`);
      } else {
        alert("Aap maximum 9 quantity hi add kar sakte hain.");
      }
      return;
    }

    try {
      const existing = localStorage.getItem("cb_cart");
      let cart = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(cart)) cart = [];

      const index = cart.findIndex((i: any) => (i.productId === product.id || i.id === product.id));

      if (newQty === 0) {
        if (index > -1) cart.splice(index, 1);
      } else {
        const cartItem = {
          id: product.id,
          productId: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          image: selectedImg,
          quantity: newQty,
          stock: product.stock,
        };

        if (index > -1) {
          cart[index].quantity = newQty;
        } else {
          cart.push(cartItem);
        }
      }

      localStorage.setItem("cb_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
      setCartQuantity(newQty);

      if (redirectCheckout && newQty > 0) {
        router.push("/checkout");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    try {
      const savedWishlist = JSON.parse(localStorage.getItem("cb_wishlist") || "[]");
      let updated = [];
      if (isWishlisted) {
        updated = savedWishlist.filter((item: any) => item.id !== product.id && item.slug !== slug);
        setIsWishlisted(false);
      } else {
        updated = [...savedWishlist, { id: product.id, slug, title: product.title, price: product.price, image: selectedImg }];
        setIsWishlisted(true);
      }
      localStorage.setItem("cb_wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim() || !product) {
      alert("Kripya apna naam aur review comment enter karein.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/products/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userName: reviewerName.trim(),
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.review) {
        setReviews([data.review, ...reviews]);
        setReviewerName("");
        setReviewComment("");
        setShowReviewForm(false);
        alert("Aapka verified review successfully post ho gaya hai!");
      } else {
        alert(data.error || "Failed to submit review");
      }
    } catch (err) {
      alert("Review submission error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <div className="text-xs font-bold text-slate-500 ml-2">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-lg font-black text-slate-900">Product Not Found</h2>
        <Link href="/shop" className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const discountPercent = product
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  
  const stockLimit = typeof product.stock === "number" ? product.stock : 10;
  const effectiveMaxLimit = Math.min(9, stockLimit);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-48 text-slate-900 font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-8 mt-6 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-xs">
          
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden relative flex items-center justify-center">
              <img src={selectedImg} alt={product.title} className="w-full h-full object-contain p-4" />
              
              <button
                type="button"
                onClick={toggleWishlist}
                className={`absolute top-3 right-3 p-3 rounded-full border shadow-md transition cursor-pointer z-20 ${
                  isWishlisted ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white border-slate-200 text-slate-700 hover:text-rose-600"
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-600" : ""}`} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                {product.category?.name || "General Gadgets"}
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-1 leading-snug">
                {product.title}
              </h1>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-950">₹{product.price}</span>
                <span className="text-sm line-through text-slate-400">₹{product.originalPrice}</span>
                {discountPercent > 0 && (
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-emerald-700">
                Inclusive of all taxes • Free Delivery only on Prepaid Orders
              </p>
            </div>

            {/* Desktop Dynamic Cart Counter Linked with Inventory & Max 9 Limit */}
            <div className="space-y-3 pt-2">
              <div className="hidden md:flex items-center gap-3">
                {cartQuantity === 0 ? (
                  <button
                    onClick={() => updateCartQuantity(1)}
                    className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-between bg-slate-100 border border-slate-300 rounded-2xl p-1.5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(cartQuantity - 1)}
                      className="w-10 h-10 bg-white hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-900 shadow-xs transition cursor-pointer font-black"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-black text-slate-950">
                      {cartQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(cartQuantity + 1)}
                      disabled={cartQuantity >= effectiveMaxLimit}
                      className="w-10 h-10 bg-white hover:bg-slate-200 disabled:opacity-40 rounded-xl flex items-center justify-center text-slate-900 shadow-xs transition cursor-pointer font-black"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (cartQuantity === 0) updateCartQuantity(1, true);
                    else router.push("/checkout");
                  }}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-white" /> Buy Now
                </button>
              </div>
            </div>

            {product.description && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Product Description</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Verified Reviews */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider">Verified Customer Reviews</h2>
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-black cursor-pointer">
              Write a Review
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <input type="text" required placeholder="Your Name" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold" />
              <textarea required rows={3} placeholder="Write feedback..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="w-full p-2.5 bg-white border rounded-xl text-xs font-medium" />
              <button type="submit" className="px-5 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl cursor-pointer">Post Review</button>
            </form>
          )}

          <div className="space-y-3">
            {reviews.map((rev, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border rounded-2xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs font-black">{rev.userName}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">Verified Buyer</span>
                </div>
                <p className="text-xs text-slate-600">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-white border-t border-slate-200 p-3 px-4 flex items-center gap-3 shadow-2xl">
        <button type="button" onClick={toggleWishlist} className={`p-3 rounded-xl border flex items-center justify-center shrink-0 ${isWishlisted ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-600" : ""}`} />
        </button>

        {cartQuantity === 0 ? (
          <button
            onClick={() => updateCartQuantity(1)}
            className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" /> Add to Cart
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-between bg-slate-100 border border-slate-300 rounded-xl px-2 py-1.5">
            <button
              type="button"
              onClick={() => updateCartQuantity(cartQuantity - 1)}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-900 font-black cursor-pointer shadow-xs"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-black text-slate-950">{cartQuantity}</span>
            <button
              type="button"
              onClick={() => updateCartQuantity(cartQuantity + 1)}
              disabled={cartQuantity >= effectiveMaxLimit}
              className="w-8 h-8 bg-white disabled:opacity-40 rounded-lg flex items-center justify-center text-slate-900 font-black cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={() => {
            if (cartQuantity === 0) updateCartQuantity(1, true);
            else router.push("/checkout");
          }}
          className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Zap className="w-4 h-4" /> Buy Now
        </button>
      </div>
    </div>
  );
}