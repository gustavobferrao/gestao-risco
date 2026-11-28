'use client'

import { useState } from 'react'
import { CircleAlert, CircleCheck, MapPin, Pencil, Trash2 } from 'lucide-react'
import { Carregando, ErroApi } from '@/components/api-state'
import { CamposEndereco, enderecoParaForm, resumoEndereco, validarEndereco } from '@/components/endereco/campos-endereco'
import { enderecoService } from '@/lib/api/services'

/**
 * Seção "Meu endereço" em Preferências: ver, trocar e apagar (direitos do titular na LGPD).
 * `enderecoReq` é a mesma busca que o painel usa para a posição: recarregar aqui
 * atualiza o mapa e os abrigos.
 */
export function MeuEndereco({ enderecoReq }) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState(null)
  const [tentou, setTentou] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [confirmarRemocao, setConfirmarRemocao] = useState(false)
  const [aviso, setAviso] = useState('')

  const endereco = enderecoReq.dados

  const abrirEdicao = () => {
    setForm(enderecoParaForm(endereco))
    setTentou(false)
    setErro('')
    setAviso('')
    setEditando(true)
  }

  const salvar = async () => {
    const erros = validarEndereco(form)
    if (Object.keys(erros).length > 0) {
      setTentou(true)
      return
    }
    setSalvando(true)
    setErro('')
    try {
      await enderecoService.salvar(form)
      enderecoReq.recarregar()
      setEditando(false)
      setAviso('Endereço salvo.')
    } catch (e) {
      setErro(e.message ?? 'Não foi possível salvar o endereço.')
    } finally {
      setSalvando(false)
    }
  }

  const remover = async () => {
    setSalvando(true)
    setErro('')
    try {
      await enderecoService.remover()
      enderecoReq.recarregar()
      setConfirmarRemocao(false)
      setAviso('Endereço apagado. A autorização de uso também foi revogada.')
    } catch (e) {
      setErro(e.message ?? 'Não foi possível apagar o endereço.')
    } finally {
      setSalvando(false)
    }
  }

  if (enderecoReq.carregando && !endereco && !editando) return <Carregando texto="Carregando seu endereço…" />
  if (enderecoReq.erro && !editando) return <ErroApi erro={enderecoReq.erro} onTentarNovamente={enderecoReq.recarregar} />

  if (editando)
    return (
      <div className="flex flex-col gap-4">
        <CamposEndereco
          id="pref-endereco"
          valor={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          erros={tentou ? validarEndereco(form) : {}}
        />
        {erro && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border-l-4 border-crit bg-crit-soft p-3 text-base font-bold text-crit-ink">
            <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            {erro}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setEditando(false)}
            disabled={salvando}
            className="min-h-12 rounded-xl border-2 border-line-strong px-5 text-base font-bold disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="min-h-12 flex-1 rounded-xl bg-brand px-5 text-base font-extrabold text-brand-fg disabled:opacity-60"
          >
            {salvando ? 'Salvando…' : 'Salvar endereço'}
          </button>
        </div>
      </div>
    )

  const resumo = endereco ? resumoEndereco(enderecoParaForm(endereco)) : null

  return (
    <div className="flex flex-col gap-4">
      {aviso && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-l-4 border-safe bg-safe-soft p-3 text-base font-bold text-safe-ink">
          <CircleCheck className="size-5 shrink-0" aria-hidden="true" />
          {aviso}
        </p>
      )}

      {endereco ? (
        <p className="flex items-start gap-2 text-base font-semibold">
          <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <span>
            {resumo}
            {endereco.origemCoordenada === 'GPS' && (
              <span className="block text-sm font-normal text-ink2">Com a localização do aparelho registrada.</span>
            )}
          </span>
        </p>
      ) : (
        <p className="text-base text-ink2">
          Você ainda não informou onde mora. Com o endereço, avisamos sobre riscos e indicamos abrigos perto de casa
          mesmo com a localização do aparelho desligada.
        </p>
      )}

      {erro && (
        <p role="alert" className="text-base font-bold text-crit-ink">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={abrirEdicao}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-base font-extrabold text-brand-fg"
        >
          <Pencil className="size-4" aria-hidden="true" />
          {endereco ? 'Trocar endereço' : 'Informar endereço'}
        </button>

        {endereco &&
          (confirmarRemocao ? (
            <div className="flex flex-col gap-2 rounded-xl border-2 border-crit p-3 sm:flex-row sm:items-center">
              <span className="text-base font-semibold">Apagar o endereço e revogar a autorização?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={remover}
                  disabled={salvando}
                  className="min-h-11 rounded-lg bg-crit px-4 text-base font-bold text-white disabled:opacity-60"
                >
                  {salvando ? 'Apagando…' : 'Sim, apagar'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmarRemocao(false)}
                  className="min-h-11 rounded-lg border-2 border-line-strong px-4 text-base font-bold"
                >
                  Não
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmarRemocao(true)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-line-strong px-5 text-base font-bold"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Apagar meu endereço
            </button>
          ))}
      </div>
    </div>
  )
}
