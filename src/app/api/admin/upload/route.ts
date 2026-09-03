import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "Koi file select nahi ki gayi" }, { status: 400 });
    }

    // Har file ko Data URL (Base64) mein convert karein taaki seedhe database/image render ho sake
    const urls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/jpeg";
      const base64 = `data:${mimeType};base64,${buffer.toString("base64")}`;
      urls.push(base64);
    }

    return NextResponse.json({ success: true, urls });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "File upload failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}