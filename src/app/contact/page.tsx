import { MessageCircle, Mail, Clock, ShieldCheck, Headphones } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-xs font-black">
          <Headphones className="w-3.5 h-3.5" /> CatchBuddy Customer Support
        </div>
        <h1 className="text-3xl font-black text-gray-950">Contact Us</h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
          Need help with your order, dispatch, tracking, or replacement? Contact us directly:
        </p>
      </div>

      {/* 2 Main Support Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        
        {/* WhatsApp Card */}
        <a
          href="https://wa.me/916350108713?text=Hi%20CatchBuddy,%20I%20need%20help%20with%20my%20order"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 bg-white rounded-3xl border-2 border-gray-200 hover:border-[#16a34a] hover:shadow-lg transition flex flex-col justify-between space-y-4 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-[#16a34a] mx-auto">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-950">WhatsApp Support</h3>
            <p className="text-xs text-gray-500 mt-1">Instant chat help for orders &amp; delivery</p>
            <p className="text-xs font-black text-[#16a34a] mt-2">+91 6350108713</p>
          </div>
          <span className="w-full bg-[#16a34a] text-white text-xs font-black py-2.5 rounded-xl block">
            Chat on WhatsApp →
          </span>
        </a>

        {/* Email Card */}
        <a
          href="mailto:support@catchbuddy.com"
          className="p-6 bg-white rounded-3xl border-2 border-gray-200 hover:border-gray-900 hover:shadow-lg transition flex flex-col justify-between space-y-4 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-800 mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-950">Email Support</h3>
            <p className="text-xs text-gray-500 mt-1">Send us order inquiries &amp; queries</p>
            <p className="text-xs font-black text-gray-950 mt-2">support@catchbuddy.com</p>
          </div>
          <span className="w-full bg-gray-900 text-white text-xs font-black py-2.5 rounded-xl block">
            Send Email →
          </span>
        </a>

      </div>

      {/* Support Hours Banner */}
      <div className="max-w-2xl mx-auto p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600 font-semibold text-center sm:text-left">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#16a34a]" />
          <span>Working Hours: Mon – Sat (10:00 AM – 7:00 PM IST)</span>
        </div>
        <div className="flex items-center gap-1 text-[#065f46] font-bold">
          <ShieldCheck className="w-4 h-4" /> 100% Verified Desk
        </div>
      </div>
    </div>
  );
}