/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  ShieldCheck,
  ArrowLeft,
  Loader2,
} from "lucide-react";

interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMsg, setCouponMsg] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cb_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, []);

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    setCart(updated);
    localStorage.setItem("cb_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const removeItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    localStorage.setItem("cb_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  // Validate coupon against Admin Database API
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponMsg("");

    try {
      const res = await fetch(`/api/admin/coupons/verify?code=${encodeURIComponent(couponCode.trim())}`);
      const data = await res.json();

      if (data.success && data.coupon) {
        const discountVal = data.coupon.discount || data.coupon.percentage || 10;
        setDiscountPercent(discountVal);
        setCouponApplied(true);
        setCouponMsg(`🎉 Coupon '${data.coupon.code || couponCode.toUpperCase()}' applied! ${discountVal}% OFF`);
      } else {
        // Fallback check: try fetching all public coupons if verify endpoint differs
        const allRes = await fetch("/api/admin/coupons");
        const allData = await allRes.json();
        
        let found = null;
        if (allData.success && Array.isArray(allData.coupons)) {
          found = allData.coupons.find(
            (c: any) => c.code?.toUpperCase() === couponCode.trim().toUpperCase()
          );
        }

        if (found) {
          const discountVal = found.discount || found.percentage || 10;
          setDiscountPercent(discountVal);
          setCouponApplied(true);
          setCouponMsg(`🎉 Coupon applied successfully! (${discountVal}% OFF)`);
        } else {
          setCouponMsg("❌ Invalid or expired coupon code.");
          setCouponApplied(false);
          setDiscountPercent(0);
        }
      }
    } catch {
      setCouponMsg("❌ Error verifying coupon. Please try again.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 60 : 0;
  const discountAmount = couponApplied ? Math.round((subtotal * discountPercent) / 100) : 0;
  const totalPayable = Math.max(0, subtotal + shipping - discountAmount);

  // Proceed to Checkout with Authentication Guard
  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;

    const userSession = localStorage.getItem("cb_user") || localStorage.getItem("user");
    
    if (!userSession) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-xs">
          Explore our trending viral products and add items to your cart.
        </p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/shop"
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 inline-flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
          <span className="text-sm font-black text-slate-950">
            Catch<span className="text-emerald-600">Buddy</span> Cart
          </span>
          <div className="flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        <h1 className="text-xl font-black text-slate-950">Shopping Cart ({cart.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Products List */}
          <div className="lg:col-span-7 space-y-3">
            {cart.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-950 text-xs sm:text-sm line-clamp-1">
                    {item.title}
                  </h3>
                  {(item.selectedSize || item.selectedColor) && (
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {item.selectedSize ? `Size: ${item.selectedSize}` : ""}
                      {item.selectedColor ? ` | Color: ${item.selectedColor}` : ""}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm font-black text-slate-950">₹{item.price}</span>
                    {item.originalPrice > item.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-l-xl transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-r-xl transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Dynamic Admin Coupons & Order Summary */}
          <div className="lg:col-span-5 space-y-4">
            {/* Coupon Section */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <label className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" /> Apply Admin Coupon
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:border-emerald-600"
                />
                <button
                  onClick={applyCoupon}
                  disabled={validatingCoupon}
                  className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[70px]"
                >
                  {validatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                </button>
              </div>
              {couponMsg && (
                <p className={`text-[11px] font-bold ${couponApplied ? "text-emerald-700" : "text-rose-600"}`}>
                  {couponMsg}
                </p>
              )}
            </div>

            {/* Bill Summary */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-950 border-b border-slate-100 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs font-bold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Charges</span>
                  <span className="font-mono text-emerald-700">
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-mono">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-black text-slate-950">
                  <span>Total Payable</span>
                  <span className="font-mono text-emerald-700">₹{totalPayable}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-slate-400 font-medium">
                🔒 Safe and secure checkout with verified encryption.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}