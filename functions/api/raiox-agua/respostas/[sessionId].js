import { ensureSchema } from '../../../_lib/db.js';
import { FIELDS, PATCHABLE_FIELDS } from '../../../_lib/raiox-agua.js';

export async function onRequestPatch({ request, env, params }) {
  await ensureSchema(env.DB);

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { campo, valor } = body || {};
  if (typeof campo !== 'string' || !PATCHABLE_FIELDS.has(campo)) {
    return new Response(JSON.stringify({ error: 'Campo inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const field = FIELDS[campo];
  let valueToStore;

  if (field.type === 'multi') {
    if (!Array.isArray(valor) || !valor.every((v) => field.options.includes(v))) {
      return new Response(JSON.stringify({ error: 'Valor inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    valueToStore = JSON.stringify(valor);
  } else {
    if (typeof valor !== 'string' || !field.options.includes(valor)) {
      return new Response(JSON.stringify({ error: 'Valor inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    valueToStore = valor;
  }

  const result = await env.DB.prepare(
    `UPDATE raiox_agua_respostas SET ${campo} = ?, updated_at = datetime('now')
     WHERE session_id = ? AND status = 'incompleto'`
  ).bind(valueToStore, params.sessionId).run();

  if (!result.meta.changes) {
    return new Response(JSON.stringify({ error: 'Sessão não encontrada ou já finalizada' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
