'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Executa uma busca na API e expõe os três estados da tela: carregando, erro e dados.
 * A busca é refeita quando `deps` mudam ou quando `recarregar()` é chamado.
 * Requisições antigas são canceladas (AbortController) para não sobrescrever dados novos.
 *
 * @param {(signal: AbortSignal) => Promise<any>} buscar
 * @param {any[]} deps
 */
export function useApi(buscar, deps = []) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: null })
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    const controle = new AbortController()
    setEstado((atual) => ({ ...atual, carregando: true, erro: null }))

    buscar(controle.signal)
      .then((dados) => setEstado({ dados, carregando: false, erro: null }))
      .catch((erro) => {
        if (erro?.name === 'AbortError') return
        // mantém os últimos dados válidos na tela mesmo se a atualização falhar
        setEstado((atual) => ({ dados: atual.dados, carregando: false, erro }))
      })

    return () => controle.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, versao])

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])

  return { ...estado, recarregar }
}
