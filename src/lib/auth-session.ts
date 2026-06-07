export const SESSION_COOKIE = 'tronx_session';
export const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 24);

export type SessionPayload = {
  sub: string;
  email: string;
  name?: string;
  role: string;
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSessionSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.TRONX_AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'tronx-development-session-secret-change-in-production'
  );
}

function base64UrlEncode(value: string | ArrayBuffer) {
  const bytes = typeof value === 'string' ? encoder.encode(value) : new Uint8Array(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecodeBytes(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function base64UrlDecode(value: string) {
  return decoder.decode(base64UrlDecodeBytes(value));
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createSessionToken(
  payload: Omit<SessionPayload, 'exp'>,
  ttlSeconds = SESSION_TTL_SECONDS,
) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  }));
  const data = `${header}.${body}`;
  const signature = await crypto.subtle.sign('HMAC', await getSigningKey(), encoder.encode(data));

  return `${data}.${base64UrlEncode(signature)}`;
}

export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const [header, body, signature] = parts;
    const data = `${header}.${body}`;
    const validSignature = await crypto.subtle.verify(
      'HMAC',
      await getSigningKey(),
      base64UrlDecodeBytes(signature),
      encoder.encode(data),
    );

    if (!validSignature) return null;

    const payload = JSON.parse(base64UrlDecode(body)) as SessionPayload;
    if (!payload.sub || !payload.email || !payload.role) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
