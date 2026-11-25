'use client'

import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

export function Modal({ titulo, descricao, onFechar, children }) {
  const tituloId = useId()
  const painel = useRef(null)
  // sempre a versão mais recente de onFechar, sem reconfigurar o efeito abaixo
  const fecharRef = useRef(onFechar)
  useEffect(() => {
    fecharRef.current = onFechar
  }, [onFechar])

  // Configura só ao abrir: se rodasse a cada render do pai, o foco voltaria
  // sozinho para o painel (ex.: quando a lista de alertas atualiza).
  useEffect(() => {
    const anterior = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    painel.current?.focus()

    const aoTeclar = (e) => {
      if (e.key === 'Escape') fecharRef.current()
      if (e.key !== 'Tab' || !painel.current) return
      const focaveis = painel.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
      )
      if (focaveis.length === 0) return
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primeiro.focus()
      }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflow
      anterior?.focus?.()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-surface text-ink shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b-2 border-line p-4 sm:p-5">
          <div>
            <h2 id={tituloId} className="text-2xl font-extrabold">
              {titulo}
            </h2>
            {descricao && <p className="mt-1 text-base text-ink2">{descricao}</p>}
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-brand-soft"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>
  )
}
