'use client'

import { useEffect, useState } from 'react'

// Usado quando o navegador nega/não tem geolocalização (centro de São Paulo).
export const LOCALIZACAO_PADRAO = { lat: -23.5505, lng: -46.6333 }

/**
 * Posição atual do usuário pelo navegador.
 * `coords` fica null até resolver; `origem` diz se veio do GPS ou do padrão.
 * Quando houver usuário logado, o endereço do cadastro pode virar o fallback.
 */
export function useLocalizacao() {
  const [estado, setEstado] = useState({ coords: null, origem: 'pendente' })

  useEffect(() => {
    let ativo = true
    const usarPadrao = () => ativo && setEstado({ coords: LOCALIZACAO_PADRAO, origem: 'padrao' })

    if (!('geolocation' in navigator)) {
      usarPadrao()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        ativo &&
        setEstado({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          origem: 'gps',
        }),
      usarPadrao,
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    )

    return () => {
      ativo = false
    }
  }, [])

  return estado
}
