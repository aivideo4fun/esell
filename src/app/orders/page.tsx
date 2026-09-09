"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Truck,
  Calendar,
  Loader2,
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckCircle2,
  RotateCcw,
  Upload,
  X,
  Camera,
} from "lucide-react";

interface ProductItem {
  id: string;
  productId?: string;
  price: number;
  quantity: number;
  title?: string;
  image?: string;
  selectedSize?: string | null;
  selectedColor?: string | null;
  product?: {
    id?: string;
    slug?: string;
    title: string;
    images?: Array<{ url: string }>;
  };
}

interface CustomerOrder {
  id: string;
  orderNumber?: string | null;
  createdAt: string;
  totalAmount: number;
  orderStatus?: string;
  paymentStatus?: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items?: ProductItem[];
  userName?: string;
  phone?: string;
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const justPlacedId = searchParams.get("placed");

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Return Modal States
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnImageFiles, setReturnImageFiles] = useState<File[]>([]);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      try {
        setLoading(true);
        const query = justPlacedId ? `?orderId=${encodeURIComponent(justPlacedId)}` : "";
        const res = await fetch(`/api/orders${query}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Failed to load customer orders:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchCustomerOrders();
  }, [justPlacedId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const chosenFiles = Array.from(e.target.files);
      const totalCombined = [...returnImageFiles, ...chosenFiles];
      if (totalCombined.length > 5) {
        alert("You can upload a maximum of 5 photos.");
        setReturnImageFiles(totalCombined.slice(0, 5));
      } else {
        setReturnImageFiles(totalCombined);
      }
    }
  };

  const removeFile = (index: number) => {
    const updated = returnImageFiles.filter((_, i) => i !== index);
    setReturnImageFiles(updated);
  };

  const getWordCount = (text: string) => {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = window.document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = window.document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          const MAX_DIMENSION = 600;
          if (width > height) {
            if (width > MAX_DIMENSION) {
              height *= MAX_DIMENSION / width;
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width *= MAX_DIMENSION / height;
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.6));
        };
      };
    });
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const wordCount = getWordCount(returnDescription);
    if (wordCount < 30) {
      alert(`Description must be at least 30 words. Current count: ${wordCount} words.`);
      return;
    }
    if (wordCount > 200) {
      alert(`Description cannot exceed 200 words. Current count: ${wordCount} words.`);
      return;
    }

    if (returnImageFiles.length < 2) {
      alert("Please upload at least 2 photos from your gallery or camera (compulsory).");
      return;
    }

    setSubmittingReturn(true);

    try {
      // Compress proof photos into lightweight base64 strings
      const compressedImages = await Promise.all(
        returnImageFiles.map((file) => compressImage(file))
      );

      const fullReasonNote = `${returnReason} - Note: ${returnDescription}`;

      // Correct endpoint: /api/customer/returns with images array included
      const res = await fetch("/api/customer/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          reason: fullReasonNote,
          images: compressedImages,
        }),
      });

      const data = await res.json();
      if (data.success || res.ok) {
        setReturnSuccess(true);
        setTimeout(() => {
          setReturnSuccess(false);
          setSelectedOrder(null);
          setReturnReason("");
          setReturnDescription("");
          setReturnImageFiles([]);
          window.location.reload();
        }, 2000);
      } else {
        alert(data.error || "Failed to submit return request");
      }
    } catch (err) {
      console.error(err);
      alert("Network error submitting return. Please try again.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PROCESSING":
      case "PAID":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300";
      case "RETURN_REQUESTED":
      case "RETURN_APPROVED":
      case "RETURN_PICKUP":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "RETURNED":
      case "REFUNDED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-500">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-900 font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-700 inline-flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <span className="text-sm font-black text-slate-950">
            Catch<span className="text-emerald-600">Buddy</span> Orders
          </span>
          <Link
            href="/shop"
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Shop More
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 mt-6 space-y-5">
        {justPlacedId && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-xs font-black text-emerald-950">Order Placed Successfully!</h3>
              <p className="text-[11px] text-emerald-800 font-medium">
                Thank you for your purchase. We are preparing your order for express dispatch.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">My Orders</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Review and track all your CatchBuddy purchases
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-black text-slate-800">No Orders Placed Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Looks like you haven&apos;t made your first purchase. Explore trending deals and gadgets now!
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              const orderStatus = (order.orderStatus || "PAID").toUpperCase();
              const isDelivered = orderStatus === "DELIVERED";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4 hover:border-slate-300 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                      <p className="font-mono font-black text-slate-900">
                        #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                      <p className="font-semibold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formattedDate}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid</span>
                      <p className="font-black text-emerald-600">₹{order.totalAmount?.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(
                          orderStatus
                        )}`}
                      >
                        {orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {order.items?.map((item) => {
                      const itemTitle = item.product?.title || item.title || "CatchBuddy Product";
                      const itemImg =
                        item.product?.images?.[0]?.url ||
                        item.image ||
                        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80";
                      const productTargetId = item.product?.slug || item.product?.id || item.productId || item.id;

                      return (
                        <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                          <Link href={`/product/${productTargetId}`} className="flex items-center gap-3 group">
                            <Image
                              src={itemImg}
                              alt={itemTitle}
                              width={52}
                              height={52}
                              className="w-13 h-13 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0 group-hover:border-emerald-500 transition"
                              unoptimized
                            />
                            <div>
                              <p className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition">{itemTitle}</p>
                              <div className="text-[11px] text-slate-400 font-medium space-x-2 mt-0.5">
                                <span>Qty: {item.quantity}</span>
                                {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                                {item.selectedColor && <span>• Color: {item.selectedColor}</span>}
                              </div>
                            </div>
                          </Link>
                          <span className="font-bold text-xs text-slate-900 whitespace-nowrap">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Payment: <strong className="text-slate-800">{order.paymentStatus || "SUCCESS"}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Return button visible ONLY when status is DELIVERED */}
                      {isDelivered && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 rounded-xl transition border border-rose-200 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Return / Refund
                        </button>
                      )}

                      <Link
                        href={`/invoice/${order.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition border border-slate-200"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" /> Invoice
                      </Link>

                      {order.trackingUrl && !order.trackingUrl.includes("[RETURN_REQUESTED]") ? (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl transition"
                        >
                          <Truck className="w-3.5 h-3.5" /> Track Live <ArrowRight className="w-3 h-3" />
                        </a>
                      ) : (
                        <Link
                          href={`/orders/track?orderId=${order.orderNumber || order.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl transition"
                        >
                          <Truck className="w-3.5 h-3.5" /> Track Status <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Return Request Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-950">Request Return &amp; Refund</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Order #{selectedOrder.orderNumber || selectedOrder.id.slice(-8).toUpperCase()} • Delivered on {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs font-bold text-emerald-700 mt-1">Total Paid: ₹{selectedOrder.totalAmount?.toLocaleString("en-IN")}</p>
            </div>

            {returnSuccess ? (
              <div className="py-10 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-black text-slate-900">Return Request Submitted Successfully!</h4>
                <p className="text-xs text-slate-500">Our admin team will review your request and process the refund.</p>
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Return *</label>
                  <select
                    required
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                  >
                    <option value="">-- Select Return Reason --</option>
                    <option value="Quality not as expected">Quality not as expected</option>
                    <option value="Received damaged or defective item">Received damaged or defective item</option>
                    <option value="Wrong item delivered">Wrong item delivered</option>
                    <option value="Size or fit issue">Size or fit issue</option>
                    <option value="Other reason">Other reason</option>
                  </select>
                </div>

                {/* Detailed Description Field (Min 30 words, Max 200 words) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Detailed Description * (30 - 200 words)</label>
                    <span className={`text-[10px] font-bold ${getWordCount(returnDescription) < 30 || getWordCount(returnDescription) > 200 ? "text-rose-600" : "text-emerald-600"}`}>
                      {getWordCount(returnDescription)} words
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please explain the reason in detail (minimum 30 words required)..."
                    value={returnDescription}
                    onChange={(e) => setReturnDescription(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-600"
                  />
                  {getWordCount(returnDescription) > 0 && getWordCount(returnDescription) < 30 && (
                    <p className="text-[10px] text-rose-600 mt-0.5">Please write at least {30 - getWordCount(returnDescription)} more words.</p>
                  )}
                </div>

                {/* Upload Photos from Gallery/Camera (Min 2 Compulsory, Max 5) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-600" /> Proof Photos (Min 2 Compulsory, Max 5)
                    </label>
                    <span className="text-[10px] text-slate-400 font-bold">{returnImageFiles.length}/5 uploaded</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {returnImageFiles.map((file, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-rose-600 transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {returnImageFiles.length < 5 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition text-slate-400 hover:text-emerald-600">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[9px] font-bold">Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {returnImageFiles.length < 2 && (
                    <p className="text-[10px] text-rose-600">Please upload at least 2 photos from your gallery or camera.</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingReturn || getWordCount(returnDescription) < 30 || getWordCount(returnDescription) > 200 || returnImageFiles.length < 2}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingReturn && <Loader2 className="w-4 h-4 animate-spin" />} Submit Return Appeal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-slate-500">Loading your orders...</p>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}