const encoder = new TextEncoder();

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);

  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value)
  );

  return base64url(new Uint8Array(signature));
}

export async function createSession(user, secret) {
  const payload = base64url(
    encoder.encode(JSON.stringify({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    }))
  );

  return `${payload}.${await sign(payload, secret)}`;
}

export async function readSession(token, secret) {
  if (!token || !secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;

  if (await sign(payload, secret) !== signature) return null;

  try {
    const user = JSON.parse(
      new TextDecoder().decode(decodeBase64url(payload))
    );

    if (!user.exp || user.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export function getCookie(request, name) {
  const cookies = request.headers.get("Cookie") || "";

  const item = cookies
    .split(";")
    .map(v => v.trim())
    .find(v => v.startsWith(`${name}=`));

  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}

export function sessionCookie(token) {
  return `sphynx_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`;
}

export function clearSessionCookie() {
  return "sphynx_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}

export function clearStateCookie() {
  return "sphynx_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}