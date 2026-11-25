import { CircleCheck, MapPin, Radio, Route, ShieldCheck } from 'lucide-react'
import { AlertBadge } from '@/components/alert-badge'
import { MapsRedirectButton } from '@/components/maps-redirect-button'
import { tempoAtras } from '@/lib/format'

export function CriticalAlertCard({ alerta, abrigo, seguro, onSeguro, onDesfazer }) {
  return (
    <section aria-labelledby="alerta-critico" className="overflow-hidden rounded-2xl border-2 border-crit bg-crit-soft text-ink">
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <AlertBadge nivel="critico" />
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-crit-ink">
            <Radio className="size-4" aria-hidden="true" />
            ATIVO · {tempoAtras(alerta.minutosAtras)}
          </span>
        </div>

        <div>
          <h2 id="alerta-critico" className="text-2xl font-extrabold leading-tight sm:text-3xl">
            {alerta.tipo}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-base font-semibold text-crit-ink">
            <MapPin className="size-5" aria-hidden="true" />
            {alerta.local} · {alerta.fonte}
          </p>
        </div>

        <p className="text-lg font-bold">{alerta.instrucao}</p>

        {abrigo && (
          <p className="text-base font-semibold text-crit-ink">
            Abrigo recomendado: {abrigo.nome} · {abrigo.distanciaKm.toString().replace('.', ',')} km · {abrigo.tempoMin} min a pé
          </p>
        )}

        {seguro ? (
          <div className="flex flex-col gap-3 rounded-xl border-l-4 border-safe bg-safe-soft p-3 text-safe-ink sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-base font-bold">
              <CircleCheck className="size-6 shrink-0" aria-hidden="true" />
              Você avisou que está seguro.
            </p>
            <button
              type="button"
              onClick={onDesfazer}
              className="min-h-11 rounded-lg border-2 border-safe px-4 text-base font-bold"
            >
              Desfazer
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            {abrigo && (
              <MapsRedirectButton
                variante="primario"
                Icon={Route}
                coords={abrigo.coords}
                endereco={abrigo.endereco}
                destinoNome={abrigo.nome}
                className="flex-1"
              >
                Ver rota de evacuação
              </MapsRedirectButton>
            )}
            <button
              type="button"
              onClick={onSeguro}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-brand bg-surface px-5 text-lg font-extrabold text-ink"
            >
              <ShieldCheck className="size-5" aria-hidden="true" />
              Estou seguro
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
