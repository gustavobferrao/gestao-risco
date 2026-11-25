import { LoaderCircle, RefreshCw, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Carregando({ texto = 'Carregando…', className }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn('flex items-center gap-2 rounded-xl bg-bg p-4 text-base font-semibold text-ink2', className)}
    >
      <LoaderCircle className="size-5 shrink-0 animate-spin" aria-hidden="true" />
      {texto}
    </p>
  )
}

export function ErroApi({ erro, onTentarNovamente, className }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col gap-3 rounded-xl border-l-4 border-crit bg-crit-soft p-4 text-crit-ink sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="flex items-center gap-2 text-base font-bold">
        <WifiOff className="size-5 shrink-0" aria-hidden="true" />
        {erro?.message ?? 'Não foi possível carregar os dados.'}
      </p>
      {onTentarNovamente && (
        <button
          type="button"
          onClick={onTentarNovamente}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-crit bg-surface px-4 text-base font-bold text-ink"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Tentar novamente
        </button>
      )}
    </div>
  )
}
