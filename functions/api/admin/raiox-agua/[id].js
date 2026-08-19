import { ensureSchema } from '../../../_lib/db.js';
import { requireAdmin } from '../../../_lib/session.js';

export async function onRequestGet({ request, env, params }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureSchema(env.DB);
  const row = await env.DB.prepare('SELECT * FROM raiox_agua_respostas WHERE id = ?').bind(params.id).first();
  if (!row) {
    return new Response(JSON.stringify({ error: 'Registro não encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify(row), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPatch({ request, env, params }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureSchema(env.DB);

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (typeof body.observacoesInternas !== 'string') {
    return new Response(JSON.stringify({ error: 'Campo observacoesInternas é obrigatório' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const result = await env.DB.prepare(
    'UPDATE raiox_agua_respostas SET observacoes_internas = ? WHERE id = ?'
  ).bind(body.observacoesInternas, params.id).run();

  if (!result.meta.changes) {
    return new Response(JSON.stringify({ error: 'Registro não encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestDelete({ request, env, params }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureSchema(env.DB);
  const result = await env.DB.prepare('DELETE FROM raiox_agua_respostas WHERE id = ?').bind(params.id).run();
  if (!result.meta.changes) {
    return new Response(JSON.stringify({ error: 'Registro não encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
