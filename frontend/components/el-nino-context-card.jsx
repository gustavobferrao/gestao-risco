'use client'

import { useCallback, useState } from 'react'
import { ArrowRight, ExternalLink, Newspaper, Waves } from 'lucide-react'
import { AlertBadge } from '@/components/alert-badge'
import { Modal } from '@/components/agent/modal'

// Portal externo de notícias sobre o fenômeno (abre em nova aba).
export const LINK_NOTICIAS_EL_NINO = 'https://sosbrasil-noticias.mysoftr.app/'

const niveis = {
  fraco: 'medio',
  moderado: 'alto',
  forte: 'critico',
}

function PopupElNino({ fenomeno, onFechar }) {
  return (
    <Modal titulo={`${fenomeno.nome}: o que está acontecendo`} descricao="Fenômeno climático ativo" onFechar={onFechar}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <AlertBadge nivel={niveis[fenomeno.intensidade]} rotulo={fenomeno.intensidadeLabel.toUpperCase()} />
          <span className="text-sm font-bold text-ink2">Intensidade atual</span>
        </div>

        <p className="text-base leading-relaxed">{fenomeno.descricao}</p>

        <section className="flex flex-col gap-2 rounded-xl border-l-4 border-info bg-info-soft p-4 text-info-ink">
          <h3 className="text-base font-extrabold">O que isso significa para a sua região</h3>
          <p className="text-base leading-relaxed">{fenomeno.impactoLocal}</p>
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border-2 border-line bg-bg p-4">
          <p className="flex items-start gap-2 text-base font-semibold">
            <Newspaper className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            Acompanhe as notícias mais recentes sobre o {fenomeno.nome} e seus impactos no Brasil.
          </p>
          <a
            href={LINK_NOTICIAS_EL_NINO}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-lg font-extrabold text-brand-fg"
          >
            Ver notícias no SOS Brasil
            <ExternalLink className="size-5" aria-hidden="true" />
            <span className="sr-only">(abre um site externo em nova aba)</span>
          </a>
          <p className="text-center text-sm text-ink2">Você será levado para um site externo, em uma nova aba.</p>
        </div>
      </div>
    </Modal>
  )
}

export function ElNinoContextCard({ fenomeno }) {
  const [aberto, setAberto] = useState(false)
  const fechar = useCallback(() => setAberto(false), []) // estável: o Modal depende dele

  return (
    <section
      aria-labelledby="fenomeno-titulo"
      className="flex flex-col gap-4 rounded-2xl border-2 border-info bg-info-soft p-4 text-ink sm:flex-row sm:items-center sm:gap-5 sm:p-5"
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-info-ink text-info-soft">
        <Waves className="size-7" aria-hidden="true" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-info-ink">Fenômeno climático ativo</p>
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="fenomeno-titulo" className="text-2xl font-extrabold leading-tight">
            {fenomeno.nome}
          </h2>
          <AlertBadge nivel={niveis[fenomeno.intensidade]} rotulo={fenomeno.intensidadeLabel.toUpperCase()} />
        </div>
        <p className="text-base text-ink2">Mais chuva no Sudeste: maior risco de enchentes e deslizamentos.</p>
      </div>

      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-haspopup="dialog"
        className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-info-ink px-5 text-base font-extrabold text-info-soft"
      >
        Saiba mais
        <ArrowRight className="size-5" aria-hidden="true" />
      </button>

      {aberto && <PopupElNino fenomeno={fenomeno} onFechar={fechar} />}
    </section>
  )
}
