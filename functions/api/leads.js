import { ensureSchema } from '../_lib/db.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
  await ensureSchema(env.DB);

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
  const whatsapp = typeof body.telefone === 'string' ? body.telefone.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (!nome || !whatsapp || !email || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: 'Dados incompletos ou inválidos' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const userAgent = request.headers.get('User-Agent') || '';

  const result = await env.DB.prepare(
    `INSERT INTO site_leads (nome, whatsapp, email, ip, user_agent) VALUES (?, ?, ?, ?, ?)`
  ).bind(nome, whatsapp, email, ip, userAgent).run();

  return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}
