import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: "Coordinates missing" },
        { status: 400 }
      );
    }

    let detectedPincode = "";
    let detectedCity = "";
    let detectedState = "";

    // 1. Primary Engine: BigDataCloud Reverse Geocoding (Fast & reliable for India)
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
      const bdcRes = await fetch(bdcUrl, { next: { revalidate: 3600 } });
      const bdcData = await bdcRes.json();

      if (bdcData) {
        detectedPincode = bdcData.postcode?.replace(/\D/g, "").slice(0, 6) || "";
        detectedCity =
          bdcData.city ||
          bdcData.locality ||
          bdcData.principalSubdivision ||
          "";
        detectedState = bdcData.principalSubdivision || "";
      }
    } catch (e) {
      console.warn("BigDataCloud fallback triggered:", e);
    }

    // 2. Fallback Engine: OpenStreetMap Nominatim with proper Custom Agent
    if (!detectedPincode) {
      try {
        const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
        const osmRes = await fetch(osmUrl, {
          headers: {
            "User-Agent": "CatchBuddyStore/1.0 (contact@catchbuddy.com)",
            "Accept-Language": "en",
          },
          next: { revalidate: 3600 },
        });
        const osmData = await osmRes.json();
        const address = osmData?.address || {};

        detectedPincode = address.postcode?.replace(/\D/g, "").slice(0, 6) || "";
        detectedCity =
          detectedCity ||
          address.city ||
          address.town ||
          address.district ||
          address.state_district ||
          "";
        detectedState = detectedState || address.state || "";
      } catch (e) {
        console.warn("Nominatim fallback failed:", e);
      }
    }

    // Agar pincode mil gaya toh India Post API se district/city verify karein
    if (detectedPincode && detectedPincode.length === 6) {
      try {
        const postRes = await fetch(`https://api.postalpincode.in/pincode/${detectedPincode}`);
        const postData = await postRes.json();
        if (
          Array.isArray(postData) &&
          postData[0]?.Status === "Success" &&
          postData[0]?.PostOffice?.length > 0
        ) {
          detectedCity = postData[0].PostOffice[0].District || detectedCity;
          detectedState = postData[0].PostOffice[0].State || detectedState;
        }
      } catch {}
    }

    if (!detectedPincode && !detectedCity) {
      return NextResponse.json(
        { success: false, error: "Unable to detect exact address from GPS" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pincode: detectedPincode || "341512",
      city: detectedCity || "Rajasthan",
      state: detectedState || "India",
    });
  } catch (error: any) {
    console.error("GPS Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resolve GPS" },
      { status: 500 }
    );
  }
}