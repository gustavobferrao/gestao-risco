import { Megaphone, MapPin, Sparkles } from 'lucide-react'
import { ElNinoContextCard } from '@/components/el-nino-context-card'
import { ForecastDayCard } from '@/components/forecast-day-card'
import { fenomenoClimatico } from '@/lib/mock-data'
import { alertaPreventivoSugerido, analiseIA, orgao, previsaoIA } from '@/lib/agent-data'

export function AIForecastPage({ perfil = 'morador', onEmitirPreventivo }) {
  const agente = perfil === 'agente'
  const localizacao = agente ? `Região de atuação: ${orgao} — Grande São Paulo` : 'Morro da Esperança — São Paulo, SP'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold">Previsão para os próximos 5 dias</h1>
        <p className="mt-1 flex items-center gap-2 text-base text-ink2">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {localizacao}
        </p>
      </div>

      <ElNinoContextCard fenomeno={fenomenoClimatico} />

      <ol aria-label="Previsão diária" className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-5 lg:overflow-visible">
        {previsaoIA.map((p) => (
          <ForecastDayCard key={p.dia} previsao={p} />
        ))}
      </ol>

      <section aria-labelledby="analise-titulo" className="flex flex-col gap-4 rounded-2xl border-2 border-line bg-surface p-5 text-ink sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand text-brand-fg">
            <Sparkles className="size-6" aria-hidden="true" />
          </span>
          <h2 id="analise-titulo" className="text-2xl font-extrabold">
            Análise da IA
          </h2>
        </div>
        <p className="text-lg leading-relaxed">{agente ? analiseIA.agente : analiseIA.morador}</p>
        <p className="text-sm text-ink2">Previsão gerada automaticamente. Em caso de emergência, siga sempre as orientações da Defesa Civil.</p>

        {agente && (
          <button
            type="button"
            onClick={() => onEmitirPreventivo(alertaPreventivoSugerido)}
            className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-crit px-6 text-base font-extrabold text-white sm:self-start"
          >
            <Megaphone className="size-5" aria-hidden="true" />
            Emitir alerta preventivo com base nesta previsão
          </button>
        )}
      </section>
    </div>
  )
}
