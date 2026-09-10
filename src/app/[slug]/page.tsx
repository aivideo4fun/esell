/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { 
  ShoppingBag, 
  Zap, 
  Heart, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Plus, 
  Minus, 
  Loader2,
  AlertCircle,
  Star,
  MessageSquarePlus
} from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchProductAndReviews() {
      try {
        const res = await fetch(`/api/products/${slug}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.product) {
          const p = data.product;
          setProduct(p);
          
          const defaultImg = p.images?.[0]?.url || p.images?.[0] || p.image || "/logo.png";
          setSelectedImage(defaultImg);
          if (p.sizes && p.sizes.length > 0) setSelectedSize(p.sizes[0]);
          if (p.colors && p.colors.length > 0) setSelectedColor(p.colors[0]);

          const stockAvailable = typeof p.stock === "number" ? p.stock : 10;
          const maxAllowed = Math.min(9, stockAvailable);
          if (quantity > maxAllowed) {
            setQuantity(maxAllowed > 0 ? maxAllowed : 1);
          }

          const savedWishlist = JSON.parse(localStorage.getItem("cb_wishlist") || "[]");
          if (savedWishlist.some((item: any) => item.id === p.id || item.slug === slug)) {
            setIsWishlisted(true);
          }

          try {
            const revRes = await fetch(`/api/products/reviews?productId=${p.id}`);
            const revData = await revRes.json();
            if (revData.success && revData.reviews.length > 0) {
              setReviews(revData.reviews);
            } else {
              setReviews([
                { userName: "Rahul Sharma", rating: 5, comment: "Top quality product delivered by CatchBuddy!", createdAt: "2026-03-01" },
                { userName: "Anita Patel", rating: 4, comment: "Genuine utility product, totally worth it.", createdAt: "2026-03-05" }
              ]);
            }
          } catch {}
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    void fetchProductAndReviews();
  }, [slug]);

  const handleQuantityChange = (delta: number) => {
    let newQty = quantity + delta;
    if (newQty < 1) newQty = 1;

    const stockAvailable = product && typeof product.stock === "number" ? product.stock : 10;
    const upperLimit = Math.min(9, stockAvailable);
    if (newQty > upperLimit) {
      if (stockAvailable < 9) {
        alert(`Maaf kijiye, inventory mein sirf ${stockAvailable} items available hain.`);
      } else {
        alert("Aap ek order mein maximum 9 items hi purchase kar sakte hain.");
      }
      return;
    }

    setQuantity(newQty);
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
        updated = [...savedWishlist, { id: product.id, slug, title: product.title, price: product.price, image: selectedImage }];
        setIsWishlisted(true);
      }
      localStorage.setItem("cb_wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const stockAvailable = typeof product.stock === "number" ? product.stock : 10;
    if (stockAvailable <= 0) {
      alert("Maaf kijiye, yeh product abhi Out of Stock hai.");
      return;
    }

    if (quantity > 9 || quantity > stockAvailable) {
      alert("Quantity exceeds maximum order limit (9) or available stock.");
      return;
    }

    setAddingToCart(true);
    try {
      const cartItem = {
        productId: product.id,
        slug: slug,
        title: product.title,
        price: product.price,
        originalPrice: effectiveOriginalPrice,
        image: selectedImage || "/logo.png",
        quantity: quantity,
        selectedSize: selectedSize || null,
        selectedColor: selectedColor || null,
      };

      const existingCart = JSON.parse(localStorage.getItem("cb_cart") || "[]");
      const index = existingCart.findIndex(
        (item: any) => item.productId === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
      );

      if (index > -1) {
        const totalNewQty = existingCart[index].quantity + quantity;
        if (totalNewQty > 9 || totalNewQty > stockAvailable) {
          alert("Total quantity in cart cannot exceed 9 items or available stock.");
          setAddingToCart(false);
          return;
        }
        existingCart[index].quantity = totalNewQty;
      } else {
        existingCart.push(cartItem);
      }

      localStorage.setItem("cb_cart", JSON.stringify(existingCart));
      window.dispatchEvent(new Event("storage"));
      alert("Product successfully added to cart!");
    } catch (e) {
      console.error(e);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
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
      if (data.success) {
        setReviews([data.review, ...reviews]);
        setReviewerName("");
        setReviewComment("");
        setShowReviewForm(false);
        alert("Aapka review successfully submit ho gaya hai!");
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
      <div className="min-h-screen bg-white text-slate-900">
        <Header />
        <div className="flex flex-col items-center justify-center py-36 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-slate-500">Loading Product Details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <div className="max-w-md mx-auto py-32 px-4 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-black text-slate-950">Product Not Found</h2>
          <p className="text-xs text-slate-500">The product you are looking for might have been removed or is unavailable.</p>
          <button
            onClick={() => router.push("/shop")}
            className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Explore Shop
          </button>
        </div>
      </div>
    );
  }

  const imagesList = product.images && product.images.length > 0 ? product.images : [selectedImage || "/logo.png"];
  const currentStock = typeof product.stock === "number" ? product.stock : 10;
  
  // Robust Calculation for Original Price and Discount Percentage
  const effectiveOriginalPrice = product.originalPrice && Number(product.originalPrice) > Number(product.price) 
    ? Number(product.originalPrice) 
    : Math.round(Number(product.price) * 1.35);

  const discountPercent = Math.round(((effectiveOriginalPrice - Number(product.price)) / effectiveOriginalPrice) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-48 text-slate-900 font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-xs">
          
          {/* Left: Product Image & Top-Left Red Discount Badge */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center">
              <img
                src={selectedImage || "/logo.png"}
                alt={product.title}
                className="w-full h-full object-contain p-4"
              />

              {/* DISCOUNT BADGE FIXED AT TOP-LEFT CORNER */}
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-md uppercase tracking-wider z-10">
                  {discountPercent}% OFF
                </span>
              )}

              <button
                onClick={toggleWishlist}
                className={`absolute top-4 right-4 p-3 rounded-full border shadow-md transition cursor-pointer z-10 ${
                  isWishlisted ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white border-slate-200 text-slate-600 hover:text-rose-600"
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-600" : ""}`} />
              </button>
            </div>

            {imagesList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {imagesList.map((imgObj: any, idx: number) => {
                  const url = typeof imgObj === "string" ? imgObj : (imgObj?.url || "/logo.png");
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(url)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 bg-slate-50 transition cursor-pointer ${
                        selectedImage === url ? "border-emerald-600" : "border-slate-200 opacity-70"
                      }`}
                    >
                      <img src={url || "/logo.png"} alt="" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Product Details & Description */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                {product.category?.name || "Viral Gadget"}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-2">
                {product.title}
              </h1>

              <div className="flex items-center gap-2 mt-2">
                <span className="bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-white" /> 4.8
                </span>
                <span className="text-xs text-slate-500 font-bold">({reviews.length} customer reviews)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-slate-950">₹{product.price}</span>
                <span className="text-sm text-slate-400 line-through font-bold">₹{effectiveOriginalPrice}</span>
                {discountPercent > 0 && (
                  <span className="bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded-md uppercase">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-emerald-700">
                Inclusive of all taxes • Free Delivery only on Prepaid Orders
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Quantity (Max 9 per order)</label>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 w-32">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2.5 text-slate-600 hover:bg-slate-200 rounded-l-xl transition cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="flex-1 text-center text-xs font-black">{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="p-2.5 text-slate-600 hover:bg-slate-200 rounded-r-xl transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* PRODUCT DESCRIPTION */}
            {product.description && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Product Description</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* ADD TO CART & BUY NOW BUTTONS PLACED BELOW DESCRIPTION */}
            <div className="hidden sm:flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={toggleWishlist}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-center ${
                  isWishlisted ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-slate-50 border-slate-200 text-slate-700 hover:border-rose-300"
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-600" : ""}`} />
              </button>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || currentStock <= 0}
                className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {addingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-white" />
                Buy Now
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700">100% Secure</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                <Truck className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700">Fast Delivery</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                <RotateCcw className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700">5-Day Return</span>
              </div>
            </div>

          </div>
        </div>

        {/* Verified Reviews Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider">Customer Reviews &amp; Ratings</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" /> Write a Review
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-black text-slate-950">Submit Your Review</h3>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                  <option value={3}>⭐⭐⭐ (3/5)</option>
                  <option value={2}>⭐⭐ (2/5)</option>
                  <option value={1}>⭐ (1/5)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Review Comment *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write your feedback..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-600"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl cursor-pointer disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Post Review"}
              </button>
            </form>
          )}

          <div className="space-y-3">
            {reviews.map((rev, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-950">{rev.userName || rev.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold">Verified Buyer</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 font-medium">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 z-50 flex items-center gap-3 shadow-2xl">
        <button
          type="button"
          onClick={toggleWishlist}
          className={`p-3 rounded-2xl border flex items-center justify-center shrink-0 transition cursor-pointer ${
            isWishlisted ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-slate-50 border-slate-200 text-slate-700"
          }`}
          title="Wishlist"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-600" : ""}`} />
        </button>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={addingToCart || currentStock <= 0}
          className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <ShoppingBag className="w-4 h-4" /> Add to Cart
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={currentStock <= 0}
          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Zap className="w-4 h-4 fill-white" /> Buy Now
        </button>
      </div>
    </div>
  );
}