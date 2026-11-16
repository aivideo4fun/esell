import { createRemoteJWKSet, jwtVerify } from "jose";
const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
export async function verifyPhoneProof(token: unknown, phone: string) {
  if (typeof token !== "string" || !token || token.length > 12000) throw new Error("Phone verification required");
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Phone verification is unavailable");
  const { payload } = await jwtVerify(token, googleKeys, {
    algorithms: ["RS256"], issuer: `https://securetoken.google.com/${projectId}`, audience: projectId,
  });
  const provider = (payload.firebase as { sign_in_provider?: string } | undefined)?.sign_in_provider;
  if (!payload.sub || provider !== "phone" || payload.phone_number !== `+91${phone}` ||
      typeof payload.auth_time !== "number" || Date.now() / 1000 - payload.auth_time > 600) {
    throw new Error("Verify this phone number again");
  }
}
