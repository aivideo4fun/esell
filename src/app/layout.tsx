import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

export const metadata: Metadata = {
  title: "CatchBuddy | Discover Something You'll Love",
  description: "Premium curated toys, smart gadgets, home & car accessories across India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-[#fafafa] text-gray-900">
        <Navbar />
        <main className="grow">{children}</main>
        <CartDrawer />
        <Footer />
      </body>
    </html>
  );
}