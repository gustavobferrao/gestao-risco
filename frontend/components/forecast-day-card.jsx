import { Cloud, CloudLightning, CloudRain, CloudRainWind, CloudSun, Umbrella } from 'lucide-react'
import { AlertBadge } from '@/components/alert-badge'
import { severidades } from '@/lib/severity'
import { cn } from '@/lib/utils'

const icones = {
  tempestade: CloudLightning,
  'chuva-forte': CloudRainWind,
  chuva: CloudRain,
  nublado: Cloud,
  sol: CloudSun,
}

export function ForecastDayCard({ previsao }) {
  const { dia, data, condicao, condicaoLabel, risco, rotulo, prob, elNino } = previsao
  const Icon = icones[condicao]
  const sev = severidades[risco]

  return (
    <li
      className={cn(
        'flex min-w-44 shrink-0 snap-start flex-col gap-3 rounded-2xl border-2 bg-surface p-4 text-ink lg:min-w-0',
        dia === 'Hoje' ? 'border-brand' : 'border-line',
      )}
    >
      <div>
        <p className="text-xl font-extrabold">{dia}</p>
        <p className="text-sm font-semibold text-ink2">{data}</p>
      </div>
      <div className="flex items-center gap-2">
        <Icon className="size-10 text-info" aria-hidden="true" />
        <p className="text-base font-semibold leading-tight">{condicaoLabel}</p>
      </div>
      <AlertBadge nivel={risco} rotulo={rotulo} className="self-start" />
      {elNino && (
        <span className="inline-flex items-center gap-1 self-start rounded-full bg-info-soft px-2 py-0.5 text-xs font-bold text-info-ink">
          <Umbrella className="size-3.5" aria-hidden="true" />
          Influência de El Niño
        </span>
      )}
      <div>
        <p className="text-3xl font-extrabold">
          {prob}%
          <span className="ml-1 text-sm font-bold text-ink2">de probabilidade</span>
        </p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={prob}
          aria-label={`${prob}% de probabilidade de risco`}
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-line"
        >
          <div className={cn('h-full rounded-full', sev.barra)} style={{ width: `${prob}%` }} />
        </div>
      </div>
    </li>
  )
}
