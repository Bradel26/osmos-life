import { ensureSchema } from '../../_lib/db.js';

export async function onRequestPost({ request, env }) {
  await ensureSchema(env.DB);

  const sessionId = crypto.randomUUID();
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const userAgent = request.headers.get('User-Agent') || '';

  await env.DB.prepare(
    `INSERT INTO raiox_agua_respostas (session_id, ip, user_agent) VALUES (?, ?, ?)`
  ).bind(sessionId, ip, userAgent).run();

  return new Response(JSON.stringify({ sessionId }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}
