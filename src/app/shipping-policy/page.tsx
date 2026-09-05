import Link from "next/link";
import { Clock, Truck, ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery Policy | CatchBuddy",
  description: "Reliable pan-India delivery details for CatchBuddy orders",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Reliable pan-India delivery details for CatchBuddy orders
          </p>
        </div>

        {/* 3 Green Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Dispatch Time</h2>
              <p className="text-xs text-emerald-50 leading-relaxed font-medium mt-1">
                All confirmed orders are packed &amp; dispatched within 24–48 business hours.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Delivery Duration</h2>
              <p className="text-xs text-emerald-50 leading-relaxed font-medium mt-1">
                Standard transit delivery takes 3–6 business days across India.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Verified Logistics</h2>
              <p className="text-xs text-emerald-50 leading-relaxed font-medium mt-1">
                Direct supplier fulfillment with secure transit insurance pan-India.
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Partners Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
          <h2 className="text-sm font-black text-slate-900">
            Delivery Partners &amp; Tracking
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            CatchBuddy partners with trusted domestic logistics providers including Bluedart, Delhivery, Ekart, and India Post. As soon as your order is dispatched, you receive a real-time SMS with direct tracking links.
          </p>
        </div>

        {/* Terms & Shipping Charges Footnote (Subtle & Small) */}
        <div className="pt-2 px-2">
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            *Standard handling and shipping charges (₹60) depend on your order type, volumetric package size, or delivery location. All final applicable rates are calculated and reflected prior to payment confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}