/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  CreditCard,
  Banknote,
} from "lucide-react";
import Header from "@/components/Header";
import { auth } from "@/lib/firebase"; // Aapke firebase export file ka path (jaise '@/lib/firebase' ya jahan bhi app setup hai)
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Address Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [paymentMode, setPaymentMode] = useState<"PREPAID" | "COD">("PREPAID");

  // Firebase COD OTP States
  const [showCodModal, setShowCodModal] = useState(false);
  const [codOtp, setCodOtp] = useState("");
  const [isVerifyingCod, setIsVerifyingCod] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // 1. Authentication Check
    const userSession = localStorage.getItem("cb_user") || localStorage.getItem("user");
    if (!userSession) {
      router.push("/login?redirect=/checkout");
      return;
    }

    try {
      const userData = JSON.parse(userSession);
      if (userData?.name) {
        setFormData((prev) => ({
          ...prev,
          fullName: userData.name,
          phone: userData.phone || userData.identifier || "",
        }));
      }
    } catch {
      // ignore
    }

    // 2. Load Saved Addresses from localStorage & past orders
    try {
      const loadedAddrs: SavedAddress[] = [];
      const localAddrs = localStorage.getItem("cb_saved_addresses");
      if (localAddrs) {
        loadedAddrs.push(...JSON.parse(localAddrs));
      }

      const pastOrders = localStorage.getItem("cb_orders");
      if (pastOrders) {
        const orders = JSON.parse(pastOrders);
        orders.forEach((ord: any, idx: number) => {
          if (ord.shippingAddress) {
            loadedAddrs.push({
              id: `past-${idx}`,
              ...ord.shippingAddress,
            });
          }
        });
      }

      const uniqueAddrs = Array.from(new Set(loadedAddrs.map((a) => a.pincode))).map(
        (pin) => loadedAddrs.find((a) => a.pincode === pin)!
      );

      setSavedAddresses(uniqueAddrs);
    } catch {
      setSavedAddresses([]);
    }

    // 3. Load Cart
    try {
      const saved = localStorage.getItem("cb_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        } else {
          router.push("/cart");
        }
      } else {
        router.push("/cart");
      }
    } catch {
      router.push("/cart");
    }
  }, [router]);

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      pincode: addr.pincode,
    });
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 60 : 0;

  const appliedCouponStr = typeof window !== "undefined" ? localStorage.getItem("cb_applied_coupon") : null;
  let discountAmount = 0;
  let couponName = "";

  if (appliedCouponStr) {
    try {
      const cData = JSON.parse(appliedCouponStr);
      couponName = cData.code;
      const val = Number(cData.value || 0);
      if (cData.type === "FLAT") {
        discountAmount = Math.min(subtotal, val);
      } else if (cData.type === "PERCENT") {
        discountAmount = Math.round((subtotal * val) / 100);
      }
    } catch {
      // ignore
    }
  }

  const totalPayable = Math.max(0, subtotal + shipping - discountAmount);

  // Initialize Firebase Recaptcha and send OTP via Firebase Console
  const setupRecaptchaAndSendOtp = async () => {
    if (!auth) {
      alert("Firebase Auth is not initialized.");
      return;
    }

    let phoneNum = formData.phone.trim();
    if (!phoneNum.startsWith("+")) {
      phoneNum = "+91" + phoneNum; // Assuming Indian numbers (+91)
    }

    try {
      setIsVerifyingCod(true);

      // Setup invisible recaptcha verifier
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
        });
      }

      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNum, appVerifier);
      
      setConfirmationResult(confirmation);
      setShowCodModal(true);
      setIsVerifyingCod(false);
    } catch (err: any) {
      console.error("Firebase OTP Error:", err);
      alert("Failed to send OTP via Firebase: " + (err.message || "Unknown error"));
      setIsVerifyingCod(false);
    }
  };

  const handlePlaceOrderClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address || !formData.pincode || !formData.city) {
      alert("Kripya saare delivery address fields bharein!");
      return;
    }

    try {
      const newAddr: SavedAddress = {
        id: Date.now().toString(),
        ...formData,
      };
      const existing = JSON.parse(localStorage.getItem("cb_saved_addresses") || "[]");
      localStorage.setItem("cb_saved_addresses", JSON.stringify([newAddr, ...existing]));
    } catch {
      // ignore
    }

    if (paymentMode === "COD") {
      // Trigger Firebase Phone Auth OTP
      void setupRecaptchaAndSendOtp();
    } else {
      executeRazorpayPayment();
    }
  };

  const executeRazorpayPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/create-razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPayable,
          items: cart,
          shippingAddress: formData,
          discount: discountAmount,
          couponCode: couponName,
        }),
      });
      const orderData = await res.json();

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to initialize payment gateway");
      }

      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_123456789",
        amount: orderData.amount,
        currency: "INR",
        name: "CatchBuddy",
        description: "Secure Online Order Payment",
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/orders/verify-razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cart,
              shippingAddress: formData,
              totalAmount: totalPayable,
              discount: discountAmount,
              couponCode: couponName,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            localStorage.removeItem("cb_cart");
            localStorage.removeItem("cb_applied_coupon");
            window.dispatchEvent(new Event("storage"));
            router.push(`/order-success?orderId=${verifyData.orderId}`);
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },
        theme: {
          color: "#16a34a",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Payment gateway error");
    } finally {
      setLoading(false);
    }
  };

  // Verify Firebase OTP Code entered by user
  const handleVerifyFirebaseOtpAndPlaceOrder = async () => {
    if (!codOtp || codOtp.length < 6 || !confirmationResult) {
      alert("Kripya valid 6-digit Firebase verification code daalein!");
      return;
    }

    setIsVerifyingCod(true);
    try {
      // Confirm OTP with Firebase
      await confirmationResult.confirm(codOtp);

      // If Firebase OTP confirmation succeeds, place COD Order in Database
      const res = await fetch("/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          shippingAddress: formData,
          paymentMethod: "COD",
          totalAmount: totalPayable,
          discount: discountAmount,
          couponCode: couponName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem("cb_cart");
        localStorage.removeItem("cb_applied_coupon");
        window.dispatchEvent(new Event("storage"));
        router.push(`/order-success?orderId=${data.orderId}`);
      } else {
        alert("Order error: " + (data.error || "Unknown"));
      }
    } catch (err: any) {
      console.error("OTP Verification Error:", err);
      alert("Invalid verification code. Please try again.");
    } finally {
      setIsVerifyingCod(false);
      setShowCodModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 font-sans">
      <Header />

      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      {/* Invisible Recaptcha Container required by Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <form onSubmit={handlePlaceOrderClick} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            {savedAddresses.length > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Select Saved Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className="p-3.5 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 bg-slate-50/50 cursor-pointer transition space-y-1"
                    >
                      <p className="text-xs font-black text-slate-950">{addr.fullName}</p>
                      <p className="text-[11px] text-slate-600 line-clamp-1">{addr.address}, {addr.city} - {addr.pincode}</p>
                      <p className="text-[10px] font-bold text-emerald-700">Phone: {addr.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="w-4 h-4 text-emerald-600" /> Enter Delivery Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number (10 digits) *</label>
                  <input
                    required
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">House No, Building, Street / Colony *</label>
                <input
                  required
                  type="text"
                  placeholder="Street name, landmark..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City / District *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Udaipur"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Pincode *</label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 313001"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-950 border-b border-slate-100 pb-3">
                Choose Payment Method
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentMode("PREPAID")}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                    paymentMode === "PREPAID"
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-black text-slate-950">Prepaid Online (Razorpay)</p>
                      <p className="text-[10px] text-slate-500">UPI, Cards, NetBanking</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMode === "PREPAID" ? "border-emerald-600 bg-emerald-600" : "border-slate-300"}`}>
                    {paymentMode === "PREPAID" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMode("COD")}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                    paymentMode === "COD"
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-xs font-black text-slate-950">Cash on Delivery</p>
                      <p className="text-[10px] text-slate-500">Requires Firebase Console OTP</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMode === "COD" ? "border-emerald-600 bg-emerald-600" : "border-slate-300"}`}>
                    {paymentMode === "COD" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-950 border-b border-slate-100 pb-3">
                Order Items Summary ({cart.length})
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-black text-slate-950">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs font-bold text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-700">₹{shipping}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({couponName})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-black text-slate-950">
                  <span>Total Payable</span>
                  <span className="text-emerald-700">₹{totalPayable}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isVerifyingCod}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading || isVerifyingCod ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {paymentMode === "PREPAID" ? `Pay Online via Razorpay ₹${totalPayable}` : "Verify via Firebase OTP & Place Order"}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Firebase OTP Modal */}
      {showCodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl relative text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-950">Firebase Phone Verification</h3>
            <p className="text-xs text-slate-500">
              Enter the OTP sent by Google Firebase Console to <b>{formData.phone}</b>.
            </p>

            <input
              type="text"
              maxLength={6}
              placeholder="• • • • • •"
              value={codOtp}
              onChange={(e) => setCodOtp(e.target.value)}
              className="w-full text-center tracking-[10px] text-lg font-black p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
            />

            <button
              type="button"
              onClick={handleVerifyFirebaseOtpAndPlaceOrder}
              disabled={isVerifyingCod}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isVerifyingCod ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Confirm OTP &amp; Place Order
            </button>
            <button
              type="button"
              onClick={() => setShowCodModal(false)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}