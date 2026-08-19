import { ensureSchema } from '../../../_lib/db.js';
import { computeScore, classify } from '../../../_lib/raiox-agua.js';

function onlyDigits(value) {
  return (value || '').replace(/\D/g, '');
}

export async function onRequestPost({ request, env, params }) {
  await ensureSchema(env.DB);

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
  const whatsapp = typeof body.whatsapp === 'string' ? body.whatsapp.trim() : '';
  const cidade = typeof body.cidade === 'string' ? body.cidade.trim() : null;
  const estado = typeof body.estado === 'string' ? body.estado.trim() : null;
  const tempoResposta = Number.isFinite(body.tempoResposta) ? Math.round(body.tempoResposta) : null;

  if (!nome || !whatsapp) {
    return new Response(JSON.stringify({ error: 'Nome e WhatsApp são obrigatórios' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const row = await env.DB.prepare(
    `SELECT * FROM raiox_agua_respostas WHERE session_id = ? AND status = 'incompleto'`
  ).bind(params.sessionId).first();

  if (!row) {
    return new Response(JSON.stringify({ error: 'Sessão não encontrada ou já finalizada' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  const whatsappDigits = onlyDigits(whatsapp);
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const userAgent = request.headers.get('User-Agent') || '';

  const existingLead = await env.DB.prepare(
    `SELECT id FROM site_leads WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(whatsapp,'-',''),' ',''),'(',''),')',''),'+','') = ?`
  ).bind(whatsappDigits).first();

  let leadId;
  if (existingLead) {
    leadId = existingLead.id;
  } else {
    const insertLead = await env.DB.prepare(
      `INSERT INTO site_leads (nome, whatsapp, email, ip, user_agent) VALUES (?, ?, '', ?, ?)`
    ).bind(nome, whatsapp, ip, userAgent).run();
    leadId = insertLead.meta.last_row_id;
  }

  const score = computeScore(row);
  const classificacao = classify(score);
  const payload = JSON.stringify({ ...row, nome, whatsapp, cidade, estado, score, classificacao });

  await env.DB.prepare(
    `UPDATE raiox_agua_respostas
     SET nome = ?, whatsapp = ?, cidade = ?, estado = ?, lead_id = ?, score = ?, classificacao = ?,
         status = 'completo', tempo_resposta = ?, payload = ?, updated_at = datetime('now')
     WHERE session_id = ?`
  ).bind(nome, whatsapp, cidade, estado, leadId, score, classificacao, tempoResposta, payload, params.sessionId).run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
