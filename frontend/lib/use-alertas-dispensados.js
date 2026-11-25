'use client'

import { useCallback, useEffect, useState } from 'react'

const prefixo = 'safezone.alertasDispensados.'

function ler(chave) {
  try {
    const lista = JSON.parse(localStorage.getItem(chave) ?? '[]')
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

/**
 * Alertas críticos que o usuário já dispensou da tela cheia.
 * Fica salvo no navegador, por usuário: recarregar a página ou entrar de novo não
 * reabre o mesmo alerta. Um alerta crítico NOVO (outro id) aparece normalmente.
 */
export function useAlertasDispensados(usuarioId) {
  const chave = `${prefixo}${usuarioId ?? 'anonimo'}`
  const [ids, setIds] = useState(() => new Set())

  // lê do navegador depois de montar (localStorage não existe no servidor)
  useEffect(() => {
    setIds(new Set(ler(chave)))
  }, [chave])

  const foiDispensado = useCallback((id) => ids.has(id), [ids])

  const dispensar = useCallback(
    (id) => {
      setIds((atual) => {
        if (atual.has(id)) return atual
        const novo = new Set(atual).add(id)
        // guarda só os mais recentes para a lista não crescer para sempre
        localStorage.setItem(chave, JSON.stringify([...novo].slice(-50)))
        return novo
      })
    },
    [chave],
  )

  return { foiDispensado, dispensar }
}
