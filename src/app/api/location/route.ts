import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json({ success: false, error: "Coordinates missing" }, { status: 400 });
    }

    // OpenStreetMap Nominatim Reverse Geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "CatchBuddy-Storefront/1.0",
      },
      next: { revalidate: 3600 },
    });

    const data = await res.json();
    const address = data?.address || {};

    const postcode = address.postcode?.replace(/\D/g, "").slice(0, 6) || "302020";
    const city =
      address.city ||
      address.town ||
      address.district ||
      address.state_district ||
      address.county ||
      "India";
    const state = address.state || "India";

    return NextResponse.json({
      success: true,
      pincode: postcode,
      city: city,
      state: state,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resolve GPS" },
      { status: 500 }
    );
  }
}