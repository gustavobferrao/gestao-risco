'use client'

import { useEffect, useRef } from 'react'
import { House, ShieldCheck, Siren } from 'lucide-react'
import { cn } from '@/lib/utils'

export const tiposSOS = {
  resgate: {
    id: 'resgate',
    label: 'Preciso de resgate',
    curto: 'Resgate',
    Icon: Siren,
    descricao: 'Preciso de resgate urgente. ',
    classe: 'border-crit bg-crit-soft text-crit-ink',
    icone: 'bg-crit text-white',
  },
  abrigo: {
    id: 'abrigo',
    label: 'Preciso de abrigo',
    curto: 'Abrigo',
    Icon: House,
    descricao: 'Preciso de vaga em abrigo. ',
    classe: 'border-high bg-high-soft text-high-ink',
    icone: 'bg-high text-white',
  },
  seguro: {
    id: 'seguro',
    label: 'Estou seguro, só avisar',
    curto: 'Aviso de segurança',
    Icon: ShieldCheck,
    descricao: 'Estou em local seguro. ',
    classe: 'border-safe bg-safe-soft text-safe-ink',
    icone: 'bg-safe text-white',
  },
}

export function SOSQuickMenu({ onEscolher, onFechar }) {
  const primeiro = useRef(null)

  useEffect(() => {
    primeiro.current?.focus()
    const aoTeclar = (e) => e.key === 'Escape' && onFechar()
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  return (
    <>
      <button
        type="button"
        aria-label="Fechar menu de SOS"
        tabIndex={-1}
        onClick={onFechar}
        className="fixed inset-0 z-[108] cursor-default bg-black/50"
      />
      <div
        id="sos-menu"
        role="menu"
        aria-label="O que você precisa?"
        className="sos-menu-in fixed bottom-28 right-4 z-[111] flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2 sm:bottom-32 sm:right-6"
      >
        <p className="px-1 text-right text-sm font-bold text-white">O que você precisa?</p>
        {Object.values(tiposSOS).map((tipo, i) => (
          <button
            key={tipo.id}
            ref={i === 0 ? primeiro : undefined}
            type="button"
            role="menuitem"
            onClick={() => onEscolher(tipo.id)}
            className={cn(
              'flex min-h-14 items-center gap-3 rounded-2xl border-2 bg-surface px-3 py-2 text-left text-lg font-extrabold shadow-xl',
              tipo.classe,
            )}
          >
            <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', tipo.icone)}>
              <tipo.Icon className="size-5" aria-hidden="true" />
            </span>
            {tipo.label}
          </button>
        ))}
      </div>
    </>
  )
}
