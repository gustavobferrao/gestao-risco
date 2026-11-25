// Adaptadores: convertem os DTOs da API para o formato que os componentes já usam.
// Mantém as telas desacopladas dos nomes/enums do backend.

// Severidade do alerta (API) -> chave de lib/severity.js
export const SEVERIDADE_API_PARA_FRONT = {
  CRITICO: 'critico',
  ALTO: 'alto',
  MEDIO: 'medio',
  BAIXO: 'info',
}

// Inverso, para quando o front enviar severidade à API (emissão de alerta)
export const SEVERIDADE_FRONT_PARA_API = Object.fromEntries(
  Object.entries(SEVERIDADE_API_PARA_FRONT).map(([api, front]) => [front, api]),
)

// Nível de risco da área (API não tem CRITICO)
const NIVEL_RISCO_API_PARA_FRONT = {
  ALTO: 'alto',
  MEDIO: 'medio',
  BAIXO: 'info',
}

const STATUS_ALERTA_API_PARA_FRONT = {
  ATIVO: 'ativo',
  ENCERRADO: 'resolvido',
  CANCELADO: 'cancelado',
}

// A API ainda não tem instrução por alerta: usa um texto padrão por severidade.
const INSTRUCAO_PADRAO = {
  critico: 'Saia agora da área de risco e siga para o abrigo mais próximo.',
  alto: 'Evite a área afetada e fique atento às orientações da Defesa Civil.',
  medio: 'Acompanhe as atualizações e evite deslocamentos desnecessários na área.',
  info: 'Fique atento às atualizações da Defesa Civil.',
}

const VELOCIDADE_CAMINHADA_KMH = 5

/** Minutos decorridos desde uma data ISO sem fuso (LocalDateTime do Java = horário local). */
export function minutosDesde(dataIso) {
  if (!dataIso) return 0
  const diff = Date.now() - new Date(dataIso).getTime()
  return Math.max(0, Math.round(diff / 60000))
}

const paraNumero = (v) => (v === null || v === undefined ? null : Number(v))

function coordenadas(latitude, longitude) {
  const lat = paraNumero(latitude)
  const lng = paraNumero(longitude)
  return lat === null || lng === null ? null : { lat, lng }
}

/** AlertaResponse -> alerta do front (lib/mock-data.js#alertas) */
export function adaptarAlerta(a) {
  const nivel = SEVERIDADE_API_PARA_FRONT[a.nivelSeveridade] ?? 'info'
  const areas = a.areas ?? []
  return {
    id: a.id,
    tipo: a.tipo,
    nivel_severidade: nivel,
    status: STATUS_ALERTA_API_PARA_FRONT[a.status] ?? 'ativo',
    local: areas.map((ar) => ar.nome).join(', ') || 'Área não informada',
    areas,
    fonte: a.orgaoNome,
    orgaoId: a.orgaoId,
    dataEmissao: a.dataEmissao,
    minutosAtras: minutosDesde(a.dataEmissao),
    instrucao: INSTRUCAO_PADRAO[nivel],
  }
}

/** AreaRiscoResumoResponse -> zona do mapa */
export function adaptarAreaRisco(a) {
  return {
    id: a.id,
    nome: a.nome,
    nivel: NIVEL_RISCO_API_PARA_FRONT[a.nivelRisco] ?? 'info',
    zona: a.zona,
    localidadeId: a.localidadeId,
    localidade: a.localidadeNome,
    alertasAtivos: Number(a.alertasAtivos ?? 0),
    // a API não tem status da área: "ativo" = tem alerta ativo agora
    status: Number(a.alertasAtivos ?? 0) > 0 ? 'ativo' : 'resolvido',
    coords: coordenadas(a.latitude, a.longitude),
  }
}

/** AbrigoProximoResponse -> abrigo do front (lib/mock-data.js#abrigos) */
export function adaptarAbrigo(a) {
  const distanciaKm = Math.round(Number(a.distanciaKm) * 10) / 10
  return {
    id: a.id,
    nome: a.nome,
    telefone: a.telefone,
    endereco: [a.logradouro, a.bairro].filter(Boolean).join(' — '),
    cep: a.cep,
    capacidade: a.capacidadeTotal,
    vagas_disponiveis: a.vagasDisponiveis,
    distanciaKm,
    // estimativa a pé; a API não calcula rota
    tempoMin: Math.max(1, Math.round((distanciaKm / VELOCIDADE_CAMINHADA_KMH) * 60)),
    coords: coordenadas(a.latitude, a.longitude),
    // a API/banco ainda não têm dados de pets: null = "sem informação"
    aceitaPets: null,
    capacidadePets: null,
    vagasPets: null,
    recomendado: false,
  }
}

const MINUTOS_POR_DIA = 24 * 60

/** HistoricoItemResponse (+ área de onde veio) -> item da linha do tempo do agente */
export function adaptarOcorrencia(o, area) {
  return {
    id: `oc-${o.id}`,
    origem: 'ocorrencia',
    data: o.dataOcorrencia,
    diasAtras: Math.floor(minutosDesde(o.dataOcorrencia) / MINUTOS_POR_DIA),
    categoria: o.classificacao, // Hidrológico, Geológico, Meteorológico, Climatológico
    titulo: o.evento,
    area: area.nome,
    areas: [{ id: area.id, nome: area.nome }],
    nivel: area.nivel, // a ocorrência não tem nível próprio: usa o da área
  }
}

/** AreaRiscoDetalheResponse -> tela de detalhe da área */
export function adaptarAreaDetalhe(d) {
  return {
    id: d.id,
    nome: d.nome,
    descricao: d.descricao,
    zona: d.zona,
    nivel: NIVEL_RISCO_API_PARA_FRONT[d.nivelRisco] ?? 'info',
    populacaoAfetada: d.populacaoAfetada,
    coords: coordenadas(d.latitude, d.longitude),
    localidade: d.localidade, // { id, nome, populacao, area (km²) }
    enderecos: d.enderecos ?? [],
    alertasAtivos: (d.alertasAtivos ?? []).map(adaptarAlerta),
    historico: (d.historico ?? [])
      .map((h) => ({ id: h.id, evento: h.evento, classificacao: h.classificacao, data: h.dataOcorrencia }))
      .sort((a, b) => new Date(b.data) - new Date(a.data)),
  }
}

/** Alerta já adaptado -> item da linha do tempo do agente */
export function alertaComoHistorico(a) {
  return {
    id: `al-${a.id}`,
    origem: 'alerta',
    data: a.dataEmissao,
    diasAtras: Math.floor(a.minutosAtras / MINUTOS_POR_DIA),
    categoria: 'alerta',
    titulo: `Alerta emitido: ${a.tipo}`,
    area: a.local,
    areas: a.areas ?? [],
    nivel: a.nivel_severidade,
  }
}

/** Marca como recomendado o abrigo mais próximo que ainda tem vagas. */
export function marcarRecomendado(abrigos) {
  const indice = abrigos.findIndex((a) => a.vagas_disponiveis > 0)
  return abrigos.map((a, i) => (i === indice ? { ...a, recomendado: true } : a))
}
