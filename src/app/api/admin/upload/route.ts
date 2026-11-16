import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files");
    if (!files.length || files.length > 9) return NextResponse.json({ success: false, error: "Upload 1–9 product photos" }, { status: 400 });
    const urls = [];
    for (const value of files) {
      if (!(value instanceof File) || value.size > 5 * 1024 * 1024) throw new Error("Photo must be under 5 MB");
      const bytes = Buffer.from(await value.arrayBuffer());
      const png = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
      const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
      const webp = bytes.subarray(0,4).toString() === "RIFF" && bytes.subarray(8,12).toString() === "WEBP";
      if (!png && !jpg && !webp) throw new Error("Use PNG, JPEG or WebP photos");
      urls.push(`data:${png ? "image/png" : jpg ? "image/jpeg" : "image/webp"};base64,${bytes.toString("base64")}`);
    }
    return NextResponse.json({ success: true, urls });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 }); }
}
