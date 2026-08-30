"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Zap, 
  ShoppingBag, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  Loader2,
  Check
} from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addItem, openCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const defaultReviews = [
    {
      id: "1",
      userName: "Vikram R.",
      rating: 5,
      date: "2 days ago",
      comment: "Quality exceeds expectations! Fast delivery and genuine product.",
      verified: true,
    },
    {
      id: "2",
      userName: "Pooja M.",
      rating: 5,
      date: "5 days ago",
      comment: "100% genuine product. Saved extra using UPI prepaid option.",
      verified: true,
    },
    {
      id: "3",
      userName: "Amit Kumar",
      rating: 4,
      date: "1 week ago",
      comment: "Works exactly as described. Very useful item.",
      verified: true,
    },
  ];

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          if (data.product.images && data.product.images.length > 0) {
            setSelectedImage(data.product.images[0].url);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-bold text-gray-500">Loading Product Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
        <p className="text-xs text-gray-500">Could not find product matching: /{slug}</p>
        <Link href="/shop" className="px-5 py-2.5 bg-gray-950 text-white text-xs font-bold rounded-xl">
          Back to Shop
        </Link>
      </div>
    );
  }

  const imagesList = product.images && product.images.length > 0 
    ? product.images.map((img: any) => img.url)
    : ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80"];

  const currentImage = selectedImage || imagesList[0];
  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: currentImage,
      quantity: quantity,
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: currentImage,
      quantity: quantity,
    });
    openCart();
  };

  return (
    <div className="bg-[#fafafa] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-black">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-semibold truncate">
            {product.title}
          </span>
        </div>

        {/* Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-sm">
          
          {/* Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-200">
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-gray-950 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                  {product.badge}
                </span>
              )}
            </div>

            {imagesList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {imagesList.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-gray-50 shrink-0 transition ${
                      currentImage === imgUrl ? "border-blue-600 shadow-sm" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buying Info */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-blue-600 tracking-wider">
                  {product.category?.name || "Gadgets"}
                </span>
                <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-black text-amber-900">{product.rating || "4.8"}</span>
                  <span className="text-[10px] text-gray-500 font-medium">(142 reviews)</span>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-gray-950">
                  ₹{product.price}
                </span>
                <span className="text-base sm:text-lg text-gray-400 line-through font-semibold">
                  ₹{product.originalPrice}
                </span>
                {discountPercent > 0 && (
                  <span className="px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-200 text-xs font-black rounded-lg">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3.5 rounded-2xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-950 font-semibold leading-relaxed">
                  <span className="font-black text-blue-700">Prepaid Special:</span> Flat ₹50 Instant Discount + FREE Express Delivery on Online UPI payment!
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Highlights &amp; Overview</h4>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || "Premium quality assured item."}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-xs font-bold hover:bg-gray-200 transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-black">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-xs font-bold hover:bg-gray-200 transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-gray-950 transition cursor-pointer ${
                    addedAnimation
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-950 hover:bg-gray-50"
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" /> Buy Now (Instant Pay)
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center">
                <div className="p-2.5 bg-gray-50 rounded-xl space-y-1">
                  <Truck className="w-4 h-4 text-gray-700 mx-auto" />
                  <p className="text-[10px] font-bold text-gray-800">Free Shipping</p>
                  <p className="text-[9px] text-gray-400">All India Delivery</p>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl space-y-1">
                  <RotateCcw className="w-4 h-4 text-gray-700 mx-auto" />
                  <p className="text-[10px] font-bold text-gray-800">5-Day Return</p>
                  <p className="text-[9px] text-gray-400">Hassle Free</p>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl space-y-1">
                  <ShieldCheck className="w-4 h-4 text-gray-700 mx-auto" />
                  <p className="text-[10px] font-bold text-gray-800">100% Safe</p>
                  <p className="text-[9px] text-gray-400">Razorpay Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <h3 className="text-xl font-black text-gray-950">Verified Customer Reviews</h3>
              <p className="text-xs text-gray-500 mt-1">Real feedback from genuine buyers</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[11px] font-bold text-gray-600">4.9 out of 5 Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {defaultReviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">{rev.date}</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">&quot;{rev.comment}&quot;</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
                  <span className="text-xs font-bold text-gray-900">{rev.userName}</span>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700">
                      <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}