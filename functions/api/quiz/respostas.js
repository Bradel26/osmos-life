import { ensureSchema } from '../../_lib/db.js';

export async function onRequestPost({ request, env }) {
  await ensureSchema(env.DB);

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!Array.isArray(body.respostas) || typeof body.perfil !== 'string') {
    return new Response(JSON.stringify({ error: 'Payload incompleto' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const userAgent = request.headers.get('User-Agent') || '';
  const score = Number.isFinite(body.score) ? body.score : null;
  const tempoResposta = Number.isFinite(body.tempoResposta) ? Math.round(body.tempoResposta) : null;
  const nome = typeof body.nome === 'string' ? body.nome : null;
  const cidade = typeof body.cidade === 'string' ? body.cidade : null;
  const estado = typeof body.estado === 'string' ? body.estado : null;
  const payload = JSON.stringify(body);

  const result = await env.DB.prepare(
    `INSERT INTO questionarios_respostas (ip, user_agent, tempo_resposta, score, perfil, nome, cidade, estado, payload)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(ip, userAgent, tempoResposta, score, body.perfil, nome, cidade, estado, payload).run();

  return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}
