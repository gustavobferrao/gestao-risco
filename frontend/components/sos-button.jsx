'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, Hand, MapPin, Siren, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePrefs } from '@/lib/prefs-context'
import { chamadoInicial, petsVazio } from '@/lib/mock-data'
import { PetToggleFields } from '@/components/pet-toggle-fields'
import { SOSQuickMenu, tiposSOS } from '@/components/sos-quick-menu'

const HOLD_MS = 1500

function HoldToConfirmButton({ onConfirm, children }) {
  const [progresso, setProgresso] = useState(0)
  const inicio = useRef(null)
  const frame = useRef(null)

  const cancelar = useCallback(() => {
    cancelAnimationFrame(frame.current)
    inicio.current = null
    setProgresso(0)
  }, [])

  const iniciar = () => {
    if (inicio.current) return
    inicio.current = performance.now()
    const passo = (agora) => {
      const p = Math.min(1, (agora - inicio.current) / HOLD_MS)
      setProgresso(p)
      if (p >= 1) {
        inicio.current = null
        onConfirm()
        return
      }
      frame.current = requestAnimationFrame(passo)
    }
    frame.current = requestAnimationFrame(passo)
  }

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId)
          iniciar()
        }}
        onPointerUp={cancelar}
        onPointerCancel={cancelar}
        onPointerLeave={cancelar}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
            e.preventDefault()
            iniciar()
          }
        }}
        onKeyUp={(e) => (e.key === 'Enter' || e.key === ' ') && cancelar()}
        onContextMenu={(e) => e.preventDefault()}
        aria-describedby="sos-hold-dica"
        className="relative min-h-16 touch-none select-none overflow-hidden rounded-xl bg-[#DC2626] px-6 text-xl font-extrabold text-white"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-[#7F1D1D]"
          style={{ width: `${progresso * 100}%` }}
        />
        <span className="relative flex items-center justify-center gap-2">
          <Hand className="size-6" aria-hidden="true" />
          {progresso > 0 ? 'Continue segurando...' : children}
        </span>
      </button>
      <p id="sos-hold-dica" className="text-center text-sm font-semibold text-ink2">
        Segure o botão por 1,5 segundo para enviar.
      </p>
    </div>
  )
}

