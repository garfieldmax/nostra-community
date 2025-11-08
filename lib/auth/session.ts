import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "agartha-session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60; // 1 hour

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required for session signing");
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSubtleCrypto() {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto API is not available");
  }
  return subtle;
}

const keyPromise = (async () => {
  const subtle = getSubtleCrypto();
  return subtle.importKey(
    "raw",
    encoder.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
})();

function toBase64Url(data: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(data)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  let binary = "";
  for (let i = 0; i < data.byteLength; i += 1) {
    binary += String.fromCharCode(data[i]!);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export type SessionLinkedAccount = {
  type: string;
  address?: string;
  email?: string;
};

export type SessionUser = {
  id: string;
  email?: string;
  createdAt: number;
  linkedAccounts: SessionLinkedAccount[];
};

type SessionPayload = SessionUser & {
  exp: number;
  iat: number;
};

function normalizePayload(payload: SessionPayload): SessionPayload {
  return {
    ...payload,
    linkedAccounts: Array.isArray(payload.linkedAccounts)
      ? payload.linkedAccounts.map((account) => ({ ...account }))
      : [],
  };
}

export async function signSession(user: SessionUser, maxAgeSeconds = SESSION_MAX_AGE_SECONDS) {
  const key = await keyPromise;
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = normalizePayload({
    ...user,
    exp: issuedAt + maxAgeSeconds,
    iat: issuedAt,
  });

  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const signature = await getSubtleCrypto().sign("HMAC", key, payloadBytes);
  const signatureBytes = new Uint8Array(signature);

  const token = `${toBase64Url(payloadBytes)}.${toBase64Url(signatureBytes)}`;
  return { token, payload };
}

function parseSessionToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }
  const [payloadPart, signaturePart] = parts;
  try {
    const payloadBytes = fromBase64Url(payloadPart);
    const signatureBytes = fromBase64Url(signaturePart);
    return { payloadBytes, signatureBytes };
  } catch {
    return null;
  }
}

async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const parsed = parseSessionToken(token);
  if (!parsed) {
    return null;
  }

  const key = await keyPromise;
  const isValid = await getSubtleCrypto().verify(
    "HMAC",
    key,
    parsed.signatureBytes,
    parsed.payloadBytes,
  );

  if (!isValid) {
    return null;
  }

  try {
    const payloadText = decoder.decode(parsed.payloadBytes);
    const payload = normalizePayload(JSON.parse(payloadText)) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function parseCookieHeader(headerValue: string | null) {
  if (!headerValue) {
    return {} as Record<string, string>;
  }

  return headerValue.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) {
      return acc;
    }
    acc[key] = rest.join("=");
    return acc;
  }, {} as Record<string, string>);
}

function toSessionUser(payload: SessionPayload): SessionUser {
  return {
    id: payload.id,
    email: payload.email,
    createdAt: payload.createdAt,
    linkedAccounts: payload.linkedAccounts ?? [],
  };
}

export async function readSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return toSessionUser(payload);
}

export async function readSessionFromRequest(request: Request | NextRequest) {
  // Prefer NextRequest.cookies when available
  const maybeNextRequest = request as NextRequest;
  if (typeof maybeNextRequest.cookies?.get === "function") {
    const token = maybeNextRequest.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      const payload = await verifySessionToken(token);
      return payload ? toSessionUser(payload) : null;
    }
  }

  const token = parseCookieHeader(request.headers.get("cookie"))[SESSION_COOKIE_NAME];
  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);
  return payload ? toSessionUser(payload) : null;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function writeSessionCookie(user: SessionUser, maxAgeSeconds = SESSION_MAX_AGE_SECONDS) {
  const cookieStore = await cookies();
  const { token } = await signSession(user, maxAgeSeconds);
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}
