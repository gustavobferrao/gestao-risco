import { CheckCircle2, CircleDashed, CloudRain, Home, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { abrigos, areasRisco, pedidoAjuda, previsaoCinco, severidades } from '@/lib/mock-data'

function TabShell({ titulo, descricao, children }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
      <p className="mt-1 text-sm text-slate-500">{descricao}</p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function MapaTab() {
  return (
    <TabShell titulo="Mapa de riscos" descricao="Áreas monitoradas e abrigos com vagas disponíveis. Versão completa em breve.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-wider text-slate-500">ÁREAS DE RISCO</h2>
          <ul className="flex flex-col gap-3">
            {areasRisco.map((area) => {
              const sev = severidades[area.nivel]
              return (
                <li key={area.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="font-bold text-slate-900">{area.nome}</p>
                    <p className="text-sm capitalize text-slate-500">
                      {area.zona} · {area.tipo}
                    </p>
                  </div>
                  <span className={cn('rounded-md px-2 py-1 text-[11px] font-extrabold tracking-wider', sev.badge)}>{sev.label}</span>
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-wider text-slate-500">ABRIGOS</h2>
          <ul className="flex flex-col gap-3">
            {abrigos.map((abrigo) => (
              <li key={abrigo.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Home className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">{abrigo.nome}</p>
                  <p className="text-sm text-slate-500">
                    {abrigo.distanciaKm.toString().replace('.', ',')} km · {abrigo.tempoMin} min
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                  <Users className="size-4" aria-hidden="true" />
                  {abrigo.vagas_disponiveis}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </TabShell>
  )
}

const riscoBaixo = { label: 'BAIXO', badge: 'bg-emerald-50 text-emerald-700' }

export function PrevisaoTab() {
  return (
    <TabShell titulo="Previsão IA" descricao="Projeção de chuva e risco para os próximos 5 dias. Modelo preditivo em desenvolvimento.">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {previsaoCinco.map((dia) => {
          const sev = severidades[dia.risco] ?? riscoBaixo
          return (
            <li key={dia.dia} className="flex flex-col rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">{dia.dia}</p>
              <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
                <CloudRain className="size-5 text-slate-400" aria-hidden="true" />
                {dia.chuvaMm}
                <span className="text-sm font-medium text-slate-500">mm</span>
              </p>
              <span className={cn('mt-3 w-fit rounded-md px-2 py-1 text-[11px] font-extrabold tracking-wider', sev.badge)}>{sev.label}</span>
              <p className="mt-3 text-sm text-slate-500">{dia.resumo}</p>
            </li>
          )
        })}
      </ul>
    </TabShell>
  )
}

export function ChamadoTab() {
  return (
    <TabShell titulo={`Meu chamado ${pedidoAjuda.protocolo}`} descricao={`${pedidoAjuda.tipo} · aberto às ${pedidoAjuda.aberto_em}`}>
      <ol className="flex flex-col gap-4">
        {pedidoAjuda.etapas.map((etapa) => (
          <li key={etapa.titulo} className="flex items-center gap-3">
            {etapa.concluida ? (
              <CheckCircle2 className="size-6 shrink-0 text-emerald-500" aria-hidden="true" />
            ) : (
              <CircleDashed className="size-6 shrink-0 text-slate-300" aria-hidden="true" />
            )}
            <div>
              <p className={cn('font-semibold', etapa.concluida ? 'text-slate-900' : 'text-slate-400')}>{etapa.titulo}</p>
              <p className="text-sm text-slate-500">{etapa.hora}</p>
            </div>
          </li>
        ))}
      </ol>
    </TabShell>
  )
}
