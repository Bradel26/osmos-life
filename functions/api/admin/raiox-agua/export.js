import { ensureSchema } from '../../../_lib/db.js';
import { requireAdmin } from '../../../_lib/session.js';
import { buildEqualsFilter, buildDateRangeFilter, combineFilters, buildOrder } from '../../../_lib/query.js';

const EXPORT_ROW_LIMIT = 20000;
const SORTABLE_COLUMNS = new Set(['id', 'created_at', 'score', 'classificacao', 'nome', 'cidade', 'estado']);

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureSchema(env.DB);
  const url = new URL(request.url);
  const { whereSql, params } = combineFilters(
    buildEqualsFilter(url.searchParams, 'cidade', 'cidade'),
    buildEqualsFilter(url.searchParams, 'estado', 'estado'),
    buildEqualsFilter(url.searchParams, 'origemAgua', 'origem_agua'),
    buildEqualsFilter(url.searchParams, 'qtdMoradores', 'qtd_moradores'),
    buildEqualsFilter(url.searchParams, 'tipoImovel', 'tipo_imovel'),
    buildDateRangeFilter(url.searchParams, 'created_at')
  );
  const orderSql = buildOrder(url.searchParams, SORTABLE_COLUMNS, 'created_at');

  const stmt = env.DB.prepare(`SELECT * FROM raiox_agua_respostas ${whereSql} ${orderSql} LIMIT ?`).bind(...params, EXPORT_ROW_LIMIT);
  const { results } = await stmt.all();

  return new Response(JSON.stringify({ items: results, truncated: results.length === EXPORT_ROW_LIMIT }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