function SOSDialog({ tipo, onTrocarTipo, onClose, onSubmit }) {
  const { t } = usePrefs()
  const info = tiposSOS[tipo]
  const [descricao, setDescricao] = useState(info.descricao)
  const [pets, setPets] = useState(petsVazio)
  const [confirmou, setConfirmou] = useState(false)
  const [tentou, setTentou] = useState(false)
  const formulario = useRef(null)
  const campo = useRef(null)

  useEffect(() => {
    const el = campo.current
    el?.focus()
    el?.setSelectionRange(el.value.length, el.value.length)
    const aoTeclar = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onClose])

  const erroDescricao = tentou && !descricao.trim() ? t('sos.errorDesc') : null
  const erroConfirma = tentou && !confirmou ? t('sos.errorConfirm') : null

  function enviar() {
    setTentou(true)
    if (!descricao.trim() || !confirmou) return
    onSubmit({ tipo, descricao: descricao.trim(), localizacao: chamadoInicial.localizacao, pets: pets.ativo ? pets : null })
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-titulo"
        className="max-h-full w-full max-w-md overflow-y-auto rounded-t-3xl border-2 border-line bg-surface p-5 text-ink shadow-2xl sm:rounded-3xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="sos-titulo" className="flex items-center gap-2 text-2xl font-extrabold">
            <info.Icon className={cn('size-7', tipo === 'seguro' ? 'text-safe' : 'text-crit')} aria-hidden="true" />
            {info.label}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('sos.close')}
            className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-brand-soft"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>

        <form
          ref={formulario}
          onSubmit={(e) => {
            e.preventDefault()
            if (tipo !== 'resgate') enviar()
          }}
          noValidate
          className="mt-3 flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Tipo de pedido">
            {Object.values(tiposSOS).map((op) => (
              <button
                key={op.id}
                type="button"
                aria-pressed={op.id === tipo}
                onClick={() => {
                  if (op.id === tipo) return
                  onTrocarTipo(op.id)
                  setDescricao((d) => (d === info.descricao ? op.descricao : d))
                }}
                className={cn(
                  'inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-3 text-sm font-bold',
                  op.id === tipo ? op.classe : 'border-line-strong text-ink2',
                )}
              >
                <op.Icon className="size-4" aria-hidden="true" />
                {op.curto}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="sos-descricao" className="mb-1.5 block text-base font-bold">
              {t('sos.fieldLabel')}
            </label>
            <textarea
              ref={campo}
              id="sos-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              maxLength={140}
              rows={3}
              placeholder={t('sos.placeholder')}
              aria-invalid={Boolean(erroDescricao)}
              aria-describedby={erroDescricao ? 'sos-erro-desc' : undefined}
              className={cn(
                'w-full resize-none rounded-xl border-2 bg-surface p-3 text-lg text-ink placeholder:text-ink2',
                erroDescricao ? 'border-crit' : 'border-line-strong',
              )}
            />
            {erroDescricao && (
              <p id="sos-erro-desc" role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-crit-ink">
                <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                {erroDescricao}
              </p>
            )}
          </div>

          {tipo !== 'seguro' && <PetToggleFields id="sos-pets" value={pets} onChange={setPets} />}

          <div>
            <p className="mb-1.5 text-base font-bold">{t('sos.locationLabel')}</p>
            <p className="flex items-center gap-3 rounded-xl border-2 border-line bg-bg p-3 text-base font-semibold">
              <MapPin className="size-6 shrink-0 text-info" aria-hidden="true" />
              {chamadoInicial.localizacao}
            </p>
            <label
              htmlFor="sos-confirma"
              className={cn(
                'mt-2 flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 text-base font-semibold',
                confirmou ? 'border-brand bg-brand-soft' : 'border-line-strong',
                erroConfirma && 'border-crit',
              )}
            >
              <input
                id="sos-confirma"
                type="checkbox"
                checked={confirmou}
                onChange={(e) => setConfirmou(e.target.checked)}
                className="size-6 shrink-0 accent-[var(--sz-brand)]"
              />
              {t('sos.confirm')}
            </label>
            {erroConfirma && (
              <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-crit-ink">
                <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                {erroConfirma}
              </p>
            )}
          </div>

          {tipo === 'resgate' ? (
            <HoldToConfirmButton onConfirm={enviar}>{t('sos.send')}</HoldToConfirmButton>
          ) : (
            <button
              type="submit"
              className={cn(
                'min-h-14 rounded-xl px-6 text-xl font-extrabold text-white',
                tipo === 'seguro' ? 'bg-safe' : 'bg-[#DC2626]',
              )}
            >
              {tipo === 'seguro' ? 'Avisar que estou seguro' : t('sos.send')}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

function SOSToast({ toast, onFechar, onVerChamado }) {
  useEffect(() => {
    const id = setTimeout(onFechar, 9000)
    return () => clearTimeout(id)
  }, [toast, onFechar])

  return (
    <div
      role="status"
      aria-live="polite"
      className="sos-menu-in fixed inset-x-4 bottom-28 z-[115] mx-auto flex max-w-md items-start gap-3 rounded-2xl border-2 border-safe bg-surface p-4 text-ink shadow-2xl sm:bottom-32"
    >
      <CircleCheck className="mt-0.5 size-6 shrink-0 text-safe" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-base font-extrabold">
          {toast.tipo === 'seguro' ? 'Aviso enviado' : 'Pedido enviado'} · Protocolo {toast.protocolo}
        </p>
        <p className="text-sm text-ink2">
          {toast.tipo === 'seguro' ? 'A Defesa Civil sabe que você está seguro.' : 'Fique em local seguro. Avisaremos quando a equipe estiver a caminho.'}
        </p>
        {toast.tipo !== 'seguro' && (
          <button
            type="button"
            onClick={() => {
              onFechar()
              onVerChamado()
            }}
            className="mt-2 min-h-11 rounded-lg bg-brand px-4 text-base font-bold text-brand-fg"
          >
            Ver meu chamado
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onFechar}
        aria-label="Fechar aviso"
        className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-brand-soft"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
    </div>
  )
}

export function SOSButton({ onSubmit, onVerChamado, pedidosAtivos = 0 }) {
  const { t } = usePrefs()
  const [menuAberto, setMenuAberto] = useState(false)
  const [tipo, setTipo] = useState(null)
  const [toast, setToast] = useState(null)
  const botao = useRef(null)

  const fecharMenu = useCallback(() => {
    setMenuAberto(false)
    botao.current?.focus()
  }, [])
  const fecharDialogo = useCallback(() => setTipo(null), [])
  const fecharToast = useCallback(() => setToast(null), [])

  const enviar = (dados) => {
    const protocolo = onSubmit(dados)
    setTipo(null)
    setToast({ protocolo, tipo: dados.tipo })
  }

  return (
    <>
      <button
        ref={botao}
        type="button"
        onClick={() => setMenuAberto((v) => !v)}
        aria-label={pedidosAtivos > 0 ? `${t('sos.aria')} · ${pedidosAtivos} pedido(s) ativo(s)` : t('sos.aria')}
        aria-haspopup="menu"
        aria-expanded={menuAberto}
        aria-controls={menuAberto ? 'sos-menu' : undefined}
        data-sos
        className="fixed bottom-4 right-4 z-[112] flex size-20 items-center justify-center sm:bottom-6 sm:right-6"
      >
        {!menuAberto && (
          <>
            <span aria-hidden="true" className="sos-ring absolute inset-0 rounded-full bg-[#DC2626]" />
            <span aria-hidden="true" className="sos-ring sos-ring-delay absolute inset-0 rounded-full bg-[#DC2626]" />
          </>
        )}
        <span className="relative flex size-20 flex-col items-center justify-center rounded-full border-4 border-white bg-[#DC2626] text-white shadow-xl">
          {menuAberto ? (
            <X className="size-8" aria-hidden="true" />
          ) : (
            <>
              <Siren className="size-7" aria-hidden="true" />
              <span className="text-sm font-extrabold leading-none">{t('sos.label')}</span>
            </>
          )}
        </span>
        {pedidosAtivos > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full border-2 border-white bg-nav text-sm font-extrabold text-nav-fg"
          >
            {pedidosAtivos}
          </span>
        )}
      </button>

      {menuAberto && (
        <SOSQuickMenu
          onFechar={fecharMenu}
          onEscolher={(id) => {
            setMenuAberto(false)
            setTipo(id)
          }}
        />
      )}

      {tipo && <SOSDialog key="sos" tipo={tipo} onTrocarTipo={setTipo} onClose={fecharDialogo} onSubmit={enviar} />}

      {toast && <SOSToast toast={toast} onFechar={fecharToast} onVerChamado={onVerChamado} />}
    </>
  )
}
