export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-[#0f172a]">
      <h1 className="text-3xl font-black mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-sm font-medium leading-relaxed text-gray-700 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200">
        <p>Your privacy is important to us. CatchBuddy collects only necessary information (name, address, contact details) required to process and ship your orders safely.</p>
        <p>We do not store your credit/debit card numbers or UPI PINs. All financial transactions are securely handled via Razorpay payment gateway.</p>
        <p>We do not sell, rent, or trade your personal data to third parties.</p>
      </div>
    </div>
  );
}