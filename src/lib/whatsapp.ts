// src/lib/whatsapp.ts

interface OrderNotificationData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerCity?: string;
  totalAmount: number;
  paymentMethod: string;
  itemsCount: number;
}

export async function sendFreeWhatsAppAlert(data: OrderNotificationData) {
  // Aapka phone number international format me (e.g. +917976152206)
  const phone = "917976152206"; 
  // CallMeBot se mila hua apikey yahan dalein
  const apiKey = process.env.CALLMEBOT_API_KEY || "AAPKA_API_KEY_YAHAN";

  const text = `🚨 *NEW ORDER - CATCHBUDDY* 🚨\n\n` +
    `📦 *Order ID:* #${data.orderId}\n` +
    `👤 *Customer:* ${data.customerName}\n` +
    `📞 *Phone:* ${data.customerPhone}\n` +
    `📍 *City:* ${data.customerCity || "N/A"}\n` +
    `💰 *Amount:* ₹${data.totalAmount}\n` +
    `💳 *Payment:* ${data.paymentMethod}\n` +
    `🛍️ *Items:* ${data.itemsCount}\n\n` +
    `👉 Dashboard: https://catchbuddy.in/admin/orders`;

  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://api.callmebot.com/whatsapp.php?phone=+${phone}&text=${encodedText}&apikey=${apiKey}`;

    const res = await fetch(url);
    if (res.ok) {
      console.log("Free WhatsApp notification sent successfully!");
    } else {
      console.error("CallMeBot error:", await res.text());
    }
  } catch (error) {
    console.error("Failed to send WhatsApp alert:", error);
  }
}