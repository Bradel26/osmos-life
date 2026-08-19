import { ensureSchema } from '../../../_lib/db.js';
import { requireAdmin } from '../../../_lib/session.js';
import { buildEqualsFilter, buildDateRangeFilter, combineFilters, buildOrder, buildPagination } from '../../../_lib/query.js';

const SORTABLE_COLUMNS = new Set(['id', 'created_at', 'score', 'classificacao', 'nome', 'cidade', 'estado']);

async function loadKpis(db) {
  const [totalRow, hojeRow, semanaRow, mesRow, scoreRow, classificacaoResult] = await db.batch([
    db.prepare('SELECT COUNT(*) AS n FROM raiox_agua_respostas'),
    db.prepare("SELECT COUNT(*) AS n FROM raiox_agua_respostas WHERE date(created_at) = date('now')"),
    db.prepare("SELECT COUNT(*) AS n FROM raiox_agua_respostas WHERE strftime('%Y-%W', created_at) = strftime('%Y-%W', 'now')"),
    db.prepare("SELECT COUNT(*) AS n FROM raiox_agua_respostas WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"),
    db.prepare("SELECT AVG(score) AS media FROM raiox_agua_respostas WHERE score IS NOT NULL"),
    db.prepare("SELECT classificacao, COUNT(*) AS n FROM raiox_agua_respostas WHERE classificacao IS NOT NULL GROUP BY classificacao")
  ]);

  const porClassificacao = {};
  classificacaoResult.results.forEach((r) => { porClassificacao[r.classificacao] = r.n; });

  return {
    total: totalRow.results[0]?.n || 0,
    hoje: hojeRow.results[0]?.n || 0,
    semana: semanaRow.results[0]?.n || 0,
    mes: mesRow.results[0]?.n || 0,
    scoreMedio: scoreRow.results[0]?.media != null ? Math.round(scoreRow.results[0].media) : null,
    porClassificacao
  };
}

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
  const { page, pageSize, limit, offset } = buildPagination(url.searchParams);

  const countStmt = env.DB.prepare(`SELECT COUNT(*) AS total FROM raiox_agua_respostas ${whereSql}`).bind(...params);
  const listStmt = env.DB.prepare(
    `SELECT id, created_at, status, nome, whatsapp, cidade, estado, tipo_imovel, origem_agua, qtd_moradores, score, classificacao
     FROM raiox_agua_respostas ${whereSql} ${orderSql} LIMIT ? OFFSET ?`
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
