'use client'

import { History, MapPin, TriangleAlert, Users } from 'lucide-react'
import { AlertBadge } from '@/components/alert-badge'
import { Carregando, ErroApi } from '@/components/api-state'
import { Modal } from '@/components/agent/modal'
import { areasRiscoService } from '@/lib/api/services'
import { useApi } from '@/lib/api/use-api'
import { useAuth } from '@/lib/auth-context'
import { tempoAtras } from '@/lib/format'

const numero = (n) => (n === null || n === undefined ? '—' : Number(n).toLocaleString('pt-BR'))

function formatarData(dataIso) {
  return new Date(dataIso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Secao({ titulo, Icon, children }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 text-lg font-extrabold">
        <Icon className="size-5 shrink-0" aria-hidden="true" />
        {titulo}
      </h3>
      {children}
    </section>
  )
}

const Vazio = ({ children }) => <p className="rounded-xl bg-bg p-3 text-base text-ink2">{children}</p>

function Conteudo({ area, mostrarHistorico }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <AlertBadge nivel={area.nivel} rotulo={area.nivel === 'info' ? 'BAIXO' : undefined} />
        <span className="text-sm font-bold uppercase tracking-wide text-ink2">
          Zona {area.zona === 'RURAL' ? 'rural' : 'urbana'}
        </span>
      </div>

      {area.descricao && <p className="text-base">{area.descricao}</p>}

      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-bg p-3">
          <dt className="text-xs font-bold uppercase tracking-wide text-ink2">Localidade</dt>
          <dd className="text-base font-bold">{area.localidade?.nome ?? '—'}</dd>
        </div>
        <div className="rounded-xl bg-bg p-3">
          <dt className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-ink2">
            <Users className="size-3.5" aria-hidden="true" />
            População afetada
          </dt>
          <dd className="text-base font-bold">{numero(area.populacaoAfetada)} pessoas</dd>
        </div>
      </dl>

      <Secao titulo={`Alertas ativos (${area.alertasAtivos.length})`} Icon={TriangleAlert}>
        {area.alertasAtivos.length === 0 ? (
          <Vazio>Nenhum alerta ativo nesta área agora.</Vazio>
        ) : (
          <ul className="flex flex-col gap-2">
            {area.alertasAtivos.map((a) => (
              <li key={a.id} className="flex flex-col gap-1 rounded-xl border-2 border-line bg-bg p-3">
                <AlertBadge nivel={a.nivel_severidade} />
                <p className="text-base font-bold">{a.tipo}</p>
                <p className="text-sm text-ink2">
                  {tempoAtras(a.minutosAtras)} · {a.fonte}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Secao>

      <Secao titulo="Endereços na área" Icon={MapPin}>
        {area.enderecos.length === 0 ? (
          <Vazio>Nenhum endereço cadastrado.</Vazio>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {area.enderecos.map((e) => (
              <li key={e.id} className="rounded-xl bg-bg px-3 py-2 text-base">
                {e.logradouro}
                {e.numero && `, ${e.numero}`} — {e.bairro}
                {e.cep && <span className="text-ink2"> · CEP {e.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')}</span>}
              </li>
            ))}
          </ul>
        )}
      </Secao>

      {mostrarHistorico && (
        <Secao titulo={`Histórico de ocorrências (${area.historico.length})`} Icon={History}>
          {area.historico.length === 0 ? (
            <Vazio>Nenhuma ocorrência registrada nesta área.</Vazio>
          ) : (
            <ol className="flex flex-col gap-2 border-l-4 border-line pl-3">
              {area.historico.map((h) => (
                <li key={h.id} className="flex flex-col">
                  <span className="text-sm font-bold uppercase tracking-wide text-ink2">
                    {formatarData(h.data)} · {h.classificacao}
                  </span>
                  <span className="text-base font-bold">{h.evento}</span>
                </li>
              ))}
            </ol>
          )}
        </Secao>
      )}
    </div>
  )
}

/**
 * Detalhe de uma área de risco (GET /api/areas-risco/{id}).
 * O histórico de ocorrências só aparece para agentes.
 * `onFechar` deve ser estável (useCallback): o Modal reage a mudanças nele.
 */
export function AreaDetailModal({ areaId, nomeInicial, onFechar }) {
  const { usuario } = useAuth()
  const req = useApi((signal) => areasRiscoService.detalhar(areaId, { signal }), [areaId])

  let corpo
  if (req.carregando && !req.dados) corpo = <Carregando texto="Carregando detalhes da área…" />
  else if (req.erro) corpo = <ErroApi erro={req.erro} onTentarNovamente={req.recarregar} />
  else corpo = <Conteudo area={req.dados} mostrarHistorico={Boolean(usuario?.agente)} />

  return (
    <Modal titulo={req.dados?.nome ?? nomeInicial ?? 'Área de risco'} descricao="Detalhes da área de risco" onFechar={onFechar}>
      {corpo}
    </Modal>
  )
}

/** Várias áreas como links separados por vírgula; sem áreas, mostra o texto de reserva. */
export function LinksAreas({ areas, textoReserva, onVerArea }) {
  if (!areas?.length) return <>{textoReserva}</>
  return areas.map((area, i) => (
    <span key={area.id}>
      {i > 0 && ', '}
      <LinkArea area={area} onVerArea={onVerArea} />
    </span>
  ))
}

/** Nome de área clicável que abre o detalhe. */
export function LinkArea({ area, onVerArea, className }) {
  if (!onVerArea) return <span className={className}>{area.nome}</span>
  return (
    <button
      type="button"
      onClick={() => onVerArea(area)}
      className={`font-bold text-ink underline underline-offset-4 hover:text-brand ${className ?? ''}`}
    >
      {area.nome}
    </button>
  )
}
