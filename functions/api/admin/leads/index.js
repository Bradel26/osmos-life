import { ensureSchema } from '../../../_lib/db.js';
import { requireAdmin } from '../../../_lib/session.js';
import { buildSearchFilter, combineFilters, buildOrder, buildPagination } from '../../../_lib/query.js';

const SORTABLE_COLUMNS = new Set(['id', 'created_at']);
const SEARCH_COLUMNS = ['nome', 'whatsapp', 'email'];

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureSchema(env.DB);
  const url = new URL(request.url);
  const { whereSql, params } = combineFilters(buildSearchFilter(url.searchParams, SEARCH_COLUMNS));
  const orderSql = buildOrder(url.searchParams, SORTABLE_COLUMNS, 'created_at');
  const { page, pageSize, limit, offset } = buildPagination(url.searchParams);

  const countStmt = env.DB.prepare(`SELECT COUNT(*) AS total FROM site_leads ${whereSql}`).bind(...params);
  const listStmt = env.DB.prepare(
    `SELECT id, created_at, nome, whatsapp, email
     FROM site_leads ${whereSql} ${orderSql} LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset);

  const [countResult, listResult] = await Promise.all([countStmt.first(), listStmt.all()]);

  return new Response(JSON.stringify({
    items: listResult.results,
    total: countResult?.total || 0,
    page,
    pageSize
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
