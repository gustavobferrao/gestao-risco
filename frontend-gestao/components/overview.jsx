import { AlertCircle, Home, LifeBuoy } from 'lucide-react'
import { AlertBanner } from '@/components/alert-banner'
import { AlertList } from '@/components/alert-list'
import { MetricCard } from '@/components/metric-card'
import { RiskMap } from '@/components/risk-map'
import { abrigos, alertas, pedidoAjuda } from '@/lib/mock-data'

const contagem = (nivel) => alertas.filter((a) => a.nivel_severidade === nivel).length

export function Overview({ evacuacaoConfirmada, onConfirmar, onVerRota }) {
  const alertaCritico = alertas.find((a) => a.nivel_severidade === 'critico')
  const abrigo = abrigos.find((a) => a.recomendado)

  return (
    <div className="flex flex-col gap-6">
      <AlertBanner
        alerta={alertaCritico}
        evacuacaoConfirmada={evacuacaoConfirmada}
        onConfirmar={onConfirmar}
        onVerRota={onVerRota}
      />

      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        <MetricCard
          rotulo="ALERTAS NA REGIÃO"
          valor={alertas.length}
          legenda={`${contagem('critico')} crítico · ${contagem('alto')} alto · ${contagem('medio')} médio`}
          icone={AlertCircle}
          corIcone="bg-rose-100 text-rose-600"
        />
        <MetricCard
          rotulo="ABRIGO RECOMENDADO"
          valor={`${abrigo.tempoMin} min`}
          legenda={`${abrigo.nome} · ${abrigo.distanciaKm.toString().replace('.', ',')} km`}
          icone={Home}
          corIcone="bg-emerald-100 text-emerald-600"
        />
        <MetricCard
          rotulo="CHAMADO EM ANDAMENTO"
          valor={pedidoAjuda.protocolo}
          legenda={pedidoAjuda.status}
          icone={LifeBuoy}
          corIcone="bg-violet-100 text-violet-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RiskMap />
        </div>
        <div className="lg:col-span-1">
          <AlertList alertas={alertas} />
        </div>
      </div>
    </div>
  )
}
