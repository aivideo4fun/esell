import { Truck, ShieldCheck, Clock } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-950">Shipping &amp; Delivery Policy</h1>
        <p className="text-sm text-gray-600 mt-1">Reliable pan-India delivery details for CatchBuddy orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-gray-200">
          <Clock className="w-6 h-6 text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-950 text-sm">Dispatch Time</h3>
          <p className="text-xs text-gray-600 mt-1">All prepaid orders are dispatched within 24–48 business hours.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-200">
          <Truck className="w-6 h-6 text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-950 text-sm">Delivery Duration</h3>
          <p className="text-xs text-gray-600 mt-1">Standard delivery takes 3–6 business days across India.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-200">
          <ShieldCheck className="w-6 h-6 text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-950 text-sm">Free Shipping</h3>
          <p className="text-xs text-gray-600 mt-1">100% Free Pan-India Delivery on all online prepaid orders.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 space-y-4 text-sm text-gray-700 leading-relaxed">
        <h2 className="font-bold text-base text-gray-950">Delivery Partners &amp; Tracking</h2>
        <p>
          CatchBuddy partners with trusted domestic logistics providers including Bluedart, Delhivery, Ekart, and India Post. As soon as your order is dispatched, you receive a real-time SMS with direct tracking links.
        </p>
      </div>
    </div>
  );
}