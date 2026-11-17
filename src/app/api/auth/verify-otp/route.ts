import { POST as handle } from "../customer/route";
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return handle(new Request(req.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, mobile: body.mobile || body.phone, action: "OTP_LOGIN" }) }));
}
