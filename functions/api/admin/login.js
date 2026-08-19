import { createSessionCookie } from '../../_lib/session.js';

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const senha = typeof body.senha === 'string' ? body.senha : '';
  if (!senha || !env.ADMIN_PASSWORD || !timingSafeEqual(senha, env.ADMIN_PASSWORD)) {
    return new Response(JSON.stringify({ error: 'Senha incorreta' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const cookie = await createSessionCookie(env.SESSION_SECRET, new URL(request.url).protocol === 'https:');
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie }
  });
}
