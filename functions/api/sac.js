/**
 * POST /api/sac — Cloudflare Pages Function do site osmoslife.com.br.
 *
 * Recebe o formulario do SAC (multipart, com anexo opcional), confere o
 * Turnstile e repassa ao modulo SAC do Nexus com a chave secreta, que nunca
 * chega ao navegador. Resposta ao site: { ok: true, protocolo, acompanhamento }.
 *
 * Variaveis (Cloudflare Pages > Settings > Variables and Secrets):
 *   SAC_API_URL          https://nexus.bradel.com.br/modulo-sac/api/v1
 *   SAC_API_KEY          (secret) mesmo valor de SAC_SITE_API_KEY no Nexus
 *   SAC_ACOMPANHAR_URL   https://nexus.bradel.com.br/modulo-sac/acompanhar
 *   TURNSTILE_SECRET_KEY (secret) chave secreta do widget Turnstile. Sem ela a
 *                        verificacao anti-robo fica desligada (o Nexus ainda
 *                        limita 5 envios/10 min por IP).
 */

const TAMANHO_MAXIMO_ANEXO = 15 * 1024 * 1024;

function resposta(status, corpo) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function texto(form, campo) {
  const valor = form.get(campo);
  return typeof valor === 'string' ? valor.trim() : '';
}

async function turnstileValido(env, token, ip) {
  if (!token) return false;
  const corpo = new FormData();
  corpo.append('secret', env.TURNSTILE_SECRET_KEY);
  corpo.append('response', token);
  if (ip) corpo.append('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: corpo });
  const dados = await r.json().catch(() => ({}));
  return dados.success === true;
}

// Valores colados no painel podem vir com espaco, quebra de linha ou barra final.
function variavel(env, nome) {
  return String(env[nome] || '').trim().replace(/\/+$/, '');
}

export async function onRequestPost({ request, env }) {
  const apiUrl = variavel(env, 'SAC_API_URL');
  const apiKey = variavel(env, 'SAC_API_KEY');
  if (!apiUrl || !apiKey) {
    return resposta(503, { ok: false, erro: 'Não foi possível registrar sua solicitação agora.', ref: 'config' });
  }

  const ip = request.headers.get('CF-Connecting-IP') || '';

  let form;
  try {
    form = await request.formData();
  } catch {
    return resposta(400, { ok: false, erro: 'Formulário inválido.' });
  }

  if (env.TURNSTILE_SECRET_KEY && !(await turnstileValido(env, texto(form, 'cf-turnstile-response'), ip))) {
    return resposta(400, { ok: false, erro: 'Não foi possível confirmar que você não é um robô. Recarregue a página e tente novamente.' });
  }

  const solicitacao = {
    nome: texto(form, 'nome'),
    email: texto(form, 'email'),
    telefone: texto(form, 'telefone') || undefined,
    documento: texto(form, 'documento') || undefined,
    pedido: texto(form, 'pedido') || undefined,
    assunto: texto(form, 'assunto') || undefined,
    categoria: texto(form, 'categoria'),
    descricao: texto(form, 'descricao'),
    risco: texto(form, 'risco') === 'sim',
    consentimento: texto(form, 'consentimento') === 'sim',
  };

  const cabecalhos = { 'x-api-key': apiKey, 'x-cliente-ip': ip };
  let caso;
  try {
    const r = await fetch(`${apiUrl}/integracao/site/cases`, {
      method: 'POST',
      headers: { ...cabecalhos, 'Content-Type': 'application/json' },
      body: JSON.stringify(solicitacao),
    });
    caso = await r.json().catch(() => ({}));
    if (!r.ok) {
      // 400 (validacao) e 429 (limite) trazem mensagem util ao cliente; o resto vira erro generico.
      // Nunca 502/504: no dominio proprio o Cloudflare troca essas respostas pela pagina de erro dele.
      const mensagem = Array.isArray(caso.message) ? caso.message[0] : caso.message;
      const repassa = r.status === 400 || r.status === 429;
      const util = repassa && mensagem;
      // ref: codigo devolvido pelo Nexus, para diagnostico (401 = chave, 404 = endereco).
      return resposta(repassa ? r.status : 503, {
        ok: false,
        erro: util || 'Não foi possível registrar sua solicitação agora.',
        ref: `nexus-${r.status}`,
      });
    }
  } catch {
    return resposta(503, { ok: false, erro: 'Não foi possível registrar sua solicitação agora.', ref: 'nexus-indisponivel' });
  }

  // Anexo: falha aqui nao derruba o protocolo ja aberto; a equipe pede o arquivo na triagem.
  let anexoRecebido = null;
  const anexo = form.get('anexo');
  if (anexo && typeof anexo !== 'string' && anexo.size > 0) {
    anexoRecebido = false;
    if (anexo.size <= TAMANHO_MAXIMO_ANEXO) {
      try {
        const corpo = new FormData();
        corpo.append('file', anexo, anexo.name);
        const r = await fetch(`${apiUrl}/integracao/site/cases/${encodeURIComponent(caso.trackingToken)}/anexo`, {
          method: 'POST',
          headers: cabecalhos,
          body: corpo,
        });
        anexoRecebido = r.ok;
      } catch {
        anexoRecebido = false;
      }
    }
  }

  return resposta(200, {
    ok: true,
    protocolo: caso.protocolo,
    acompanhamento: caso.trackingToken ? `${variavel(env, 'SAC_ACOMPANHAR_URL')}/${caso.trackingToken}` : null,
    anexoRecebido,
  });
}
