// Cliente HTTP central: toda chamada à API passa por aqui.
// Concentra URL base, JSON, tratamento de erro e (futuramente) autenticação.

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')

const MENSAGENS_PADRAO = {
  0: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
  400: 'Dados inválidos. Verifique as informações enviadas.',
  401: 'Sessão inválida. Entre novamente.',
  403: 'Você não tem permissão para realizar esta operação.',
  404: 'Recurso não encontrado.',
  409: 'A operação conflita com dados existentes.',
  422: 'Não foi possível realizar a operação.',
}

// Sessão atual, preenchida pelo AuthProvider (lib/auth-context.jsx).
// Hoje a API identifica o usuário pelo cabeçalho X-Usuario-Id; quando houver JWT,
// só esta parte muda (vira Authorization: Bearer <token>).
const sessao = { usuarioId: null, aoPerderSessao: null }

/** Chamado pelo AuthProvider ao entrar/sair. */
export function definirSessao({ usuarioId = null, aoPerderSessao = null } = {}) {
  sessao.usuarioId = usuarioId
  sessao.aoPerderSessao = aoPerderSessao
}

/**
 * Erro vindo da API. A API responde com ProblemDetail (RFC 9457):
 * { status, detail, campos?: { campo: mensagem }, erros?: [mensagem] }.
 */
export class ApiError extends Error {
  constructor(status, mensagem, { campos = null, erros = null } = {}) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.campos = campos // erros de validação por campo (400 do @Valid)
    this.erros = erros // erros de parâmetros (400 de @RequestParam)
  }
}

function montarUrl(caminho, params) {
  const url = new URL(BASE_URL + caminho)
  if (params) {
    for (const [chave, valor] of Object.entries(params)) {
      if (valor !== undefined && valor !== null && valor !== '') url.searchParams.set(chave, valor)
    }
  }
  return url
}

function lerJson(texto) {
  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}

/**
 * Faz uma requisição à API e devolve o JSON da resposta.
 * Lança ApiError em falha de rede ou status >= 400.
 *
 * @param {string} caminho  ex.: '/api/alertas'
 * @param {{ metodo?: string, corpo?: any, params?: object, headers?: object, signal?: AbortSignal }} opcoes
 */
export async function api(caminho, { metodo = 'GET', corpo, params, headers, signal } = {}) {
  const temCorpo = corpo !== undefined

  let resposta
  try {
    resposta = await fetch(montarUrl(caminho, params), {
      method: metodo,
      headers: {
        Accept: 'application/json',
        ...(temCorpo && { 'Content-Type': 'application/json' }),
        ...(sessao.usuarioId && { 'X-Usuario-Id': String(sessao.usuarioId) }),
        ...headers,
      },
      body: temCorpo ? JSON.stringify(corpo) : undefined,
      signal,
    })
  } catch (erro) {
    if (erro.name === 'AbortError') throw erro
    throw new ApiError(0, MENSAGENS_PADRAO[0])
  }

  const texto = resposta.status === 204 ? '' : await resposta.text()
  const dados = texto ? lerJson(texto) : null

  if (!resposta.ok) {
    // em erro de parâmetro o "detail" é genérico; o motivo real vem na lista "erros"
    const mensagem = dados?.erros?.length
      ? dados.erros.join(' ')
      : (dados?.detail ?? MENSAGENS_PADRAO[resposta.status] ?? 'Erro inesperado no servidor. Tente novamente.')
    // 401 fora do login = sessão inválida: volta para a tela de login.
    // (no /api/auth/login, 401 é só "e-mail ou senha inválidos" e a tela trata)
    if (resposta.status === 401 && !caminho.startsWith('/api/auth/')) sessao.aoPerderSessao?.()
    throw new ApiError(resposta.status, mensagem, { campos: dados?.campos, erros: dados?.erros })
  }

  return dados
}
