'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

// Só o enquadramento inicial do mapa enquanto não há posição (centro de São Paulo).
// Nunca é usado como posição do usuário nem para calcular distâncias.
export const CENTRO_INICIAL_MAPA = { lat: -23.5505, lng: -46.6333 }

// Cidade escolhida na tela quando não há GPS nem endereço (fica no navegador).
const CHAVE_CIDADE = 'safezone.cidadeEscolhida'

function lerCidadeEscolhida() {
  try {
    const bruto = localStorage.getItem(CHAVE_CIDADE)
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

const ponto = (lat, lng) => (lat == null || lng == null ? null : { lat: Number(lat), lng: Number(lng) })

/**
 * Posição do usuário, nesta ordem:
 *   1. GPS do aparelho ('gps')
 *   2. ponto do endereço cadastrado ('endereco')
 *   3. sede da cidade do endereço ('cidade-endereco')
 *   4. sede da cidade escolhida na tela ('cidade-escolhida')
 *   5. nada: a tela pede para escolher a cidade ('sem-local')
 * Enquanto o GPS ou o endereço ainda estão carregando, origem = 'pendente'.
 *
 * @param {{ endereco?: object|null }} opcoes  EnderecoUsuarioResponse; undefined = ainda carregando
 * @returns {{ coords, origem, cidade, escolherCidade }}
 *   cidade = { nome, uf, codigoIbge } quando conhecida (do endereço ou escolhida)
 */
export function useLocalizacao({ endereco } = {}) {
  const [gps, setGps] = useState({ status: 'pendente', coords: null })
  const [cidadeEscolhida, setCidadeEscolhida] = useState(null)

  // localStorage só existe no navegador: lê depois de montar
  useEffect(() => {
    setCidadeEscolhida(lerCidadeEscolhida())
  }, [])

  useEffect(() => {
    let ativo = true
    const semGps = () => ativo && setGps({ status: 'indisponivel', coords: null })

    if (!('geolocation' in navigator)) {
      semGps()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => ativo && setGps({ status: 'ok', coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      semGps,
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    )

    return () => {
      ativo = false
    }
  }, [])

  const escolherCidade = useCallback((localidade) => {
    const cidade = localidade && {
      nome: localidade.nome,
      uf: localidade.uf,
      codigoIbge: localidade.codigoIbge,
      lat: Number(localidade.latitude),
      lng: Number(localidade.longitude),
    }
    try {
      if (cidade) localStorage.setItem(CHAVE_CIDADE, JSON.stringify(cidade))
      else localStorage.removeItem(CHAVE_CIDADE)
    } catch {
      // navegador sem armazenamento: a escolha vale só nesta visita
    }
    setCidadeEscolhida(cidade)
  }, [])

  const cidadeDoEndereco = endereco ? { nome: endereco.cidade, uf: endereco.uf, codigoIbge: endereco.codigoIbge } : null
  const cidadeDaTela = cidadeEscolhida && {
    nome: cidadeEscolhida.nome,
    uf: cidadeEscolhida.uf,
    codigoIbge: cidadeEscolhida.codigoIbge,
  }
  const cidade = cidadeDoEndereco ?? cidadeDaTela

  const { coords, origem } = useMemo(() => {
    if (gps.status === 'ok') return { coords: gps.coords, origem: 'gps' }
    if (gps.status === 'pendente' || endereco === undefined) return { coords: null, origem: 'pendente' }

    const doEndereco = endereco && ponto(endereco.latitude, endereco.longitude)
    if (doEndereco) return { coords: doEndereco, origem: 'endereco' }

    const sede = endereco && ponto(endereco.cidadeLatitude, endereco.cidadeLongitude)
    if (sede) return { coords: sede, origem: 'cidade-endereco' }

    const escolhida = cidadeEscolhida && ponto(cidadeEscolhida.lat, cidadeEscolhida.lng)
    if (escolhida) return { coords: escolhida, origem: 'cidade-escolhida' }

    return { coords: null, origem: 'sem-local' }
  }, [gps, endereco, cidadeEscolhida])

  return { coords, origem, cidade, escolherCidade }
}
