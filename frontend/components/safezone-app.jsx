'use client'

import { useCallback, useEffect, useState } from 'react'
import { ClaimPage } from '@/components/claim-page'
import { CriticalAlertTakeover } from '@/components/critical-alert-takeover'
import { AgentApp } from '@/components/agent/agent-app'
import { AIForecastPage } from '@/components/ai-forecast-page'
import { LoginScreen } from '@/components/login-screen'
import { MapPage } from '@/components/map-page'
import { Navbar } from '@/components/navbar'
import { Overview } from '@/components/overview'
import { PreferencesPage } from '@/components/preferences-page'
import { SOSButton } from '@/components/sos-button'
import { SignupFlow } from '@/components/signup/signup-flow'
import { resumoPets } from '@/components/pet-toggle-fields'
import { abrigosService, alertasService } from '@/lib/api/services'
import { useApi } from '@/lib/api/use-api'
import { useAuth } from '@/lib/auth-context'
import { useDetalheArea } from '@/lib/use-detalhe-area'
import { useAlertasDispensados } from '@/lib/use-alertas-dispensados'
import { useLocalizacao } from '@/lib/use-localizacao'
// pedido de ajuda depende do usuário logado: continua mockado até a etapa de autenticação
import { chamadoInicial } from '@/lib/mock-data'

const INTERVALO_ATUALIZACAO_MS = 60 * 1000
const AGUARDANDO = new Promise(() => {})

function horaAgora() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function Dashboard({ onLogout }) {
  const [view, setView] = useState('overview')
  const [chamado, setChamado] = useState(chamadoInicial)
  const [seguro, setSeguro] = useState(false)
  const { verArea, modalArea } = useDetalheArea()
  const { usuario } = useAuth()
  const { foiDispensado, dispensar } = useAlertasDispensados(usuario?.id)

  const localizacao = useLocalizacao()
  const { lat, lng } = localizacao.coords ?? {}

  const alertasReq = useApi((signal) => alertasService.listar({}, { signal }), [])
  const abrigosReq = useApi(
    // enquanto a posição não resolve, a busca fica pendente (carregando)
    (signal) => (lat === undefined ? AGUARDANDO : abrigosService.proximos({ lat, lng, limite: 6 }, { signal })),
    [lat, lng],
  )

  // alertas são críticos: atualiza periodicamente sem recarregar a página
  const recarregarAlertas = alertasReq.recarregar
  useEffect(() => {
    const id = setInterval(recarregarAlertas, INTERVALO_ATUALIZACAO_MS)
    return () => clearInterval(id)
  }, [recarregarAlertas])

  // cancelado = emitido por engano; não aparece para o cidadão
  const alertas = (alertasReq.dados ?? []).filter((a) => a.status !== 'cancelado')
  const abrigos = abrigosReq.dados ?? []

  const alertaCritico = alertas.find((a) => a.status === 'ativo' && a.nivel_severidade === 'critico')
  const abrigo = abrigos.find((a) => a.recomendado)

  // A tela cheia aparece uma vez por alerta crítico: fechar fica salvo no navegador.
  // Handlers estáveis (useCallback) para o takeover não reconfigurar a cada render.
  const idCritico = alertaCritico?.id
  const mostrarTakeover = Boolean(alertaCritico) && !seguro && !foiDispensado(idCritico)
  const fecharTakeover = useCallback(() => {
    if (idCritico !== undefined) dispensar(idCritico)
  }, [idCritico, dispensar])
  const seguroPeloTakeover = useCallback(() => {
    setSeguro(true)
    fecharTakeover()
  }, [fecharTakeover])

  const navegar = useCallback((destino) => {
    setView(destino)
    window.scrollTo({ top: 0 })
  }, [])

  const abrirChamado = useCallback(({ tipo, descricao, localizacao, pets }) => {
    const hora = horaAgora()
    const protocolo = `#${Math.floor(1000 + Math.random() * 9000)}`
    if (tipo === 'seguro') {
      setSeguro(true)
      return protocolo
    }
    const petsTexto = resumoPets(pets)
    setChamado({
      protocolo,
      tipo,
      pets,
      descricao: petsTexto ? `${descricao} · Com ${petsTexto}` : descricao,
      localizacao,
      aberto_em: hora,
      etapaAtual: 0,
      horarios: [hora, null, null],
    })
    return protocolo
  }, [])

  const pedidosAtivos = chamado && chamado.etapaAtual < 2 ? 1 : 0

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar view={view} onNavigate={navegar} onLogout={onLogout} />

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-20 sm:px-6">
        {view === 'overview' && (
          <Overview
            alertas={alertas}
            alertasReq={alertasReq}
            abrigo={abrigo}
            abrigos={abrigos}
            abrigosReq={abrigosReq}
            localizacao={localizacao}
            onVerArea={verArea}
            chamado={chamado}
            seguro={seguro}
            onSeguro={() => setSeguro(true)}
            onDesfazerSeguro={() => setSeguro(false)}
            onVerChamado={() => navegar('claim')}
          />
        )}
        {view === 'map' && (
          <MapPage abrigos={abrigos} abrigosReq={abrigosReq} localizacao={localizacao} onVerArea={verArea} />
        )}
        {view === 'forecast' && <AIForecastPage perfil="morador" />}
        {view === 'claim' && (
          <ClaimPage chamado={chamado} onCancelar={() => setChamado(null)} onAbrirSOS={() => document.querySelector('[data-sos]')?.click()} />
        )}
        {view === 'prefs' && <PreferencesPage />}
      </main>

      {modalArea}

      <SOSButton onSubmit={abrirChamado} onVerChamado={() => navegar('claim')} pedidosAtivos={pedidosAtivos} />

      {mostrarTakeover && (
        <CriticalAlertTakeover
          alerta={alertaCritico}
          abrigo={abrigo}
          onRota={fecharTakeover}
          onSeguro={seguroPeloTakeover}
          onFechar={fecharTakeover}
        />
      )}
    </div>
  )
}

export function SafeZoneApp() {
  const { usuario, pronto, sair } = useAuth()
  // só para quem não está logado: tela de login ou de cadastro
  const [telaPublica, setTelaPublica] = useState('login')

  const irPara = useCallback((tela) => {
    setTelaPublica(tela)
    window.scrollTo({ top: 0 })
  }, [])

  const sairDaConta = useCallback(() => {
    sair()
    irPara('login')
  }, [sair, irPara])

  // ainda lendo a sessão salva: não mostra o login por um instante à toa
  if (!pronto) return <div className="min-h-screen bg-bg" aria-busy="true" />

  // a tela é decidida pelo perfil que veio do banco
  if (usuario?.agente) return <AgentApp onLogout={sairDaConta} />
  if (usuario) return <Dashboard onLogout={sairDaConta} />

  if (telaPublica === 'signup') {
    return (
      <main className="min-h-screen bg-bg px-4 py-10 text-ink sm:px-6">
        <SignupFlow onVoltarLogin={() => irPara('login')} />
      </main>
    )
  }

  return <LoginScreen onCriarConta={() => irPara('signup')} />
}
