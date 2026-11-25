export const usuario = {
  nome: 'Ryan Silva',
  iniciais: 'RS',
  email: 'ryan.silva@email.com',
}

export const ultimaAtualizacao = '14:32'

export const categoriasRisco = [
  { id: 'deslizamento', label: 'Deslizamento' },
  { id: 'alagamento', label: 'Alagamento' },
  { id: 'vendaval', label: 'Vendaval' },
  { id: 'outros', label: 'Outros' },
]

// Entidade: Alerta
export const alertas = [
  {
    id: 1,
    tipo: 'Deslizamento de encosta',
    categoria: 'deslizamento',
    local: 'Morro da Esperança',
    nivel_severidade: 'critico',
    status: 'ativo',
    minutosAtras: 18,
    fonte: 'Defesa Civil SP',
    instrucao: 'Saia agora da área de risco e siga para o abrigo mais próximo.',
  },
  {
    id: 2,
    tipo: 'Chuva torrencial',
    categoria: 'alagamento',
    local: 'Zona Leste',
    nivel_severidade: 'alto',
    status: 'ativo',
    minutosAtras: 45,
    fonte: 'INMET',
  },
  {
    id: 3,
    tipo: 'Risco de alagamento',
    categoria: 'alagamento',
    local: 'Marginal Tietê',
    nivel_severidade: 'medio',
    status: 'ativo',
    minutosAtras: 90,
    fonte: 'CGE São Paulo',
  },
  {
    id: 4,
    tipo: 'Ventos de até 60 km/h',
    categoria: 'vendaval',
    local: 'Zona Sul',
    nivel_severidade: 'info',
    status: 'ativo',
    minutosAtras: 120,
    fonte: 'INMET',
  },
  {
    id: 5,
    tipo: 'Alagamento na Av. Industrial',
    categoria: 'alagamento',
    local: 'Vila Industrial',
    nivel_severidade: 'medio',
    status: 'resolvido',
    minutosAtras: 260,
    fonte: 'CGE São Paulo',
  },
  {
    id: 6,
    tipo: 'Via interditada',
    categoria: 'outros',
    local: 'Rua das Acácias',
    nivel_severidade: 'info',
    status: 'resolvido',
    minutosAtras: 410,
    fonte: 'CET',
  },
]

// Entidade: Area_risco (coordenadas em um viewBox de 800x500)
export const areasRisco = [
  {
    id: 'ar-1',
    nome: 'Morro da Esperança',
    tipo: 'deslizamento',
    nivel: 'critico',
    status: 'ativo',
    pontos: '120,90 300,70 345,190 235,262 105,205',
    rotulo: { x: 215, y: 150 },
  },
  {
    id: 'ar-2',
    nome: 'Zona Leste',
    tipo: 'alagamento',
    nivel: 'alto',
    status: 'ativo',
    pontos: '525,105 705,85 745,215 605,272 510,210',
    rotulo: { x: 625, y: 170 },
  },
  {
    id: 'ar-3',
    nome: 'Marginal Tietê',
    tipo: 'alagamento',
    nivel: 'medio',
    status: 'ativo',
    pontos: '300,350 520,330 565,425 340,455',
    rotulo: { x: 430, y: 390 },
  },
  {
    id: 'ar-4',
    nome: 'Zona Sul',
    tipo: 'vendaval',
    nivel: 'info',
    status: 'ativo',
    pontos: '40,320 150,300 200,400 90,470 30,430',
    rotulo: { x: 110, y: 385 },
  },
  {
    id: 'ar-5',
    nome: 'Vila Industrial',
    tipo: 'alagamento',
    nivel: 'medio',
    status: 'resolvido',
    pontos: '600,320 730,305 765,400 640,440',
    rotulo: { x: 690, y: 370 },
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
    endereco: 'Rua das Palmeiras, 200 — Vila Nova, São Paulo, SP',
    coords: { lat: -23.5329, lng: -46.6395 },
    aceitaPets: true,
    capacidadePets: 15,
    vagasPets: 8,
    posicao: { x: 400, y: 235 },
  },
  {
    id: 'ab-2',
    nome: 'Ginásio Municipal Vila Nova',
    distanciaKm: 2.8,
    tempoMin: 24,
    vagas_disponiveis: 210,
    recomendado: false,
    endereco: 'Avenida dos Esportes, 1000 — Vila Nova, São Paulo, SP',
    coords: { lat: -23.5412, lng: -46.6521 },
    aceitaPets: false,
    capacidadePets: 0,
    vagasPets: 0,
    posicao: { x: 250, y: 345 },
  },
  {
    id: 'ab-3',
    nome: 'CEU Parque Leste',
    distanciaKm: 4.1,
    tempoMin: 35,
    vagas_disponiveis: 120,
    recomendado: false,
    endereco: 'Rua Santa Clara, 500 — Parque Leste, São Paulo, SP',
    coords: { lat: -23.5489, lng: -46.4731 },
    aceitaPets: true,
    capacidadePets: 20,
    vagasPets: 3,
    posicao: { x: 655, y: 385 },
  },
]

