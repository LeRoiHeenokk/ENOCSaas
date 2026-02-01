/**
 * Amazon LWA (Login with Amazon) — obtention du access token via refresh token.
 * Le token est mis en cache 1h (Amazon expire après 3600s).
 */

const LWA_TOKEN_URL = "https://api.amazon.com/auth/o2/token";
const TOKEN_TTL_MS = 55 * 60 * 1000; // 55 min (marge avant expiration 1h)

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

let cached: CachedToken | null = null;

export async function getAccessToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt) {
    return cached.accessToken;
  }

  const clientId = process.env.AMAZON_CLIENT_ID;
  const clientSecret = process.env.AMAZON_CLIENT_SECRET;
  const refreshToken = process.env.AMAZON_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Amazon LWA: AMAZON_CLIENT_ID, AMAZON_CLIENT_SECRET et AMAZON_REFRESH_TOKEN sont requis dans .env.local"
    );
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(LWA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Amazon LWA] Token error:", res.status, text);
    throw new Error(`Amazon LWA: échec token (${res.status})`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  cached = {
    accessToken: data.access_token,
    expiresAt: Date.now() + Math.min(data.expires_in * 1000, TOKEN_TTL_MS),
  };

  return cached.accessToken;
}
