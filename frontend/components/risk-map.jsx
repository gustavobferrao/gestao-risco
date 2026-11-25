'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { CircleCheck, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AlertBadge } from '@/components/alert-badge'
import { Carregando, ErroApi } from '@/components/api-state'
import { LinkArea } from '@/components/area-detail-modal'
import { PillGroup } from '@/components/form-controls'
import { areasRiscoService } from '@/lib/api/services'
import { useApi } from '@/lib/api/use-api'

// Leaflet usa `window`: carrega só no navegador.
const RiskMapLeaflet = dynamic(() => import('@/components/risk-map-leaflet'), {
  ssr: false,
  loading: () => <Carregando texto="Carregando mapa…" className="size-full rounded-none" />,
})

// A API não classifica a área por tipo de evento: o filtro é por nível de risco.
const FILTROS_NIVEL = [
  { id: 'todos', label: 'Todos' },
  { id: 'alto', label: 'Alto' },
  { id: 'medio', label: 'Médio' },
  { id: 'info', label: 'Baixo' },
  { id: 'abrigos', label: 'Só abrigos' },
]

const FILTROS_STATUS = [
  { id: 'todos', label: 'Todos' },
  { id: 'ativo', label: 'Com alerta ativo' },
  { id: 'resolvido', label: 'Sem alerta' },
]

const LEGENDA = [
  { rotulo: 'Risco alto', cor: 'var(--sz-high)', tipo: 'zona' },
  { rotulo: 'Risco médio', cor: 'var(--sz-mid)', tipo: 'zona' },
  { rotulo: 'Risco baixo', cor: 'var(--sz-info)', tipo: 'zona' },
  { rotulo: 'Sem alerta ativo', cor: 'var(--sz-ink2)', tipo: 'zona', tracejado: true },
  { rotulo: 'Abrigo', cor: 'var(--sz-safe)', tipo: 'ponto' },
  { rotulo: 'Você', cor: 'var(--sz-info)', tipo: 'ponto' },
]

const rotuloNivel = (nivel) => (nivel === 'info' ? 'BAIXO' : undefined)

function Legenda() {
  return (
    <ul aria-label="Legenda do mapa" className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm font-semibold text-ink2">
      {LEGENDA.map((item) => (
        <li key={item.rotulo} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn('inline-block shrink-0 rounded-full', item.tipo === 'zona' ? 'size-4 border-[3px]' : 'size-3.5 ring-2 ring-surface')}
            style={
              item.tipo === 'zona'
                ? {
                    borderColor: item.cor,
                    borderStyle: item.tracejado ? 'dashed' : 'solid',
                    backgroundColor: `color-mix(in srgb, ${item.cor} 35%, transparent)`,
                  }
                : { backgroundColor: item.cor }
            }
          />
          {item.rotulo}
        </li>
      ))}
    </ul>
  )
}

function StatusZona({ resolvido }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm font-bold', resolvido ? 'text-ink2' : 'text-crit-ink')}>
      {resolvido ? <CircleCheck className="size-4" aria-hidden="true" /> : <Radio className="size-4" aria-hidden="true" />}
      {resolvido ? 'Sem alerta' : 'Alerta ativo'}
    </span>
  )
}

function ListaZonas({ zonas, carregando, onVerArea }) {
  if (carregando) return <Carregando texto="Carregando áreas de risco…" className="mt-2" />
  if (zonas.length === 0) {
    return (
      <p className="mt-2 rounded-xl bg-bg p-4 text-base font-semibold text-ink2">Nenhuma zona de risco com esses filtros.</p>
    )
  }
  return (
    <ul className="mt-2 flex flex-col gap-2">
      {zonas.map((z) => (
        <li
          key={z.id}
          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border-2 border-line bg-bg p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <AlertBadge nivel={z.nivel} rotulo={rotuloNivel(z.nivel)} />
            <LinkArea area={z} onVerArea={onVerArea} className="text-base" />
            <span className="text-sm text-ink2">
              {z.localidade} · {z.zona === 'RURAL' ? 'Rural' : 'Urbana'}
            </span>
          </div>
          <StatusZona resolvido={z.status === 'resolvido'} />
        </li>
      ))}
    </ul>
  )
}

export function RiskMap({ titulo = 'Mapa de riscos', nivelTitulo = 2, abrigos = [], posicao = null, onVerArea }) {
  const [nivel, setNivel] = useState('todos')
  const [status, setStatus] = useState('todos')

  const areasReq = useApi((signal) => areasRiscoService.listar({}, { signal }), [])
  const areas = areasReq.dados ?? []

  const zonas = areas.filter(
    (z) => nivel !== 'abrigos' && (nivel === 'todos' || z.nivel === nivel) && (status === 'todos' || z.status === status),
  )
  const mostrarAbrigos = nivel === 'todos' || nivel === 'abrigos'
  const Titulo = `h${nivelTitulo}`

  return (
    <section aria-labelledby="titulo-mapa" className="rounded-2xl border-2 border-line bg-surface p-4 text-ink sm:p-6">
      <Titulo id="titulo-mapa" className="text-2xl font-extrabold">
        {titulo}
      </Titulo>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <p className="mb-1.5 text-sm font-bold text-ink2">Nível de risco</p>
          <PillGroup legend="Filtrar por nível de risco" value={nivel} onChange={setNivel} options={FILTROS_NIVEL} />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-bold text-ink2">Status</p>
          <PillGroup legend="Filtrar por status" value={status} onChange={setStatus} options={FILTROS_STATUS} />
        </div>
      </div>

      {areasReq.erro && <ErroApi erro={areasReq.erro} onTentarNovamente={areasReq.recarregar} className="mt-4" />}

      {/* isolate: as camadas do Leaflet (z-index 400+) ficam contidas e não passam por cima da navbar */}
      <section
        aria-label={`Mapa com ${zonas.length} zona(s) de risco. A lista abaixo descreve cada zona.`}
        className="relative isolate z-0 mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-line sm:aspect-[8/5]"
      >
        <RiskMapLeaflet
          zonas={zonas}
          abrigos={mostrarAbrigos ? abrigos : []}
          posicao={posicao}
          pontosEnquadramento={[...areas, ...abrigos].map((x) => x.coords).filter(Boolean)}
          onVerArea={onVerArea}
        />
      </section>
      <Legenda />

      <h3 className="mt-5 text-lg font-extrabold">Zonas exibidas ({zonas.length})</h3>
      <ListaZonas zonas={zonas} carregando={areasReq.carregando && !areasReq.dados} onVerArea={onVerArea} />
    </section>
  )
}
