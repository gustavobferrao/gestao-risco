'use client'

import { useState } from 'react'
import { Check, CircleCheck, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AlertBadge } from '@/components/alert-badge'
import { Carregando, ErroApi } from '@/components/api-state'
import { LinksAreas } from '@/components/area-detail-modal'
import { tempoAtras } from '@/lib/format'

export function AlertList({ alertas, carregando = false, erro = null, onTentarNovamente, onVerArea }) {
  const [soAtivos, setSoAtivos] = useState(true)
  const visiveis = alertas.filter((a) => !soAtivos || a.status === 'ativo')

  return (
    <section aria-labelledby="titulo-alertas" className="rounded-2xl border-2 border-line bg-surface p-4 text-ink sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="titulo-alertas" className="text-2xl font-extrabold">
          Alertas recentes
        </h2>
        <button
          type="button"
          onClick={() => setSoAtivos((v) => !v)}
          aria-pressed={soAtivos}
          className={cn(
            'inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 text-sm font-bold',
            soAtivos ? 'border-brand bg-brand text-brand-fg' : 'border-line-strong bg-surface text-ink',
          )}
        >
          {soAtivos && <Check className="size-4" aria-hidden="true" />}
          Só ativos
        </button>
      </div>

      {erro && <ErroApi erro={erro} onTentarNovamente={onTentarNovamente} className="mt-4" />}

      {carregando && <Carregando texto="Carregando alertas…" className="mt-4" />}

      {!carregando && visiveis.length === 0 && (
        <p className="mt-4 rounded-xl bg-bg p-4 text-base font-semibold text-ink2">Nenhum alerta para mostrar.</p>
      )}

      {!carregando && visiveis.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3">
          {visiveis.map((a) => {
            const resolvido = a.status === 'resolvido'
            return (
              <li key={a.id} className="flex flex-col gap-2 rounded-xl border-2 border-line bg-bg p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <AlertBadge nivel={a.nivel_severidade} />
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 text-sm font-bold',
                      resolvido ? 'text-ink2' : 'text-crit-ink',
                    )}
                  >
                    {resolvido ? (
                      <CircleCheck className="size-4" aria-hidden="true" />
                    ) : (
                      <Radio className="size-4" aria-hidden="true" />
                    )}
                    {resolvido ? 'Resolvido' : 'Ativo'}
                  </span>
                </div>
                <p className="text-lg font-bold leading-snug">{a.tipo}</p>
                <p className="text-sm text-ink2">
                  <LinksAreas areas={a.areas} textoReserva={a.local} onVerArea={onVerArea} /> ·{' '}
                  {tempoAtras(a.minutosAtras)} · {a.fonte}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
