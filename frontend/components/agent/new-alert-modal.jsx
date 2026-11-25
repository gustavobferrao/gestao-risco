'use client'

import { useEffect, useState } from 'react'
import { Check, CircleAlert, Megaphone } from 'lucide-react'
import { AlertBadge } from '@/components/alert-badge'
import { Carregando, ErroApi } from '@/components/api-state'
import { Modal } from '@/components/agent/modal'
import { TextAreaField } from '@/components/agent/fields'
import { Segmented } from '@/components/form-controls'
import { areasRiscoService } from '@/lib/api/services'
import { useApi } from '@/lib/api/use-api'
import { cn } from '@/lib/utils'
import { niveisSeveridade, tiposEvento } from '@/lib/agent-data'

const rotuloNivelArea = (nivel) => (nivel === 'info' ? 'BAIXO' : undefined)

/** Seleção múltipla de áreas: o AlertaRequest da API aceita várias (areasRiscoIds). */
function SeletorAreas({ areasReq, selecionadas, onAlternar, erro }) {
  const areas = [...(areasReq.dados ?? [])].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  let conteudo
  if (areasReq.carregando && !areasReq.dados) {
    conteudo = <Carregando texto="Carregando áreas de risco…" />
  } else if (areasReq.erro) {
    conteudo = <ErroApi erro={areasReq.erro} onTentarNovamente={areasReq.recarregar} />
  } else if (areas.length === 0) {
    conteudo = <p className="rounded-xl bg-bg p-4 text-base font-semibold text-ink2">Nenhuma área de risco cadastrada.</p>
  } else {
    conteudo = (
      <ul className={cn('flex max-h-64 flex-col gap-2 overflow-y-auto rounded-xl border-2 p-2', erro ? 'border-crit' : 'border-line-strong')}>
        {areas.map((a) => {
          const marcada = selecionadas.has(a.id)
          const id = `alerta-area-${a.id}`
          return (
            <li key={a.id}>
              <label
                htmlFor={id}
                className={cn(
                  'flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border-2 px-3 py-2',
                  marcada ? 'border-brand bg-brand-soft' : 'border-transparent hover:bg-brand-soft',
                )}
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={marcada}
                  onChange={() => onAlternar(a.id)}
                  className="size-5 shrink-0 accent-[var(--sz-brand)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold leading-snug">{a.nome}</span>
                  <span className="block text-sm text-ink2">
                    {a.localidade}
                    {a.alertasAtivos > 0 && ` · ${a.alertasAtivos} alerta(s) ativo(s)`}
                  </span>
                </span>
                <AlertBadge nivel={a.nivel} rotulo={rotuloNivelArea(a.nivel)} className="shrink-0" />
              </label>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <fieldset aria-describedby={erro ? 'alerta-areas-erro' : undefined}>
      <legend className="mb-1.5 text-base font-semibold text-ink">
        Áreas de risco afetadas
        {selecionadas.size > 0 && <span className="ml-2 text-sm font-bold text-ink2">({selecionadas.size} selecionada(s))</span>}
      </legend>
      {conteudo}
      {erro && (
        <p id="alerta-areas-erro" role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-crit-ink">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {erro}
        </p>
      )}
    </fieldset>
  )
}

export function NewAlertModal({ inicial, onEmitir, onFechar }) {
  const areasReq = useApi((signal) => areasRiscoService.listar({}, { signal }), [])
  const [selecionadas, setSelecionadas] = useState(() => new Set(inicial?.areasIds ?? []))
  const [tipo, setTipo] = useState(inicial?.tipo ?? 'alagamento')
  const [severidade, setSeveridade] = useState(inicial?.severidade ?? 'alto')
  const [instrucao, setInstrucao] = useState(inicial?.instrucao ?? '')
  const [tentou, setTentou] = useState(false)

  // sugestão da previsão vem com o nome da área: pré-seleciona se existir na API
  const nomeSugerido = inicial?.area
  const areasCarregadas = areasReq.dados
  useEffect(() => {
    if (!nomeSugerido || !areasCarregadas) return
    const encontrada = areasCarregadas.find((a) => a.nome.toLowerCase() === nomeSugerido.toLowerCase())
    if (encontrada) setSelecionadas((atual) => new Set(atual).add(encontrada.id))
  }, [nomeSugerido, areasCarregadas])

  const alternarArea = (id) =>
    setSelecionadas((atual) => {
      const nova = new Set(atual)
      if (nova.has(id)) nova.delete(id)
      else nova.add(id)
      return nova
    })

  const erroAreas = selecionadas.size === 0 ? 'Selecione ao menos uma área de risco.' : undefined
  const erroInstrucao = instrucao.trim().length < 10 ? 'Escreva uma instrução com pelo menos 10 caracteres.' : undefined

  const enviar = (e) => {
    e.preventDefault()
    if (erroAreas || erroInstrucao) {
      setTentou(true)
      return
    }
    const areas = (areasReq.dados ?? []).filter((a) => selecionadas.has(a.id)).map((a) => ({ id: a.id, nome: a.nome }))
    onEmitir({ areas, tipo, severidade, instrucao: instrucao.trim() })
  }

  return (
    <Modal
      titulo="Emitir novo alerta"
      descricao="O alerta será enviado para os moradores das áreas selecionadas."
      onFechar={onFechar}
    >
      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        <SeletorAreas
          areasReq={areasReq}
          selecionadas={selecionadas}
          onAlternar={alternarArea}
          erro={tentou ? erroAreas : undefined}
        />

        <Segmented legend="Tipo de evento" name="tipo-evento" value={tipo} onChange={setTipo} options={tiposEvento} />

        <fieldset>
          <legend className="mb-2 text-base font-semibold text-ink">Nível de severidade</legend>
          <div role="radiogroup" aria-label="Nível de severidade" className="grid grid-cols-2 gap-2">
            {niveisSeveridade.map((nivel) => {
              const ativo = nivel === severidade
              return (
                <button
                  key={nivel}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  onClick={() => setSeveridade(nivel)}
                  className={cn(
                    'flex min-h-14 items-center justify-between gap-2 rounded-xl border-2 px-3 transition-colors',
                    ativo ? 'border-brand bg-brand-soft' : 'border-line-strong bg-surface hover:bg-brand-soft',
                  )}
                >
                  <AlertBadge nivel={nivel} />
                  {ativo && <Check className="size-5 shrink-0 text-ink" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        </fieldset>

        <TextAreaField
          id="alerta-instrucao"
          label="Instrução para os moradores"
          placeholder="Ex.: Deixe a área imediatamente e siga para o abrigo mais próximo."
          hint="A API ainda não armazena a instrução do alerta."
          value={instrucao}
          onChange={(e) => setInstrucao(e.target.value)}
          error={tentou ? erroInstrucao : undefined}
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onFechar}
            className="min-h-12 rounded-xl border-2 border-line-strong px-5 text-base font-bold text-ink hover:bg-brand-soft"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-crit px-5 text-base font-extrabold text-white"
          >
            <Megaphone className="size-5" aria-hidden="true" />
            Emitir alerta
          </button>
        </div>
      </form>
    </Modal>
  )
}
