import { ensureSchema } from '../../../_lib/db.js';
import { requireAdmin } from '../../../_lib/session.js';
import { buildEqualsFilter, buildDateRangeFilter, combineFilters, buildOrder, buildPagination } from '../../../_lib/query.js';

const SORTABLE_COLUMNS = new Set(['id', 'created_at', 'tempo_resposta', 'perfil', 'score']);

async function loadKpis(db) {
  const [totalRow, hojeRow, semanaRow, mesRow, tempoRow, perfilRow] = await db.batch([
    db.prepare('SELECT COUNT(*) AS n FROM questionarios_respostas'),
    db.prepare("SELECT COUNT(*) AS n FROM questionarios_respostas WHERE date(created_at) = date('now')"),
    db.prepare("SELECT COUNT(*) AS n FROM questionarios_respostas WHERE strftime('%Y-%W', created_at) = strftime('%Y-%W', 'now')"),
    db.prepare("SELECT COUNT(*) AS n FROM questionarios_respostas WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"),
    db.prepare('SELECT AVG(tempo_resposta) AS media FROM questionarios_respostas WHERE tempo_resposta IS NOT NULL'),
    db.prepare("SELECT perfil, COUNT(*) AS n FROM questionarios_respostas WHERE perfil IS NOT NULL AND perfil != '' GROUP BY perfil ORDER BY n DESC LIMIT 1")
  ]);

  return {
    total: totalRow.results[0]?.n || 0,
    hoje: hojeRow.results[0]?.n || 0,
    semana: semanaRow.results[0]?.n || 0,
    mes: mesRow.results[0]?.n || 0,
    tempoMedioSegundos: tempoRow.results[0]?.media ? Math.round(tempoRow.results[0].media) : null,
    perfilPredominante: perfilRow.results[0]?.perfil || null
  };
}

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
  const { page, pageSize, limit, offset } = buildPagination(url.searchParams);

  const countStmt = env.DB.prepare(`SELECT COUNT(*) AS total FROM questionarios_respostas ${whereSql}`).bind(...params);
  const listStmt = env.DB.prepare(
    `SELECT id, created_at, tempo_resposta, score, perfil
     FROM questionarios_respostas ${whereSql} ${orderSql} LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset);

  const [countResult, listResult, kpis] = await Promise.all([
    countStmt.first(),
    listStmt.all(),
    loadKpis(env.DB)
  ]);

  return new Response(JSON.stringify({
    items: listResult.results,
    total: countResult?.total || 0,
    page,
    pageSize,
    kpis
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
