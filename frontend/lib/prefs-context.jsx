'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { idiomas, traduzir } from '@/lib/i18n'

const PrefsContext = createContext(null)

const prefsIniciais = {
  altoContraste: false,
  fonteGrande: false,
  idioma: 'pt',
  tipos: { deslizamento: true, alagamento: true, vendaval: true, outros: true },
  raioM: 3000,
}

export function PrefsProvider({ children }) {
  const [prefs, setPrefs] = useState(prefsIniciais)

  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('hc', prefs.altoContraste)
    html.dataset.font = prefs.fonteGrande ? 'large' : 'normal'
    html.lang = idiomas.find((i) => i.id === prefs.idioma)?.htmlLang ?? 'pt-BR'
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', prefs.altoContraste ? '#000000' : '#0B3D3C')
  }, [prefs.altoContraste, prefs.fonteGrande, prefs.idioma])

  const atualizar = useCallback((patch) => setPrefs((atual) => ({ ...atual, ...patch })), [])

  const alternarTipo = useCallback(
    (tipo) => setPrefs((atual) => ({ ...atual, tipos: { ...atual.tipos, [tipo]: !atual.tipos[tipo] } })),
    [],
  )

  const t = useCallback((chave, vars) => traduzir(prefs.idioma, chave, vars), [prefs.idioma])

  const valor = useMemo(() => ({ prefs, atualizar, alternarTipo, t }), [prefs, atualizar, alternarTipo, t])

  return <PrefsContext.Provider value={valor}>{children}</PrefsContext.Provider>
}

export function usePrefs() {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs precisa estar dentro de PrefsProvider')
  return ctx
}
