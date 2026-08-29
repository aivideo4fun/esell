import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-950">Return &amp; Replacement Policy</h1>
        <p className="text-sm text-gray-600 mt-1">Zero-risk, customer-first replacement guarantee</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 space-y-6 text-sm text-gray-700 leading-relaxed">
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-2xl border border-green-200">
          <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-green-950">5-Day Easy Replacement:</span> If your product arrives damaged, defective, or incorrect, we provide an instant free replacement without hassle.
          </div>
        </div>

        <h2 className="font-bold text-base text-gray-950">How to Claim Replacement:</h2>
        <ol className="list-decimal pl-5 space-y-2 text-xs text-gray-700">
          <li>Record a quick unboxing video or capture clear photos of the defect.</li>
          <li>Send your Order ID and photos to our WhatsApp Support team.</li>
          <li>Our team verifies and schedules a priority replacement dispatch within 24 hours.</li>
        </ol>
      </div>
    </div>
  );
}
