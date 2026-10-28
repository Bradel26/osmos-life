/**
 * POST /api/sac — Cloudflare Pages Function do site osmoslife.com.br.
 *
 * Recebe o formulario do SAC (multipart, com ate 5 anexos opcionais), confere o
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

const MAXIMO_ANEXOS_PADRAO = 5;
const TAMANHO_MAXIMO_MB_PADRAO = 15;

function limite(env, nome, padrao, maximo) {
  const valor = Number(env[nome]);
  return Number.isInteger(valor) && valor > 0 && valor <= maximo ? valor : padrao;
}

function limitesAnexos(env) {
  return {
    quantidade: limite(env, 'SAC_MAXIMO_ANEXOS', MAXIMO_ANEXOS_PADRAO, 20),
    tamanhoMb: limite(env, 'SAC_ANEXO_MAX_MB', TAMANHO_MAXIMO_MB_PADRAO, 100),
  };
}

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
  const configAnexos = limitesAnexos(env);
  const tamanhoMaximoAnexo = configAnexos.tamanhoMb * 1024 * 1024;

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
    modelo: texto(form, 'modelo') || undefined,
    serie: texto(form, 'serie') || undefined,
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

  // Anexos: falha aqui nao derruba o protocolo ja aberto. O Nexus registra na ficha
  // o arquivo que nao foi salvo e o cliente e avisado para envia-lo de novo.
  const anexosRecebidos = form.getAll('anexo').filter((a) => a && typeof a !== 'string' && a.size > 0);
  const anexos = anexosRecebidos.slice(0, configAnexos.quantidade);
  const naoSalvos = anexosRecebidos.slice(configAnexos.quantidade).map((anexo) => anexo.name);
  for (const anexo of anexos) {
    let salvo = false;
    if (anexo.size <= tamanhoMaximoAnexo) {
      try {
        const corpo = new FormData();
        corpo.append('file', anexo, anexo.name);
        const r = await fetch(`${apiUrl}/integracao/site/cases/${encodeURIComponent(caso.trackingToken)}/anexo`, {
          method: 'POST',
          headers: cabecalhos,
          body: corpo,
        });
        salvo = r.ok;
      } catch {
        salvo = false;
      }
    }
    if (!salvo) naoSalvos.push(anexo.name);
  }

  return resposta(200, {
    ok: true,
    protocolo: caso.protocolo,
    acompanhamento: caso.trackingToken ? `${variavel(env, 'SAC_ACOMPANHAR_URL')}/${caso.trackingToken}` : null,
    anexoRecebido: anexos.length ? naoSalvos.length === 0 : null,
    anexosNaoSalvos: naoSalvos,
  });
}

export async function onRequestGet({ env }) {
  return resposta(200, { ok: true, limitesAnexos: limitesAnexos(env) });
}
