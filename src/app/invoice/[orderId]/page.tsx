/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Printer, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

// Category-wise GST & HSN code mapping
function getProductTaxDetails(title: string = "", categoryName: string = "") {
  const text = `${title} ${categoryName}`.toLowerCase();

  // 5% Slab (Ropes, cotton cloths, cleaning towels)
  if (
    text.includes("cloth") ||
    text.includes("rope") ||
    text.includes("towel") ||
    text.includes("cotton")
  ) {
    return { rate: 5, hsn: "6307" };
  }

  // 12% Slab (Kitchen silicone roti mats, wall hooks, wipers, gloves, scrubbers)
  if (
    text.includes("mat") ||
    text.includes("silicone") ||
    text.includes("wiper") ||
    text.includes("hook") ||
    text.includes("scrub") ||
    text.includes("glove") ||
    text.includes("kitchen")
  ) {
    return { rate: 12, hsn: "3924" };
  }

  // 18% Standard Slab (Earbuds, electronic gadgets, USB blenders)
  return { rate: 18, hsn: "8518" };
}

export default function GSTInvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Extract ID cleanly from URL /invoice/xxx or query param
  const rawId = (params?.orderId as string) || searchParams.get("orderId") || "";
  const orderId = decodeURIComponent(rawId).trim();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Direct single-order API call
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        const data = await res.json();

        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          // Fallback check
          const fallbackRes = await fetch(`/api/orders?orderId=${encodeURIComponent(orderId)}`);
          const fallbackData = await fallbackRes.json();
          const list = fallbackData.orders || [];
          const found = list.find((o: any) => o.id === orderId || o.orderNumber === orderId);
          setOrder(found || list[0] || null);
        }
      } catch (err) {
        console.error("Failed to load invoice order:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-500">Generating Tax Invoice from Database...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 space-y-3 font-sans">
        <p className="text-base font-black text-slate-800">Order not found in database.</p>
        <p className="text-xs font-mono text-slate-500">Order Ref: {orderId}</p>
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  // Real Customer Details Extraction
  const addr = order.shippingAddress || order.address || {};
  const customerRealName =
    addr.fullName ||
    addr.name ||
    order.user?.name ||
    order.customerName ||
    "Valued Customer";

  const customerPhone = addr.phone || order.user?.phone || order.phone || "N/A";
  const customerStreet = addr.street || addr.addressLine1 || addr.address || "Street Address";
  const customerCity = addr.city || "Nagaur";
  const customerState = addr.state || "Rajasthan";
  const customerPincode = addr.pincode || addr.postalCode || "";

  const isInterState = !customerState.toLowerCase().includes("rajasthan");

  // Parse items reliably
  let rawItems = order.items || order.orderItems || [];
  if (typeof rawItems === "string") {
    try {
      rawItems = JSON.parse(rawItems);
    } catch {
      rawItems = [];
    }
  }

  let totalCalculatedTaxable = 0;
  let totalCalculatedCgst = 0;
  let totalCalculatedSgst = 0;
  let totalCalculatedIgst = 0;

  const invoiceItems = rawItems.map((item: any, idx: number) => {
    const qty = Number(item.quantity) || 1;
    const itemPrice = Number(item.price) || 0;
    const grossTotal = itemPrice * qty;

    const title =
      item.product?.title ||
      item.title ||
      item.name ||
      `CatchBuddy Product #${idx + 1}`;

    const catName = item.product?.category?.name || "";
    const { rate, hsn } = getProductTaxDetails(title, catName);

    // Inclusive GST formula: Taxable = Gross / (1 + Rate / 100)
    const taxableValue = grossTotal / (1 + rate / 100);
    const taxAmt = grossTotal - taxableValue;

    totalCalculatedTaxable += taxableValue;

    if (isInterState) {
      totalCalculatedIgst += taxAmt;
    } else {
      totalCalculatedCgst += taxAmt / 2;
      totalCalculatedSgst += taxAmt / 2;
    }

    return {
      id: item.id || idx,
      title,
      hsn,
      qty,
      unitPrice: itemPrice,
      taxableValue,
      rate,
      taxAmt,
      grossTotal,
    };
  });

  const shippingFee = 60; // Standard shipping
  const grandTotal = Number(order.totalAmount) || 0;

  // Fallback if items were empty in legacy record
  if (invoiceItems.length === 0 && grandTotal > 0) {
    const baseVal = grandTotal / 1.18;
    totalCalculatedTaxable = baseVal;
    if (isInterState) {
      totalCalculatedIgst = grandTotal - baseVal;
    } else {
      totalCalculatedCgst = (grandTotal - baseVal) / 2;
      totalCalculatedSgst = (grandTotal - baseVal) / 2;
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 font-sans text-slate-900">
      {/* Top Action Bar (Print button) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Account
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Invoice Document Card */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-300 shadow-md p-8 sm:p-10 rounded-2xl print:m-0 print:p-0 print:border-none print:shadow-none text-slate-900">
        
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start border-b-2 border-slate-900 pb-6 gap-4">
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-950">
              Catch<span className="text-emerald-600">Buddy</span>
            </span>
            <p className="text-[11px] text-slate-600 font-semibold mt-1">
              CatchBuddy Retail &amp; Logistics Logistics Pvt. Ltd.
            </p>
            <p className="text-[11px] text-slate-500">
              Warehouse Hub, Industrial Area, Phase 2, Nagaur, Rajasthan - 341512
            </p>
            <p className="text-[11px] font-bold text-slate-800 mt-0.5">
              GSTIN: <span className="font-mono">08AAACB1206M1Z4</span> • State Code: 08 (Rajasthan)
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-950 text-white text-xs font-black uppercase tracking-widest rounded-md">
              Tax Invoice
            </span>
            <p className="text-xs font-bold text-slate-500 mt-2">
              Invoice No: <strong className="text-slate-900 font-mono">INV-CB-{order.id.slice(-6).toUpperCase()}</strong>
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Date: <strong className="text-slate-900">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong>
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Place of Supply: <strong className="text-slate-900">{customerState}</strong>
            </p>
          </div>
        </div>

        {/* Real Customer & Order Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
          <div className="space-y-1">
            <p className="font-black text-slate-400 uppercase text-[10px] tracking-wider">
              Billed &amp; Shipped To:
            </p>
            <p className="font-black text-slate-950 text-sm">{customerRealName}</p>
            <p className="text-slate-600 font-medium leading-relaxed">
              {customerStreet}, {customerCity}, {customerState} {customerPincode ? `- ${customerPincode}` : ""}
            </p>
            <p className="text-slate-800 font-bold pt-0.5">
              Phone: <span className="font-mono text-slate-900 font-bold">{customerPhone}</span>
            </p>
          </div>

          <div className="space-y-1 sm:text-right">
            <p className="font-black text-slate-400 uppercase text-[10px] tracking-wider">
              Order Information:
            </p>
            <p className="font-bold text-slate-900">
              Order ID: <span className="font-mono">#{order.orderNumber || order.id.slice(-8).toUpperCase()}</span>
            </p>
            <p className="text-slate-600">
              Payment Mode: <strong>{order.paymentMethod || "Prepaid (Online)"}</strong>
            </p>
            <p className="text-slate-600">
              Payment Status:{" "}
              <strong className="text-emerald-700 uppercase font-black">
                {order.paymentStatus || "SUCCESS"}
              </strong>
            </p>
          </div>
        </div>

        {/* Items Table with Real DB Data */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-700 uppercase text-[10px] font-black tracking-wider bg-slate-50">
                <th className="py-2.5 px-2">#</th>
                <th className="py-2.5 px-2">Item Description</th>
                <th className="py-2.5 px-2 text-center">HSN</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-2 text-right">Unit Price</th>
                <th className="py-2.5 px-2 text-right">Taxable</th>
                <th className="py-2.5 px-2 text-center">GST %</th>
                <th className="py-2.5 px-2 text-right">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {invoiceItems.length > 0 ? (
                invoiceItems.map((item: any, idx: number) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-2 text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-2 font-bold text-slate-900 max-w-[240px]">
                      <p className="truncate">{item.title}</p>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600 text-[11px]">
                      {item.hsn}
                    </td>
                    <td className="py-3 px-2 text-center font-bold">{item.qty}</td>
                    <td className="py-3 px-2 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right font-mono">₹{item.taxableValue.toFixed(2)}</td>
                    <td className="py-3 px-2 text-center font-black text-emerald-700">{item.rate}%</td>
                    <td className="py-3 px-2 text-right font-black text-slate-900 font-mono">
                      ₹{item.grossTotal.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 px-2 text-slate-400">1</td>
                  <td className="py-3 px-2 font-bold text-slate-900">Store Order Package Items</td>
                  <td className="py-3 px-2 text-center font-mono text-slate-600">8518</td>
                  <td className="py-3 px-2 text-center font-bold">1</td>
                  <td className="py-3 px-2 text-right font-mono">₹{grandTotal.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right font-mono">₹{totalCalculatedTaxable.toFixed(2)}</td>
                  <td className="py-3 px-2 text-center font-black text-emerald-700">18%</td>
                  <td className="py-3 px-2 text-right font-black text-slate-900 font-mono">
                    ₹{grandTotal.toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Section without Breakdown Box */}
        <div className="border-t-2 border-slate-300 pt-5 flex flex-col sm:flex-row justify-between items-start text-xs gap-6">
          <div className="max-w-xs space-y-1.5 text-slate-500 text-[11px]">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Authorized Computer Generated Invoice
            </p>
            <p>
              This is an authentic electronically verified invoice. No physical signature is required.
            </p>
            <p className="text-slate-400 text-[10px] pt-1">
              Goods covered under verified warranty as per company terms.
            </p>
          </div>

          <div className="w-full sm:w-80 space-y-2 text-slate-700 text-xs">
            <div className="flex justify-between">
              <span>Total Taxable Value:</span>
              <span className="font-mono font-semibold text-slate-900">
                ₹{totalCalculatedTaxable.toFixed(2)}
              </span>
            </div>

            {isInterState ? (
              <div className="flex justify-between">
                <span>Integrated GST (IGST):</span>
                <span className="font-mono font-semibold text-slate-900">
                  ₹{totalCalculatedIgst.toFixed(2)}
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Central GST (CGST):</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ₹{totalCalculatedCgst.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>State GST (SGST):</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ₹{totalCalculatedSgst.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between">
              <span>Standard Shipping &amp; Handling:</span>
              <span className="font-mono font-semibold text-slate-900">
                ₹{shippingFee.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-base font-black text-slate-950">
              <span>Grand Total:</span>
              <span className="font-mono text-emerald-600">₹{grandTotal.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-slate-400 text-right italic">
              All taxes &amp; logistics inclusive
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-semibold">
          Thank you for shopping with CatchBuddy! For support inquiries: support@catchbuddy.store
        </div>

      </div>
    </div>
  );
}