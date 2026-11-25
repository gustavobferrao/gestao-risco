'use client'

import { useState } from 'react'
import { Check, CircleCheck, Clock, LifeBuoy, Siren } from 'lucide-react'
import { cn } from '@/lib/utils'
import { etapasChamado } from '@/lib/mock-data'

function Etapa({ etapa, indice, atual, horario, ultima }) {
  const concluida = indice < atual || (indice === atual && indice === etapasChamado.length - 1)
  const emCurso = indice === atual && !concluida

  return (
    <li className="relative flex gap-4 pb-8 last:pb-0" aria-current={emCurso ? 'step' : undefined}>
      {!ultima && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute left-5 top-11 h-[calc(100%-2.75rem)] w-0.5 -translate-x-1/2',
            indice < atual ? 'bg-safe' : 'border-l-2 border-dashed border-line-strong',
          )}
        />
      )}
      <span
        className={cn(
          'z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2',
          concluida && 'border-safe bg-safe text-white',
          emCurso && 'border-brand bg-brand text-brand-fg ring-4 ring-brand-soft',
          !concluida && !emCurso && 'border-dashed border-line-strong bg-surface text-ink2',
        )}
      >
        {concluida ? (
          <Check className="size-5" aria-hidden="true" />
        ) : emCurso ? (
          <Clock className="size-5" aria-hidden="true" />
        ) : (
          <span className="text-sm font-bold">{indice + 1}</span>
        )}
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-lg font-extrabold">{etapa.titulo}</p>
          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-xs font-extrabold tracking-wider',
              concluida && 'bg-safe-soft text-safe-ink',
              emCurso && 'bg-info-soft text-info-ink',
              !concluida && !emCurso && 'bg-bg text-ink2',
            )}
          >
            {concluida ? 'CONCLUÍDO' : emCurso ? 'AGORA' : 'PENDENTE'}
          </span>
        </div>
        <p className="text-base text-ink2">{etapa.descricao}</p>
        <p className="mt-0.5 text-sm font-semibold text-ink2">{horario ? `às ${horario}` : 'Previsão em breve'}</p>
      </div>
    </li>
  )
}

export function ClaimPage({ chamado, onCancelar, onAbrirSOS }) {
  const [confirmando, setConfirmando] = useState(false)

  if (!chamado) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border-2 border-line bg-surface p-8 text-center text-ink">
        <LifeBuoy className="size-14 text-info" aria-hidden="true" />
        <h1 className="text-2xl font-extrabold">Nenhum chamado em andamento</h1>
        <p className="text-base text-ink2">Se você precisa de ajuda agora, use o botão SOS.</p>
        <button
          type="button"
          onClick={onAbrirSOS}
          className="flex min-h-14 items-center gap-2 rounded-xl bg-[#DC2626] px-6 text-lg font-extrabold text-white"
        >
          <Siren className="size-6" aria-hidden="true" />
          Pedir ajuda
        </button>
      </div>
    )
  }

  const dados = [
    ['Protocolo', chamado.protocolo],
    ['Descrição', chamado.descricao],
    ['Localização', chamado.localizacao],
    ['Aberto às', chamado.aberto_em],
  ]

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-3xl font-extrabold">Meu chamado</h1>
        <p className="text-base text-ink2">Acompanhe o atendimento da Defesa Civil.</p>
      </div>

      <section aria-labelledby="titulo-andamento" className="rounded-2xl border-2 border-line bg-surface p-4 text-ink sm:p-6">
        <h2 id="titulo-andamento" className="mb-5 text-xl font-extrabold">
          Andamento
        </h2>
        <ol>
          {etapasChamado.map((etapa, i) => (
            <Etapa
              key={etapa.id}
              etapa={etapa}
              indice={i}
              atual={chamado.etapaAtual}
              horario={chamado.horarios[i]}
              ultima={i === etapasChamado.length - 1}
            />
          ))}
        </ol>
      </section>

      <section aria-labelledby="titulo-dados" className="rounded-2xl border-2 border-line bg-surface p-4 text-ink sm:p-6">
        <h2 id="titulo-dados" className="mb-3 text-xl font-extrabold">
          Dados do chamado
        </h2>
        <dl className="flex flex-col gap-3">
          {dados.map(([rotulo, valor]) => (
            <div key={rotulo}>
              <dt className="text-sm font-bold uppercase tracking-wide text-ink2">{rotulo}</dt>
              <dd className="text-base font-semibold">{valor}</dd>
            </div>
          ))}
        </dl>
      </section>

      {confirmando ? (
        <div role="alertdialog" aria-label="Confirmar cancelamento" className="flex flex-col gap-3 rounded-2xl border-2 border-mid bg-mid-soft p-4 text-mid-ink">
          <p className="text-base font-bold">Cancelar este chamado? A equipe deixará de ser acionada.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="min-h-12 flex-1 rounded-xl bg-brand px-4 text-base font-bold text-brand-fg"
            >
              Manter chamado
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmando(false)
                onCancelar()
              }}
              className="min-h-12 flex-1 rounded-xl border-2 border-mid-ink bg-surface px-4 text-base font-bold text-ink"
            >
              Sim, cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="min-h-12 self-start rounded-xl px-2 text-base font-bold text-ink2 underline underline-offset-4"
        >
          Cancelar chamado
        </button>
      )}
    </div>
  )
}
