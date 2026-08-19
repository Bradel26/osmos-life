const COOKIE_NAME = 'osmos_admin_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8h, mesmo padrão do RMA/BackOffice TIM

function bufferToBase64Url(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBuffer(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(base64url.length + (4 - (base64url.length % 4 || 4)) % 4, '=');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function textToBase64Url(text) {
  return bufferToBase64Url(new TextEncoder().encode(text).buffer);
}

function base64UrlToText(base64url) {
  return new TextDecoder().decode(base64UrlToBuffer(base64url));
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function sign(secret, data) {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return bufferToBase64Url(signature);
}

async function verify(secret, data, signatureB64Url) {
  const key = await importHmacKey(secret);
  try {
    return await crypto.subtle.verify('HMAC', key, base64UrlToBuffer(signatureB64Url), new TextEncoder().encode(data));
  } catch (err) {
    return false;
  }
}

export async function createSessionCookie(secret, isHttps) {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_SECONDS * 1000 });
  const payloadB64 = textToBase64Url(payload);
  const signature = await sign(secret, payloadB64);
  const token = `${payloadB64}.${signature}`;
  const secureFlag = isHttps ? ' Secure;' : '';
  return `${COOKIE_NAME}=${token}; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie(isHttps) {
  const secureFlag = isHttps ? ' Secure;' : '';
  return `${COOKIE_NAME}=; HttpOnly;${secureFlag} SameSite=Lax; Path=/; Max-Age=0`;
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

export async function isAuthenticated(request, env) {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return false;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return false;
  const valid = await verify(env.SESSION_SECRET, payloadB64, signature);
  if (!valid) return false;
  try {
    const payload = JSON.parse(base64UrlToText(payloadB64));
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch (err) {
    return false;
  }
}

export async function requireAdmin(request, env) {
  const ok = await isAuthenticated(request, env);
  if (!ok) {
    return new Response(JSON.stringify({ error: 'Não autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return null;
}
