import { ensureSchema } from '../../../_lib/db.js';
import { requireAdmin } from '../../../_lib/session.js';
import { buildEqualsFilter, buildDateRangeFilter, combineFilters, buildOrder } from '../../../_lib/query.js';

const EXPORT_ROW_LIMIT = 20000;
const SORTABLE_COLUMNS = new Set(['id', 'created_at', 'tempo_resposta', 'perfil', 'score']);

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureSchema(env.DB);
  const url = new URL(request.url);
  const { whereSql, params } = combineFilters(
    buildEqualsFilter(url.searchParams, 'perfil', 'perfil'),
    buildDateRangeFilter(url.searchParams, 'created_at')
  );
  const orderSql = buildOrder(url.searchParams, SORTABLE_COLUMNS, 'created_at');

  const stmt = env.DB.prepare(
    `SELECT id, created_at, ip, user_agent, tempo_resposta, score, perfil, nome, cidade, estado, payload
     FROM questionarios_respostas ${whereSql} ${orderSql} LIMIT ?`
  ).bind(...params, EXPORT_ROW_LIMIT);

  const { results } = await stmt.all();
  const items = results.map((row) => {
    let payload = null;
    try {
      payload = JSON.parse(row.payload);
    } catch (err) {
      payload = null;
    }
    return { ...row, payload };
  });

  return new Response(JSON.stringify({ items, truncated: items.length === EXPORT_ROW_LIMIT }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
