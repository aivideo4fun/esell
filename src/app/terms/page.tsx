import { ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-950">Terms of Service</h1>
        <p className="text-sm text-gray-600 mt-1">Rules and guidelines for using CatchBuddy</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 space-y-6 text-sm text-gray-700 leading-relaxed">
        <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-100">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-gray-950">Last Updated: August 2026</span>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-950 mb-2">1. General Terms & Prepaid Policy</h2>
          <p>
            By accessing and placing an order on CatchBuddy, you confirm that you are in agreement with and bound by the terms of service contained herein. 
            All orders placed on our website are 100% prepaid. We do not offer Cash on Delivery (COD) to ensure secure, fast, and verified dispatch through our supply partners.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-950 mb-2">2. Returns & Refunds</h2>
          <p>
            Refunds and replacements are strictly governed by our Return & Replacement Policy. A 5-day replacement window applies to defective or damaged products provided valid proof (unboxing video) is submitted.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-base text-gray-950 mb-2">3. Shipping & Logistics</h2>
          <p>
            We rely on third-party logistics (Delhivery, Bluedart, etc.) for order fulfillment. While we ensure dispatch within 24-48 hours, actual delivery times may vary based on your location.
          </p>
        </div>
      </div>
    </div>
  );
}