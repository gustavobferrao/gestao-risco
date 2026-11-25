'use client'

import { useEffect, useRef, useState } from 'react'
import { Contrast, LogOut, Menu, Settings2, X } from 'lucide-react'
import { SafeZoneLogo } from '@/components/safezone-logo'
import { cn } from '@/lib/utils'
import { usePrefs } from '@/lib/prefs-context'
import { useAuth } from '@/lib/auth-context'

const abas = [
  { id: 'overview', chave: 'tab.overview' },
  { id: 'map', chave: 'tab.map' },
  { id: 'forecast', chave: 'tab.forecast' },
  { id: 'claim', chave: 'tab.claim' },
]

function AccountMenu({ onNavigate, onLogout }) {
  const { t } = usePrefs()
  const { usuario } = useAuth()
  const [aberto, setAberto] = useState(false)
  const raiz = useRef(null)

  useEffect(() => {
    if (!aberto) return
    const fechar = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') return
      if (e.type === 'mousedown' && raiz.current?.contains(e.target)) return
      setAberto(false)
    }
    document.addEventListener('mousedown', fechar)
    document.addEventListener('keydown', fechar)
    return () => {
      document.removeEventListener('mousedown', fechar)
      document.removeEventListener('keydown', fechar)
    }
  }, [aberto])

  const ir = (id) => {
    setAberto(false)
    onNavigate(id)
  }

  return (
    <div ref={raiz} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="true"
        aria-label={`${t('menu.account')}: ${usuario.nome}`}
        className="flex size-11 items-center justify-center rounded-full bg-nav-fg text-sm font-extrabold text-nav"
      >
        {usuario.iniciais}
      </button>
      {aberto && (
        <div className="absolute right-0 top-13 z-10 w-64 rounded-2xl border-2 border-line-strong bg-surface p-2 text-ink shadow-xl">
          <div className="px-3 py-2">
            <p className="text-base font-bold">{usuario.nome}</p>
            <p className="truncate text-sm text-ink2">{usuario.email}</p>
          </div>
          <button
            type="button"
            onClick={() => ir('prefs')}
            className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-base font-semibold hover:bg-brand-soft"
          >
            <Settings2 className="size-5" aria-hidden="true" />
            {t('menu.prefs')}
          </button>
          <button
            type="button"
            onClick={() => {
              setAberto(false)
              onLogout()
            }}
            className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-base font-semibold hover:bg-brand-soft"
          >
            <LogOut className="size-5" aria-hidden="true" />
            {t('menu.logout')}
          </button>
        </div>
      )}
    </div>
  )
}

export function Navbar({ view, onNavigate, onLogout }) {
  const { prefs, atualizar, t } = usePrefs()
  const [menuAberto, setMenuAberto] = useState(false)

  const ir = (id) => {
    setMenuAberto(false)
    onNavigate(id)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-nav text-nav-fg shadow-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => ir('overview')} className="flex min-h-11 items-center gap-2.5 rounded-lg">
            <SafeZoneLogo />
            <span className="text-xl font-extrabold tracking-tight">SafeZone</span>
          </button>

          <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
            {abas.map((aba) => {
              const ativa = aba.id === view
              return (
                <button
                  key={aba.id}
                  type="button"
                  onClick={() => ir(aba.id)}
                  aria-current={ativa ? 'page' : undefined}
                  className={cn(
                    'min-h-11 rounded-xl px-4 text-base font-bold transition-colors',
                    ativa ? 'bg-nav-fg text-nav' : 'text-nav-fg hover:bg-white/15',
                  )}
                >
                  {t(aba.chave)}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => atualizar({ altoContraste: !prefs.altoContraste })}
            aria-pressed={prefs.altoContraste}
            aria-label={t('contrast.toggle')}
            title={t('contrast.toggle')}
            className={cn(
              'flex size-11 items-center justify-center rounded-full border-2 transition-colors',
              prefs.altoContraste ? 'border-nav-fg bg-nav-fg text-nav' : 'border-white/50 text-nav-fg hover:bg-white/15',
            )}
          >
            <Contrast className="size-5" aria-hidden="true" />
          </button>
          <AccountMenu onNavigate={ir} onLogout={onLogout} />
          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            aria-label={menuAberto ? t('menu.close') : t('menu.open')}
            className="flex size-11 items-center justify-center rounded-xl hover:bg-white/15 lg:hidden"
          >
            {menuAberto ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuAberto && (
        <nav id="menu-mobile" aria-label="Principal" className="border-t border-white/20 bg-nav px-4 pb-4 pt-2 lg:hidden">
          <ul className="flex flex-col gap-1">
            {abas.map((aba) => {
              const ativa = aba.id === view
              return (
                <li key={aba.id}>
                  <button
                    type="button"
                    onClick={() => ir(aba.id)}
                    aria-current={ativa ? 'page' : undefined}
                    className={cn(
                      'min-h-12 w-full rounded-xl px-4 text-left text-lg font-bold',
                      ativa ? 'bg-nav-fg text-nav' : 'text-nav-fg hover:bg-white/15',
                    )}
                  >
                    {t(aba.chave)}
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
