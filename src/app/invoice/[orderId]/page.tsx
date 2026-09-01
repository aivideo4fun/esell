/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Printer, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface OrderData {
  id: string;
  orderNumber?: string;
  createdAt: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  address?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    id: string;
    price: number;
    quantity: number;
    product: {
      title: string;
      sku?: string;
    };
  }>;
}

export default function GSTInvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Handle both dynamic route (/invoice/123) and query parameter fallback (/invoice/123?orderId=123)
  const orderId = (params?.orderId as string) || searchParams.get("orderId") || "";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderInvoice = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/orders?orderId=${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (data.success && data.orders && data.orders.length > 0) {
          const found = data.orders.find(
            (o: any) => o.id === orderId || o.orderNumber === orderId
          );
          setOrder(found || data.orders[0] || null);
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error("Failed to load invoice", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderInvoice();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-500">Generating GST Tax Invoice...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50 space-y-3">
        <p className="text-base font-black text-slate-800">Order not found for this invoice.</p>
        <p className="text-xs text-slate-500">ID: {orderId || "No ID passed"}</p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  const totalAmount = order.totalAmount || 0;
  const taxableValue = Math.round((totalAmount / 1.18) * 100) / 100;
  const totalGst = Math.round((totalAmount - taxableValue) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst / 2) * 100) / 100;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      {/* Action Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-300 shadow-lg p-8 sm:p-10 rounded-2xl print:m-0 print:p-0 print:border-none print:shadow-none text-slate-900 font-sans">
        
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start border-b-2 border-slate-900 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-slate-950">
                Catch<span className="text-emerald-600">Buddy</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              CatchBuddy Retail &amp; Logistics Private Limited
            </p>
            <p className="text-[11px] text-slate-500">Warehouse Complex, Sector 62, Noida, UP, 201301</p>
            <p className="text-[11px] font-bold text-slate-800 mt-1">
              GSTIN: <span className="font-mono">07AAAAA0000A1Z5</span>
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
              Date: <strong className="text-slate-900">{new Date(order.createdAt).toLocaleDateString("en-IN")}</strong>
            </p>
          </div>
        </div>

        {/* Address Details */}
        <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
          <div className="space-y-1">
            <p className="font-black text-slate-400 uppercase text-[10px] tracking-wider">Billed &amp; Shipped To:</p>
            <p className="font-bold text-slate-950 text-sm">{order.address?.fullName || "CatchBuddy Customer"}</p>
            <p className="text-slate-600 font-medium">
              {order.address?.street ? `${order.address.street}, ` : ""}
              {order.address?.city ? `${order.address.city}, ` : ""}
              {order.address?.state ? `${order.address.state} - ` : ""}
              {order.address?.pincode || ""}
            </p>
            <p className="text-slate-700 font-semibold pt-1">Phone: {order.address?.phone || "N/A"}</p>
            <p className="text-slate-500">State Code: 07 (Delhi/NCR)</p>
          </div>

          <div className="space-y-1 text-right">
            <p className="font-black text-slate-400 uppercase text-[10px] tracking-wider">Order Details:</p>
            <p className="font-bold text-slate-900">Order ID: #{order.orderNumber || order.id.slice(-8).toUpperCase()}</p>
            <p className="text-slate-600">Payment Mode: <strong>{order.paymentMethod || "Prepaid (Online)"}</strong></p>
            <p className="text-slate-600">
              Payment Status: <strong className="text-emerald-700 uppercase">{order.paymentStatus || "PAID"}</strong>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-700 uppercase text-[10px] font-black tracking-wider">
                <th className="py-2.5">#</th>
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-center">HSN Code</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Unit Price</th>
                <th className="py-2.5 text-right">Taxable Amt</th>
                <th className="py-2.5 text-right">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {order.items?.map((item, idx) => {
                const itemTotal = item.price * item.quantity;
                const itemTaxable = Math.round((itemTotal / 1.18) * 100) / 100;

                return (
                  <tr key={item.id}>
                    <td className="py-3 text-slate-400">{idx + 1}</td>
                    <td className="py-3 font-bold text-slate-900">{item.product?.title || "CatchBuddy Product"}</td>
                    <td className="py-3 text-center font-mono text-slate-500">8517</td>
                    <td className="py-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 text-right">₹{item.price.toFixed(2)}</td>
                    <td className="py-3 text-right">₹{itemTaxable.toFixed(2)}</td>
                    <td className="py-3 text-right font-black text-slate-900">₹{itemTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals & GST Summary */}
        <div className="border-t-2 border-slate-300 pt-4 flex justify-between items-start text-xs">
          <div className="max-w-xs space-y-1.5 text-slate-500 text-[11px]">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Authorized Computer Generated Invoice
            </p>
            <p>No signature required. Goods covered under 7-day replacement guarantee.</p>
          </div>

          <div className="w-72 space-y-2 text-slate-700">
            <div className="flex justify-between">
              <span>Taxable Value:</span>
              <span className="font-semibold text-slate-900">₹{taxableValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (9%):</span>
              <span className="font-semibold text-slate-900">₹{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (9%):</span>
              <span className="font-semibold text-slate-900">₹{sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="font-bold text-emerald-700">FREE</span>
            </div>
            <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-base font-black text-slate-950">
              <span>Invoice Total:</span>
              <span className="text-emerald-600">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-semibold">
          Thank you for shopping with CatchBuddy! Contact: support@catchbuddy.com
        </div>

      </div>
    </div>
  );
}