import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim();

    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      return NextResponse.json(
        { success: false, error: "Valid 6-digit pincode is required" },
        { status: 400 }
      );
    }

    // India Post public directory lookup
    const res = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
      next: { revalidate: 86400 }, // Cache 24 hours
    });

    const data = await res.json();

    if (
      Array.isArray(data) &&
      data[0]?.Status === "Success" &&
      Array.isArray(data[0]?.PostOffice) &&
      data[0].PostOffice.length > 0
    ) {
      const office = data[0].PostOffice[0];
      const city = office.District || office.Block || office.Division;
      const state = office.State;

      return NextResponse.json({
        success: true,
        city: city,
        state: state,
        district: office.District,
      });
    }

    return NextResponse.json(
      { success: false, error: "Pincode not found" },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch city" },
      { status: 500 }
    );
  }
}