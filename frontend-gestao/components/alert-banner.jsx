import { AlertTriangle, CheckCircle2, Route } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AlertBanner({ alerta, evacuacaoConfirmada, onConfirmar, onVerRota }) {
  return (
    <section
      aria-label="Alerta crítico"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7F1D3A] via-[#B4173F] to-[#E11D48] p-6 text-white shadow-md sm:p-8"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-start gap-4 sm:gap-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 sm:size-14">
            <AlertTriangle className="size-6 sm:size-7" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-extrabold tracking-wider text-rose-700">
                CRÍTICO
              </span>
              <span className="text-[11px] font-semibold tracking-wider text-white/80">
                EMITIDO HÁ {alerta.minutosAtras} MIN · {alerta.fonte.toUpperCase()}
              </span>
            </div>
            <h1 className="mt-3 text-balance text-2xl font-bold leading-tight sm:text-3xl">
              Risco iminente de deslizamento no {alerta.local}.
            </h1>
            <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-white/85 sm:text-base">
              Evacue a área e siga pela rota sinalizada até o abrigo mais próximo. O solo atingiu 98% de saturação.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0 lg:flex-col xl:flex-row">
          <button
            type="button"
            onClick={onVerRota}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            <Route className="size-4" aria-hidden="true" />
            Ver rota de evacuação
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            aria-pressed={evacuacaoConfirmada}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors',
              evacuacaoConfirmada ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-900 hover:bg-rose-50',
            )}
          >
            {evacuacaoConfirmada && <CheckCircle2 className="size-4" aria-hidden="true" />}
            {evacuacaoConfirmada ? 'Evacuação confirmada' : 'Confirmar evacuação'}
          </button>
        </div>
      </div>
    </section>
  )
}
