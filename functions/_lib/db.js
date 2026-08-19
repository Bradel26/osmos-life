const SCHEMA_STATEMENTS = [
  "CREATE TABLE IF NOT EXISTS questionarios_respostas (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL DEFAULT (datetime('now')), ip TEXT, user_agent TEXT, tempo_resposta INTEGER, score INTEGER, perfil TEXT, nome TEXT, cidade TEXT, estado TEXT, payload TEXT NOT NULL)",
  "CREATE INDEX IF NOT EXISTS idx_questionarios_created_at ON questionarios_respostas(created_at)",
  "CREATE INDEX IF NOT EXISTS idx_questionarios_perfil ON questionarios_respostas(perfil)",
  "CREATE INDEX IF NOT EXISTS idx_questionarios_estado ON questionarios_respostas(estado)",
  "CREATE INDEX IF NOT EXISTS idx_questionarios_cidade ON questionarios_respostas(cidade)",
  "CREATE TABLE IF NOT EXISTS site_leads (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL DEFAULT (datetime('now')), nome TEXT NOT NULL, whatsapp TEXT NOT NULL, email TEXT NOT NULL, ip TEXT, user_agent TEXT)",
  "CREATE INDEX IF NOT EXISTS idx_site_leads_created_at ON site_leads(created_at)",
  "CREATE TABLE IF NOT EXISTS raiox_agua_respostas (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT, status TEXT NOT NULL DEFAULT 'incompleto', lead_id INTEGER, nome TEXT, whatsapp TEXT, cidade TEXT, estado TEXT, ip TEXT, user_agent TEXT, tempo_resposta INTEGER, tipo_imovel TEXT, origem_agua TEXT, qtd_moradores TEXT, consumo_atual TEXT, problemas_agua TEXT, manchas_locais TEXT, freq_compra_agua TEXT, cozinha_mesma_agua TEXT, maior_preocupacao TEXT, tem_criancas TEXT, pessoas_risco TEXT, analise_previa TEXT, interesse_analise TEXT, investimento TEXT, score INTEGER, classificacao TEXT, observacoes_internas TEXT, payload TEXT)",
  "CREATE INDEX IF NOT EXISTS idx_raiox_created_at ON raiox_agua_respostas(created_at)",
  "CREATE INDEX IF NOT EXISTS idx_raiox_cidade ON raiox_agua_respostas(cidade)",
  "CREATE INDEX IF NOT EXISTS idx_raiox_estado ON raiox_agua_respostas(estado)",
  "CREATE INDEX IF NOT EXISTS idx_raiox_classificacao ON raiox_agua_respostas(classificacao)"
];

let schemaReady = false;

export async function ensureSchema(db) {
  if (schemaReady) return;
  await db.exec(SCHEMA_STATEMENTS.join('\n'));
  schemaReady = true;
}
