'use client'

import { useMemo, useState } from 'react'
import { CalendarX, MapPin } from 'lucide-react'
import { AlertBadge } from '@/components/alert-badge'
import { Carregando, ErroApi } from '@/components/api-state'
import { LinksAreas } from '@/components/area-detail-modal'
import { PillGroup } from '@/components/form-controls'
import { alertaComoHistorico } from '@/lib/api/adapters'
import { areasRiscoService, eventosClimaticosService } from '@/lib/api/services'
import { useApi } from '@/lib/api/use-api'

const TODOS = 'todos'
const SEM_LIMITE = 0

const PERIODOS = [
  { id: 7, label: 'Últimos 7 dias' },
  { id: 30, label: 'Últimos 30 dias' },
  { id: 90, label: 'Últimos 90 dias' },
  { id: SEM_LIMITE, label: 'Tudo' },
]

function formatarData(dataIso) {
  if (!dataIso) return ''
  return new Date(dataIso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// área de risco usa BAIXO (não "informativo")
const rotuloNivel = (item) => (item.origem === 'ocorrencia' && item.nivel === 'info' ? 'BAIXO' : undefined)

function EstadoVazio({ semEventos }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-line-strong bg-surface px-6 py-14 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
        <CalendarX className="size-8" aria-hidden="true" />
      </span>
      <p className="text-xl font-extrabold">{semEventos ? 'Nenhum evento registrado ainda' : 'Nenhum evento para esses filtros'}</p>
      <p className="max-w-sm text-base text-ink2">
        {semEventos
          ? 'Quando alertas forem emitidos ou eventos climáticos forem registrados, eles aparecerão aqui.'
          : 'Tente ampliar o período ou escolher outro tipo de evento.'}
      </p>
    </div>
  )
}

export function HistoryList({ alertas, onVerArea }) {
  const [tipo, setTipo] = useState(TODOS)
  const [periodo, setPeriodo] = useState(90)

  const ocorrenciasReq = useApi((signal) => areasRiscoService.historicoGeral({ signal }), [])
  const catalogoReq = useApi((signal) => eventosClimaticosService.listar({ signal }), [])

  // filtro de tipo: "alertas" + as classificações reais do catálogo de eventos
  const filtrosTipo = useMemo(() => {
    const classificacoes = [...new Set((catalogoReq.dados ?? []).map((e) => e.classificacao))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    )
    return [
      { id: TODOS, label: 'Todos os tipos' },
      { id: 'alerta', label: 'Alertas emitidos' },
      ...classificacoes.map((c) => ({ id: c, label: c })),
    ]
  }, [catalogoReq.dados])

  const eventos = useMemo(
    () => [
      ...(ocorrenciasReq.dados ?? []),
      ...alertas.filter((a) => a.status !== 'cancelado').map(alertaComoHistorico),
    ],
    [ocorrenciasReq.dados, alertas],
  )

  const filtrados = useMemo(
    () =>
      eventos
        .filter((e) => tipo === TODOS || e.categoria === tipo)
        .filter((e) => periodo === SEM_LIMITE || e.diasAtras <= periodo)
        .sort((a, b) => new Date(b.data) - new Date(a.data)),
    [eventos, tipo, periodo],
  )

  const rotuloCategoria = (c) => (c === 'alerta' ? 'Alerta' : c)
  const carregando = ocorrenciasReq.carregando && !ocorrenciasReq.dados

  let conteudo
  if (carregando) {
    conteudo = <Carregando texto="Carregando histórico…" />
  } else if (filtrados.length === 0) {
    conteudo = <EstadoVazio semEventos={eventos.length === 0} />
  } else {
    conteudo = (
      <ol className="flex flex-col gap-3">
        {filtrados.map((e) => (
          <li
            key={e.id}
            className="flex flex-col gap-3 rounded-2xl border-2 border-line bg-surface p-4 text-ink sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-sm font-bold uppercase tracking-wide text-ink2">
                {formatarData(e.data)} · {rotuloCategoria(e.categoria)}
              </p>
              <p className="text-xl font-extrabold">{e.titulo}</p>
              <p className="flex items-center gap-1.5 text-base text-ink2">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                <span>
                  <LinksAreas areas={e.areas} textoReserva={e.area} onVerArea={onVerArea} />
                </span>
              </p>
            </div>
            <AlertBadge nivel={e.nivel} rotulo={rotuloNivel(e)} />
          </li>
        ))}
      </ol>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-extrabold">Histórico</h1>
        <p className="text-base text-ink2">Eventos climáticos e alertas já emitidos, do mais recente ao mais antigo.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border-2 border-line bg-surface p-4">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink2">Tipo de evento</p>
          <PillGroup legend="Filtrar por tipo de evento" value={tipo} onChange={setTipo} options={filtrosTipo} />
        </div>
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink2">Período</p>
          <PillGroup legend="Filtrar por período" value={periodo} onChange={setPeriodo} options={PERIODOS} />
        </div>
      </div>

      {ocorrenciasReq.erro && <ErroApi erro={ocorrenciasReq.erro} onTentarNovamente={ocorrenciasReq.recarregar} />}
      {catalogoReq.erro && !ocorrenciasReq.erro && (
        <ErroApi erro={catalogoReq.erro} onTentarNovamente={catalogoReq.recarregar} />
      )}
      {conteudo}
    </div>
  )
}