// Coordenadas mockadas da área de risco (rota de evacuação parte daqui)
export const areaRiscoCoords = { lat: -23.5275, lng: -46.6302 }

export const posicaoUsuario = { x: 318, y: 272 }

// Entidade: Pedido_ajuda
export const chamadoInicial = {
  protocolo: '#8962',
  descricao: 'Casa com rachaduras na encosta. Preciso de remoção para 4 moradores, incluindo uma criança.',
  localizacao: 'Rua das Acácias, 120 — Morro da Esperança',
  aberto_em: '14:21',
  etapaAtual: 1,
  horarios: ['14:21', '14:26', null],
}

export const etapasChamado = [
  { id: 'recebido', titulo: 'Recebido', descricao: 'A Defesa Civil recebeu o seu pedido.' },
  { id: 'atendimento', titulo: 'Em atendimento', descricao: 'Uma equipe está a caminho do local.' },
  { id: 'concluido', titulo: 'Concluído', descricao: 'O atendimento foi finalizado.' },
]

export const filtrosTipoMapa = [
  { id: 'todos', label: 'Todos' },
  { id: 'deslizamento', label: 'Deslizamento' },
  { id: 'alagamento', label: 'Alagamento' },
  { id: 'vendaval', label: 'Vendaval' },
  { id: 'abrigos', label: 'Abrigos' },
]

export const filtrosStatusMapa = [
  { id: 'todos', label: 'Todos' },
  { id: 'ativo', label: 'Ativo' },
  { id: 'resolvido', label: 'Resolvido' },
]

export const previsaoCinco = [
  { dia: 'Hoje', chuvaMm: 96, risco: 'critico', resumo: 'Solo saturado e chuva forte nas encostas.' },
  { dia: 'Amanhã', chuvaMm: 64, risco: 'alto', resumo: 'Chuva persistente, risco elevado na Zona Leste.' },
  { dia: 'Sábado', chuvaMm: 38, risco: 'medio', resumo: 'Instabilidade com pancadas isoladas.' },
  { dia: 'Domingo', chuvaMm: 12, risco: 'info', resumo: 'Redução gradual das chuvas.' },
  { dia: 'Segunda', chuvaMm: 4, risco: 'seguro', resumo: 'Tempo firme, mantendo monitoramento do solo.', rotulo: 'BAIXO' },
]

export const enderecosMock = [
  { logradouro: 'Rua das Acácias, 120', bairro: 'Morro da Esperança', cep: '02345-010' },
  { logradouro: 'Rua das Palmeiras, 45', bairro: 'Vila Nova', cep: '02345-120' },
  { logradouro: 'Avenida Brasil, 1500', bairro: 'Zona Leste', cep: '03050-000' },
  { logradouro: 'Rua do Rio, 88', bairro: 'Marginal Tietê', cep: '02150-200' },
  { logradouro: 'Rua Santa Clara, 310', bairro: 'Parque Leste', cep: '03140-030' },
  { logradouro: 'Alameda dos Ipês, 72', bairro: 'Zona Sul', cep: '04010-050' },
]

export const especiesPet = [
  { value: 'cao', label: 'Cão' },
  { value: 'gato', label: 'Gato' },
  { value: 'passaro', label: 'Pássaro' },
  { value: 'coelho', label: 'Coelho' },
  { value: 'roedor', label: 'Roedor' },
  { value: 'reptil', label: 'Réptil' },
  { value: 'peixe', label: 'Peixe' },
  { value: 'cavalo', label: 'Cavalo' },
  { value: 'outro', label: 'Outro' },
]

export const portesPet = [
  { id: 'pequeno', label: 'Pequeno' },
  { id: 'medio', label: 'Médio' },
  { id: 'grande', label: 'Grande' },
]

export const petsVazio = { ativo: false, quantidade: '1', especie: 'cao', especieOutro: '', porte: 'medio', foto: null }

// Fenômeno climático ativo (mockado, estruturado para vir de API depois)
export const fenomenoClimatico = {
  nome: 'El Niño',
  intensidade: 'moderado',
  intensidadeLabel: 'Moderado',
  descricao:
    'El Niño é o aquecimento anormal das águas do Pacífico que costuma aumentar o volume de chuvas no Sudeste do Brasil, elevando o risco de enchentes e deslizamentos.',
  impactoLocal:
    'Nos últimos eventos de El Niño, a Zona Leste registrou 40% mais ocorrências de alagamento entre dezembro e março. Nas encostas, como o Morro da Esperança, o solo tende a ficar saturado por mais tempo, o que exige atenção mesmo em dias de chuva moderada.',
}
