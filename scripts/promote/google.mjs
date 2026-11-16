// Google OAuth access tokens: from a service account JSON key (Search Console) or a refresh token (Blogger).
import { createSign } from "node:crypto";

async function token(params) {
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams(params) });
  if (!res.ok) throw new Error(`Google token request failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

export function serviceAccountToken(key, scope) {
  const b64 = (data) => Buffer.from(JSON.stringify(data)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const claims = { iss: key.client_email, scope, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 };
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64(claims)}`;
  const assertion = `${unsigned}.${createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url")}`;
  return token({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion });
}

export const refreshToken = (clientId, clientSecret, refresh) =>
  token({ grant_type: "refresh_token", client_id: clientId, client_secret: clientSecret, refresh_token: refresh });
