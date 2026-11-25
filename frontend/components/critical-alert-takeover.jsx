'use client'

import { useEffect, useRef } from 'react'
import { MapPin, OctagonAlert, Route, ShieldCheck } from 'lucide-react'
import { MapsRedirectButton } from '@/components/maps-redirect-button'
import { usePrefs } from '@/lib/prefs-context'

export function CriticalAlertTakeover({ alerta, abrigo, onRota, onSeguro, onFechar }) {
  const { t } = usePrefs()
  const botaoPrincipal = useRef(null)
  const botaoSeguro = useRef(null)
  // sempre a versão mais recente de onFechar, sem reconfigurar o efeito abaixo
  const fecharRef = useRef(onFechar)
  useEffect(() => {
    fecharRef.current = onFechar
  }, [onFechar])

  // Configura só ao abrir: se rodasse a cada render, roubaria o foco de volta
  // toda vez que o painel atualizasse (alertas, localização, abrigos).
  useEffect(() => {
    // sem abrigo não há botão de rota: o foco vai para "Estou seguro"
    ;(botaoPrincipal.current ?? botaoSeguro.current)?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const aoTeclar = (e) => e.key === 'Escape' && fecharRef.current()
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [])

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="takeover-titulo"
      aria-describedby="takeover-instrucao"
      className="fixed inset-0 z-[100] overflow-y-auto bg-gradient-to-b from-[#7F1D1D] via-[#991B1B] to-[#450A0A] text-white"
    >
      <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center gap-6 px-5 pb-32 pt-12 text-center">
        <span className="flex size-28 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/40">
          <OctagonAlert className="size-16" aria-hidden="true" />
        </span>

        <p className="rounded-full bg-white px-4 py-1.5 text-base font-extrabold tracking-widest text-[#991B1B]">
          {t('take.tag')}
        </p>

        <div className="flex flex-col gap-3">
          <h1 id="takeover-titulo" className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            {alerta.tipo}
          </h1>
          <p className="flex items-center justify-center gap-2 text-xl font-semibold text-white/90">
            <MapPin className="size-6" aria-hidden="true" />
            {alerta.local}
          </p>
        </div>

        <p id="takeover-instrucao" className="text-balance text-2xl font-bold leading-snug">
          {alerta.instrucao}
        </p>

        {abrigo && (
          <p className="rounded-xl bg-black/25 px-4 py-3 text-lg font-semibold">
            {abrigo.nome} · {abrigo.distanciaKm.toString().replace('.', ',')} km · {abrigo.tempoMin} min
          </p>
        )}

        <div className="flex w-full flex-col gap-3">
          {abrigo && (
            <MapsRedirectButton
              anchorRef={botaoPrincipal}
              variante="claro"
              Icon={Route}
              coords={abrigo.coords}
              endereco={abrigo.endereco}
              destinoNome={abrigo.nome}
              onClick={onRota}
            >
              {t('take.route')}
            </MapsRedirectButton>
          )}
          <button
            ref={botaoSeguro}
            type="button"
            onClick={onSeguro}
            className="flex min-h-16 items-center justify-center gap-3 rounded-2xl border-4 border-white px-6 text-xl font-extrabold text-white"
          >
            <ShieldCheck className="size-6" aria-hidden="true" />
            {t('take.safe')}
          </button>
          <button
            type="button"
            onClick={onFechar}
            className="min-h-12 text-base font-bold text-white underline underline-offset-4"
          >
            {t('take.dismiss')}
          </button>
        </div>
      </div>
    </div>
  )
}
