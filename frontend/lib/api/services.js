// Serviços por recurso. Os componentes chamam só estas funções, nunca fetch direto.
// Endpoints que exigem usuário (X-Usuario-Id) ficam para a etapa de autenticação.

import { api } from '@/lib/api/client'
import {
  adaptarAbrigo,
  adaptarAlerta,
  adaptarAreaDetalhe,
  adaptarAreaRisco,
  adaptarOcorrencia,
  marcarRecomendado,
} from '@/lib/api/adapters'

// a API exige CPF e telefone só com dígitos
const soDigitos = (v = '') => v.replace(/\D/g, '')

function corpoCadastro({ nome, cpf, telefone, email, senha, endereco }) {
  return {
    nome: nome.trim(),
    cpf: soDigitos(cpf),
    telefone: soDigitos(telefone),
    email: email.trim(),
    senha,
    ...(endereco && { endereco: corpoEndereco(endereco) }),
  }
}

const textoOuNulo = (v) => (v && v.trim() ? v.trim() : null)

/**
 * Endereço para a API. modo 'completo' manda CEP e rua (o código IBGE vai junto
 * só como reserva, caso o ViaCEP esteja fora); modo 'cidade' manda só o código IBGE.
 */
export function corpoEndereco({ modo, cep, logradouro, numero, complemento, bairro, codigoIbge, gps, consentimento }) {
  const base = {
    codigoIbge: codigoIbge || null,
    latitude: gps?.lat ?? null,
    longitude: gps?.lng ?? null,
    consentimento: Boolean(consentimento),
  }
  if (modo === 'cidade') return base
  return {
    ...base,
    cep: soDigitos(cep),
    logradouro: textoOuNulo(logradouro),
    numero: textoOuNulo(numero),
    complemento: textoOuNulo(complemento),
    bairro: textoOuNulo(bairro),
  }
}

export const authService = {
  /** Devolve UsuarioResponse: { id, nome, email, telefone, perfil, orgaoId, orgaoNome } */
  login({ email, senha }) {
    return api('/api/auth/login', { metodo: 'POST', corpo: { email: email.trim(), senha } })
  },

  /** Cadastro público: a API sempre cria CIDADAO. */
  cadastrar(dados) {
    return api('/api/auth/cadastro', { metodo: 'POST', corpo: corpoCadastro(dados) })
  },
}

export const agentesService = {
  /** Só um agente logado pode chamar; o novo agente entra no órgão de quem cadastrou. */
  cadastrar(dados) {
    return api('/api/agentes', { metodo: 'POST', corpo: corpoCadastro(dados) })
  },
}

export const alertasService = {
  /** @param {{ status?: 'ATIVO'|'ENCERRADO'|'CANCELADO', areaId?: number }} filtros */
  async listar(filtros = {}, { signal } = {}) {
    const dados = await api('/api/alertas', { params: filtros, signal })
    return dados.map(adaptarAlerta)
  },
}

export const areasRiscoService = {
  /** @param {{ localidadeId?: number, nivel?: 'BAIXO'|'MEDIO'|'ALTO', zona?: 'URBANA'|'RURAL' }} filtros */
  async listar(filtros = {}, { signal } = {}) {
    const dados = await api('/api/areas-risco', { params: filtros, signal })
    return dados.map(adaptarAreaRisco)
  },

  async detalhar(id, { signal } = {}) {
    return adaptarAreaDetalhe(await api(`/api/areas-risco/${id}`, { signal }))
  },

  historico(id, { signal } = {}) {
    return api(`/api/areas-risco/${id}/historico`, { signal })
  },

  /**
   * Ocorrências de todas as áreas, já adaptadas.
   * A API só tem histórico por área: faz 1 + N requisições em paralelo.
   * Se o número de áreas crescer, vale criar GET /api/ocorrencias no backend.
   */
  async historicoGeral({ signal } = {}) {
    const areas = await this.listar({}, { signal })
    const listas = await Promise.all(
      areas.map(async (area) => {
        const itens = await this.historico(area.id, { signal })
        return itens.map((o) => adaptarOcorrencia(o, area))
      }),
    )
    return listas.flat()
  },
}

export const abrigosService = {
  /** Abrigos mais próximos da coordenada, já ordenados por distância. */
  async proximos({ lat, lng, limite }, { signal } = {}) {
    const dados = await api('/api/abrigos/proximos', { params: { lat, lng, limite }, signal })
    return marcarRecomendado(dados.map(adaptarAbrigo))
  },
}

export const localidadesService = {
  listar({ signal } = {}) {
    return api('/api/localidades', { signal })
  },

  /** Só as cidades cobertas pelo SafeZone, com código IBGE e ponto da sede. */
  atendidas({ signal } = {}) {
    return api('/api/localidades', { params: { atendidas: true }, signal })
  },
}

export const cepService = {
  /** { cep, logradouro, bairro, cidade, uf, codigoIbge, atendida }. 404 = CEP não existe. */
  consultar(cep, { signal } = {}) {
    return api(`/api/cep/${soDigitos(cep)}`, { signal })
  },
}

export const enderecoService = {
  /** Endereço do usuário logado, ou null se ele ainda não informou (204). */
  buscar({ signal } = {}) {
    return api('/api/usuarios/me/endereco', { signal })
  },

  salvar(endereco) {
    return api('/api/usuarios/me/endereco', { metodo: 'PUT', corpo: corpoEndereco(endereco) })
  },

  remover() {
    return api('/api/usuarios/me/endereco', { metodo: 'DELETE' })
  },
}

export const eventosClimaticosService = {
  listar({ signal } = {}) {
    return api('/api/eventos-climaticos', { signal })
  },
}
