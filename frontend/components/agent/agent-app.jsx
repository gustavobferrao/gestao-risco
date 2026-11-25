'use client'

import { useCallback, useEffect, useState } from 'react'
import { AgentAlertList } from '@/components/agent/agent-alert-list'
import { AgentDashboard } from '@/components/agent/agent-dashboard'
import { AgentNavbar } from '@/components/agent/agent-navbar'
import { HistoryList } from '@/components/agent/history-list'
import { NewAlertModal } from '@/components/agent/new-alert-modal'
import { ShelterList } from '@/components/agent/shelter-list'
import { AIForecastPage } from '@/components/ai-forecast-page'
import { alertasService } from '@/lib/api/services'
import { useApi } from '@/lib/api/use-api'
import { useAuth } from '@/lib/auth-context'
import { TeamPage } from '@/components/agent/team-page'
import { useDetalheArea } from '@/lib/use-detalhe-area'
// pedidos e abrigos do agente: ainda mock (pedidos exigem autenticação; abrigos não têm endpoint de listagem)
import { abrigosAgenteIniciais, pedidosIniciais, statusPedido, tiposEvento } from '@/lib/agent-data'

const INTERVALO_ATUALIZACAO_MS = 60 * 1000

export function AgentApp({ onLogout }) {
  const { usuario } = useAuth()
  const { verArea, modalArea } = useDetalheArea()
  const [view, setView] = useState('painel')
  const [pedidos, setPedidos] = useState(pedidosIniciais)
  const [abrigos, setAbrigos] = useState(abrigosAgenteIniciais)
  const [modalAlerta, setModalAlerta] = useState(null)
  const [aviso, setAviso] = useState('')

  const alertasReq = useApi((signal) => alertasService.listar({}, { signal }), [])
  const recarregarAlertas = alertasReq.recarregar
  useEffect(() => {
    const id = setInterval(recarregarAlertas, INTERVALO_ATUALIZACAO_MS)
    return () => clearInterval(id)
  }, [recarregarAlertas])

  // Emitir/encerrar exigem X-Usuario-Id (etapa de autenticação). Até lá, essas ações
  // ficam só na tela, por cima dos dados reais, marcadas como "simulado".
  const [alertasSimulados, setAlertasSimulados] = useState([])
  const [encerradosSimulados, setEncerradosSimulados] = useState(() => new Set())

  const alertas = [
    ...alertasSimulados,
    ...(alertasReq.dados ?? []).map((a) => (encerradosSimulados.has(a.id) ? { ...a, status: 'resolvido', simulado: true } : a)),
  ]

  const navegar = useCallback((destino) => {
    setView(destino)
    window.scrollTo({ top: 0 })
  }, [])

  const avancarPedido = (protocolo) => {
    setPedidos((lista) =>
      lista.map((p) => {
        if (p.protocolo !== protocolo) return p
        const indice = statusPedido.findIndex((s) => s.id === p.status)
        const proximo = statusPedido[Math.min(indice + 1, statusPedido.length - 1)]
        return { ...p, status: proximo.id }
      }),
    )
  }

  // areas: [{ id, nome }] — os ids já estão prontos para o areasRiscoIds do AlertaRequest
  const emitirAlerta = ({ areas, tipo, severidade, instrucao }) => {
    const rotuloTipo = tiposEvento.find((t) => t.id === tipo)?.label ?? 'Outro'
    const id = `simulado-${Date.now()}`
    const local = areas.map((a) => a.nome).join(', ')
    setAlertasSimulados((lista) => [
      {
        id,
        tipo: rotuloTipo,
        local,
        areas,
        nivel_severidade: severidade,
        status: 'ativo',
        minutosAtras: 0,
        dataEmissao: new Date().toISOString(),
        fonte: usuario.orgaoNome,
        instrucao,
        simulado: true,
      },
      ...lista,
    ])
    setModalAlerta(null)
    setAviso(`Alerta de ${rotuloTipo.toLowerCase()} para ${local} criado só nesta tela (ainda não é salvo na API).`)
    navegar('alertas')
  }

  const encerrarAlerta = (id) => {
    if (alertasSimulados.some((a) => a.id === id)) {
      setAlertasSimulados((lista) => lista.map((a) => (a.id === id ? { ...a, status: 'resolvido' } : a)))
      return
    }
    setEncerradosSimulados((atual) => new Set(atual).add(id))
  }

  const salvarAbrigo = (abrigo) => {
    setAbrigos((lista) =>
      lista.some((a) => a.id === abrigo.id) ? lista.map((a) => (a.id === abrigo.id ? abrigo : a)) : [abrigo, ...lista],
    )
  }

  const abrirModal = (inicial = null) => setModalAlerta({ inicial })

  return (
    <div className="min-h-screen bg-bg text-ink">
      <AgentNavbar view={view} onNavigate={navegar} onLogout={onLogout} />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6">
        <p role="status" aria-live="polite" className={aviso ? 'mb-4 rounded-xl border-2 border-safe bg-safe-soft px-4 py-3 text-base font-bold text-safe-ink' : 'sr-only'}>
          {aviso}
        </p>

        {view === 'painel' && (
          <AgentDashboard
            alertas={alertas}
            carregandoAlertas={alertasReq.carregando && !alertasReq.dados}
            pedidos={pedidos}
            abrigos={abrigos}
            onAvancarPedido={avancarPedido}
            onNovoAlerta={() => abrirModal()}
            onVerAlertas={() => navegar('alertas')}
            onVerAbrigos={() => navegar('abrigos')}
          />
        )}
        {view === 'alertas' && (
          <AgentAlertList
            alertas={alertas}
            carregando={alertasReq.carregando && !alertasReq.dados}
            erro={alertasReq.erro}
            onTentarNovamente={alertasReq.recarregar}
            onNovoAlerta={() => abrirModal()}
            onEncerrar={encerrarAlerta}
            onVerArea={verArea}
          />
        )}
        {view === 'abrigos' && <ShelterList abrigos={abrigos} onSalvar={salvarAbrigo} />}
        {view === 'historico' && <HistoryList alertas={alertas} onVerArea={verArea} />}
        {view === 'previsao' && <AIForecastPage perfil="agente" onEmitirPreventivo={abrirModal} />}
        {view === 'equipe' && <TeamPage />}
      </main>

      {modalArea}

      {modalAlerta && (
        <NewAlertModal inicial={modalAlerta.inicial} onEmitir={emitirAlerta} onFechar={() => setModalAlerta(null)} />
      )}
    </div>
  )
}
