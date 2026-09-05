import React from "react";
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export const metadata = {
  title: "Return & Refund Policy | CatchBuddy",
  description: "Read the official return, exchange, and refund policy of CatchBuddy.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        {/* Header */}
        <div className="border-b border-slate-100 pb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-3 border border-emerald-100">
            <RotateCcw className="w-3.5 h-3.5" /> Customer Satisfaction Guarantee
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Return &amp; Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
            At CatchBuddy, we strive to ensure customer satisfaction. Please read our return policy carefully before placing an order.
          </p>
        </div>

        {/* 1. Timeline */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> 1. Return Request Timeline
          </h2>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 pl-2 leading-relaxed">
            <li>
              Return requests must be raised within <strong>5 days</strong> from the date of delivery of the product.
            </li>
            <li>
              Return charges depend on products; you can check the return costs of products on the product page itself.
            </li>
          </ul>
        </div>

        {/* 2. Eligible Reasons */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 2. Eligible Return Reasons
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">Returns are accepted in the following cases:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="text-base">📦</span> Product received in damaged condition.
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="text-base">🔄</span> Product received is different from what was ordered.
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="text-base">⚙️</span> Product received has a manufacturing defect.
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="text-base">✅</span> All other genuine reasons are also accepted.
            </div>
          </div>
        </div>

        {/* 3. Non-Returnable */}
        <div className="space-y-3 p-5 bg-rose-50/70 border border-rose-200 rounded-2xl">
          <h2 className="text-sm sm:text-base font-black text-rose-950 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" /> 3. Non-Returnable Categories
          </h2>
          <p className="text-xs sm:text-sm text-rose-900 font-medium leading-relaxed">
            For hygiene, safety, and quality reasons, returns are not accepted for the following categories unless the product is received damaged, defective, or incorrect:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-rose-800 font-bold pl-2">
            <li>Innerwear products</li>
            <li>Intimate products</li>
            <li>Personal care products</li>
            <li>Any other category specifically marked as non-returnable on the product page</li>
          </ul>
        </div>

        {/* 4. Return Shipping & Charges */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" /> 4. Return Shipping &amp; Charges
          </h2>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 pl-2 leading-relaxed">
            <li>
              <strong>Logistics Handover:</strong> Products approved for return must be handed over only to the logistics partner arranged by CatchBuddy. Customers should not self-ship products unless specifically instructed by CatchBuddy.
            </li>
            <li>
              <strong>Return Charges:</strong> Applicable return charges may vary depending on the product category, size, pincode, and weight. Any applicable charges will be communicated during the return approval process.
            </li>
          </ul>
        </div>

        {/* 5. Condition */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" /> 5. Condition of Returned Products
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">Returned products must strictly be:</p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium pl-2">
            <li>Unused and unwashed</li>
            <li>In their original packaging</li>
            <li>With all tags, labels, accessories, and invoices intact</li>
          </ul>
          <p className="text-xs text-amber-800 font-semibold bg-amber-50 p-3 rounded-xl border border-amber-200">
            Notice: Returns may be rejected if the product does not meet the above conditions upon warehouse inspection.
          </p>
        </div>

        {/* 6. Refund Policy */}
        <div className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" /> 6. Refund Policy
          </h2>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 pl-2 leading-relaxed">
            <li>
              Once the returned product is received and inspected, CatchBuddy will notify the user regarding the approval or rejection of the refund.
            </li>
            <li>
              If approved, the refund will be processed within <strong>7–10 business days</strong> through the original payment method or any other method deemed appropriate by CatchBuddy.
            </li>
            <li>
              Shipping charges, platform fees, payment gateway charges, or return charges may be deducted or charged wherever applicable.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}