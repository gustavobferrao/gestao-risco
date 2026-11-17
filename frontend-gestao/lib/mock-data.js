export const usuario = {
  nome: 'Ryan Silva',
  iniciais: 'RS',
  status: 'Online · atualizado agora',
}

export const localidade = {
  cidade: 'São Paulo',
  uf: 'SP',
  temperatura: 21,
}

export const abas = [
  { id: 'visao-geral', titulo: 'Visão geral', subtitulo: 'Resumo da região' },
  { id: 'mapa', titulo: 'Mapa de riscos', subtitulo: 'Zonas e abrigos' },
  { id: 'previsao', titulo: 'Previsão IA', subtitulo: 'Próximos 5 dias' },
  { id: 'chamado', titulo: 'Meu chamado', subtitulo: 'Protocolo #8962' },
]

// Classes completas para o Tailwind detectar em build.
export const severidades = {
  critico: {
    label: 'CRÍTICO',
    dot: 'bg-rose-600',
    text: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-700',
    stroke: '#E11D48',
    fill: 'rgba(225, 29, 72, 0.18)',
    pin: 'bg-rose-600',
  },
  alto: {
    label: 'ALTO',
    dot: 'bg-amber-500',
    text: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-700',
    stroke: '#F59E0B',
    fill: 'rgba(245, 158, 11, 0.2)',
    pin: 'bg-amber-500',
  },
  medio: {
    label: 'MÉDIO',
    dot: 'bg-yellow-400',
    text: 'text-yellow-600',
    badge: 'bg-yellow-50 text-yellow-700',
    stroke: '#EAB308',
    fill: 'rgba(234, 179, 8, 0.2)',
    pin: 'bg-yellow-500',
  },
}

// Entidade: Alerta
export const alertas = [
  {
    id: 1,
    tipo: 'Deslizamento de encosta',
    local: 'Morro da Esperança',
    nivel_severidade: 'critico',
    status: 'ativo',
    data_emissao: '2026-11-12T09:42:00',
    minutosAtras: 18,
    fonte: 'Defesa Civil SP',
  },
  {
    id: 2,
    tipo: 'Chuva torrencial',
    local: 'Zona Leste',
    nivel_severidade: 'alto',
    status: 'ativo',
    data_emissao: '2026-11-12T09:15:00',
    minutosAtras: 45,
    fonte: 'INMET',
  },
  {
    id: 3,
    tipo: 'Risco de alagamento',
    local: 'Marginal Tietê',
    nivel_severidade: 'medio',
    status: 'monitorando',
    data_emissao: '2026-11-12T08:30:00',
    minutosAtras: 90,
    fonte: 'CGE São Paulo',
  },
]

// Entidade: Area_risco (coordenadas em um viewBox de 800x500)
export const areasRisco = [
  {
    id: 'ar-1',
    nome: 'Morro da Esperança',
    zona: 'Zona Norte',
    tipo: 'deslizamento',
    nivel: 'critico',
    pontos: '120,90 300,70 345,190 235,262 105,205',
    rotulo: { x: 215, y: 150 },
  },
  {
    id: 'ar-2',
    nome: 'Zona Leste',
    zona: 'Zona Leste',
    tipo: 'alagamento',
    nivel: 'alto',
    pontos: '525,105 705,85 745,215 605,272 510,210',
    rotulo: { x: 625, y: 170 },
  },
  {
    id: 'ar-3',
    nome: 'Marginal Tietê',
    zona: 'Zona Oeste',
    tipo: 'alagamento',
    nivel: 'medio',
    pontos: '300,350 520,330 565,425 340,455',
    rotulo: { x: 430, y: 390 },
  },
]

// Entidade: Abrigo
export const abrigos = [
  {
    id: 'ab-1',
    nome: 'E.E. Maria Montessori',
    distanciaKm: 1.2,
    tempoMin: 12,
    vagas_disponiveis: 84,
    recomendado: true,
    posicao: { x: 400, y: 235 },
  },
  {
    id: 'ab-2',
    nome: 'Ginásio Municipal Vila Nova',
    distanciaKm: 2.8,
    tempoMin: 24,
    vagas_disponiveis: 210,
    recomendado: false,
    posicao: { x: 170, y: 365 },
  },
  {
    id: 'ab-3',
    nome: 'CEU Parque Leste',
    distanciaKm: 4.1,
    tempoMin: 35,
    vagas_disponiveis: 120,
    recomendado: false,
    posicao: { x: 655, y: 385 },
  },
]

export const posicaoUsuario = { x: 318, y: 272 }

// Entidade: Pedido_ajuda
export const pedidoAjuda = {
  protocolo: '#8962',
  status: 'Equipe a caminho',
  tipo: 'Remoção de moradores',
  aberto_em: '09:51',
  etapas: [
    { titulo: 'Pedido recebido', hora: '09:51', concluida: true },
    { titulo: 'Triagem pela Defesa Civil', hora: '09:54', concluida: true },
    { titulo: 'Equipe a caminho', hora: '10:02', concluida: true },
    { titulo: 'Atendimento no local', hora: 'Previsto 10:20', concluida: false },
  ],
}

export const filtrosMapa = [
  { id: 'todas', label: 'Todas' },
  { id: 'deslizamento', label: 'Deslizamento' },
  { id: 'alagamento', label: 'Alagamento' },
  { id: 'abrigos', label: 'Abrigos' },
]

export const previsaoCinco = [
  { dia: 'Hoje', chuvaMm: 96, risco: 'critico', resumo: 'Solo saturado e chuva forte nas encostas.' },
  { dia: 'Amanhã', chuvaMm: 64, risco: 'alto', resumo: 'Chuva persistente, risco elevado na Zona Leste.' },
  { dia: 'Sábado', chuvaMm: 38, risco: 'medio', resumo: 'Instabilidade com pancadas isoladas.' },
  { dia: 'Domingo', chuvaMm: 12, risco: 'medio', resumo: 'Redução gradual das chuvas.' },
  { dia: 'Segunda', chuvaMm: 4, risco: 'baixo', resumo: 'Tempo firme, mantendo monitoramento do solo.' },
]
