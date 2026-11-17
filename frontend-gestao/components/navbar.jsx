'use client'

import { useState } from 'react'
import { Menu, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { abas, usuario } from '@/lib/mock-data'

function UserBlock({ className }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold leading-tight text-slate-900">{usuario.nome}</p>
        <p className="flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-600">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          {usuario.status}
        </p>
      </div>
      <div
        className="flex size-10 items-center justify-center rounded-full bg-petrol text-sm font-bold text-white ring-2 ring-white"
        aria-label={`Avatar de ${usuario.nome}`}
      >
        {usuario.iniciais}
      </div>
    </div>
  )
}

export function Navbar({ abaAtiva, onChange }) {
  const [menuAberto, setMenuAberto] = useState(false)

  function selecionar(id) {
    onChange(id)
    setMenuAberto(false)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px]">
        <div className="flex items-center gap-6 xl:gap-8">
          <a href="#" onClick={(e) => { e.preventDefault(); selecionar('visao-geral') }} className="flex shrink-0 items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-petrol text-white">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight text-slate-900">SafeZone</span>
              <span className="mt-1 text-[10px] font-semibold tracking-[0.14em] text-slate-400">
                DEFESA &amp; EMERGÊNCIA
              </span>
            </span>
          </a>

          <nav aria-label="Navegação principal" className="hidden items-center gap-1 lg:flex">
            {abas.map((aba) => {
              const ativa = aba.id === abaAtiva
              return (
                <button
                  key={aba.id}
                  type="button"
                  onClick={() => selecionar(aba.id)}
                  aria-current={ativa ? 'page' : undefined}
                  className={cn(
                    'rounded-xl px-4 py-2 text-left transition-colors',
                    ativa ? 'bg-slate-900 text-white' : 'text-slate-900 hover:bg-slate-100',
                  )}
                >
                  <span className="block text-sm font-bold leading-tight">{aba.titulo}</span>
                  <span className={cn('block text-xs leading-tight', ativa ? 'text-slate-300' : 'text-slate-500')}>
                    {aba.subtitulo}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <UserBlock />
          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            className="ml-1 flex size-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            {menuAberto ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuAberto && (
        <nav id="menu-mobile" aria-label="Navegação principal" className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 shadow-md lg:hidden">
          <ul className="flex flex-col gap-1">
            {abas.map((aba) => {
              const ativa = aba.id === abaAtiva
              return (
                <li key={aba.id}>
                  <button
                    type="button"
                    onClick={() => selecionar(aba.id)}
                    aria-current={ativa ? 'page' : undefined}
                    className={cn(
                      'w-full rounded-xl px-4 py-3 text-left',
                      ativa ? 'bg-slate-900 text-white' : 'text-slate-900 hover:bg-slate-100',
                    )}
                  >
                    <span className="block text-sm font-bold">{aba.titulo}</span>
                    <span className={cn('block text-xs', ativa ? 'text-slate-300' : 'text-slate-500')}>{aba.subtitulo}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </header>
  )
}
