import { ArrowRight, CircleCheck, Clock, HandHelping, MapPin, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { statusPedido } from '@/lib/agent-data'

const estilosStatus = {
  recebido: { Icon: HandHelping, badge: 'bg-help-soft text-help-ink border-help' },
  atendimento: { Icon: Truck, badge: 'bg-info-soft text-info-ink border-info' },
  concluido: { Icon: CircleCheck, badge: 'bg-safe-soft text-safe-ink border-safe' },
}

const ordemStatus = { recebido: 0, atendimento: 1, concluido: 2 }

function StatusBadge({ status }) {
  const { Icon, badge } = estilosStatus[status]
  const label = statusPedido.find((s) => s.id === status).label
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center gap-1.5 rounded-md border-l-4 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider',
        badge,
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {label}
    </span>
  )
}

export function HelpRequestQueue({ pedidos, onAvancar }) {
  const ordenados = [...pedidos].sort((a, b) => {
    if (ordemStatus[a.status] !== ordemStatus[b.status]) return ordemStatus[a.status] - ordemStatus[b.status]
    return a.minutosAtras - b.minutosAtras
  })

  return (
    <section aria-labelledby="fila-titulo" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="fila-titulo" className="text-2xl font-extrabold">
          Fila de pedidos de ajuda
        </h2>
        <p className="text-sm font-semibold text-ink2">{pedidos.length} pedidos</p>
      </div>

      <ul className="flex flex-col gap-3">
        {ordenados.map((p) => {
          const proxima = statusPedido.find((s) => s.id === p.status).proxima
          const novo = p.status === 'recebido'
          return (
            <li
              key={p.protocolo}
              className={cn(
                'flex flex-col gap-4 rounded-2xl border-2 p-4 text-ink sm:flex-row sm:items-center sm:justify-between sm:p-5',
                novo ? 'border-help bg-help-soft' : 'border-line bg-surface',
              )}
            >
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xl font-extrabold">{p.protocolo}</p>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-lg font-bold">{p.solicitante}</p>
                <p className="flex items-start gap-1.5 text-base text-ink2">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {p.localizacao}
                </p>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink2">
                  <Clock className="size-4 shrink-0" aria-hidden="true" />
                  Aberto às {p.horario}
                </p>
              </div>

              {proxima ? (
                <button
                  type="button"
                  onClick={() => onAvancar(p.protocolo)}
                  aria-label={`${proxima} — pedido ${p.protocolo}`}
                  className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-base font-extrabold text-brand-fg"
                >
                  Avançar status
                  <ArrowRight className="size-5" aria-hidden="true" />
                </button>
              ) : (
                <p className="flex min-h-12 shrink-0 items-center gap-2 text-base font-bold text-safe-ink">
                  <CircleCheck className="size-5" aria-hidden="true" />
                  Atendimento finalizado
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
