import { cn } from '@/lib/utils'

export function MetricCard({ rotulo, valor, legenda, icone: Icone, corIcone }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xs font-semibold tracking-[0.12em] text-slate-500">{rotulo}</h2>
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', corIcone)}>
          <Icone className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{valor}</p>
      <p className="mt-1 text-sm text-slate-500">{legenda}</p>
    </article>
  )
}
