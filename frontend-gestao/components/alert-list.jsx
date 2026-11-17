import { MapPin, Thermometer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { localidade, severidades } from '@/lib/mock-data'

export function AlertList({ alertas }) {
  return (
    <section aria-labelledby="titulo-alertas" className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 id="titulo-alertas" className="text-lg font-bold text-slate-900">
            Alertas recentes
          </h2>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="size-3.5" aria-hidden="true" />
            {localidade.cidade} · {localidade.uf}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
          <Thermometer className="size-3.5" aria-hidden="true" />
          {localidade.temperatura}°
        </span>
      </header>

      <ul className="mt-5 flex flex-col gap-3">
        {alertas.map((alerta) => {
          const sev = severidades[alerta.nivel_severidade]
          return (
            <li key={alerta.id} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', sev.dot)} aria-hidden="true" />
              <div className="min-w-0">
                <p className={cn('text-[11px] font-extrabold tracking-wider', sev.text)}>{sev.label}</p>
                <p className="mt-0.5 font-bold text-slate-900">{alerta.tipo}</p>
                <p className="text-sm text-slate-500">{alerta.local}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
