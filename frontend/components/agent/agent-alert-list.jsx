import { CircleCheck, MapPin, Plus } from 'lucide-react'
import { AlertBadge } from '@/components/alert-badge'
import { Carregando, ErroApi } from '@/components/api-state'
import { LinksAreas } from '@/components/area-detail-modal'
import { cn } from '@/lib/utils'
import { tempoAtras } from '@/lib/format'

const ROTULO_STATUS = { ativo: 'Ativo', resolvido: 'Encerrado', cancelado: 'Cancelado' }

function ItemAlerta({ alerta: a, onEncerrar, onVerArea }) {
  const ativo = a.status === 'ativo'
  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-2xl border-2 border-line bg-surface p-4 text-ink sm:flex-row sm:items-center sm:justify-between sm:p-5',
        !ativo && 'opacity-80',
      )}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <AlertBadge nivel={a.nivel_severidade} />
          <span className="text-sm font-bold uppercase tracking-wide text-ink2">{ROTULO_STATUS[a.status] ?? a.status}</span>
          {a.simulado && (
            <span
              className="rounded-md border-2 border-dashed border-line-strong px-2 text-xs font-extrabold tracking-wide text-ink2"
              title="Ação feita só nesta tela. Será salva na API quando a autenticação estiver integrada."
            >
              NÃO SALVO
            </span>
          )}
        </div>
        <p className="text-xl font-extrabold">{a.tipo}</p>
        <p className="flex items-center gap-1.5 text-base text-ink2">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span>
            <LinksAreas areas={a.areas} textoReserva={a.local} onVerArea={onVerArea} /> ·{' '}
            {a.minutosAtras < 1 ? 'agora mesmo' : tempoAtras(a.minutosAtras)}
          </span>
          {a.fonte && ` · ${a.fonte}`}
        </p>
        <p className="text-base">{a.instrucao}</p>
      </div>
      {ativo && (
        <button
          type="button"
          onClick={() => onEncerrar(a.id)}
          className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-line-strong px-4 text-base font-bold hover:bg-brand-soft"
        >
          <CircleCheck className="size-5" aria-hidden="true" />
          Encerrar alerta
        </button>
      )}
    </li>
  )
}

export function AgentAlertList({
  alertas,
  carregando = false,
  erro = null,
  onTentarNovamente,
  onNovoAlerta,
  onEncerrar,
  onVerArea,
}) {
  const ordenados = [...alertas].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === 'ativo') return -1
      if (b.status === 'ativo') return 1
    }
    return a.minutosAtras - b.minutosAtras
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Alertas</h1>
          <p className="text-base text-ink2">Alertas emitidos para a população.</p>
        </div>
        <button
          type="button"
          onClick={onNovoAlerta}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-crit px-5 text-base font-extrabold text-white"
        >
          <Plus className="size-5" aria-hidden="true" />
          Emitir novo alerta
        </button>
      </div>

      {erro && <ErroApi erro={erro} onTentarNovamente={onTentarNovamente} />}
      {carregando && <Carregando texto="Carregando alertas…" />}
      {!carregando && ordenados.length === 0 && !erro && (
        <p className="rounded-xl bg-surface p-4 text-base font-semibold text-ink2">Nenhum alerta emitido ainda.</p>
      )}

      {ordenados.length > 0 && (
        <ul className="flex flex-col gap-3">
          {ordenados.map((a) => (
            <ItemAlerta key={a.id} alerta={a} onEncerrar={onEncerrar} onVerArea={onVerArea} />
          ))}
        </ul>
      )}
    </div>
  )
}
