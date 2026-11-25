'use client'

import { useState } from 'react'
import { CircleAlert, Contrast, Eye, EyeOff, LogIn } from 'lucide-react'
import { SafeZoneLogo } from '@/components/safezone-logo'
import { FloatingField } from '@/components/signup/floating-field'
import { useAuth } from '@/lib/auth-context'
import { emailValido } from '@/lib/masks'
import { usePrefs } from '@/lib/prefs-context'
import { cn } from '@/lib/utils'

// O perfil (morador ou agente) vem do banco no login: a tela não pergunta.
export function LoginScreen({ onCriarConta }) {
  const { prefs, atualizar, t } = usePrefs()
  const { entrar: entrarNaApi } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [tentou, setTentou] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erroApi, setErroApi] = useState('')

  const erroEmail = emailValido(email) ? undefined : 'Digite um e-mail válido. Exemplo: nome@email.com'
  const erroSenha = senha.length < 1 ? 'Digite sua senha.' : undefined

  const entrar = async (e) => {
    e.preventDefault()
    setErroApi('')
    if (erroEmail || erroSenha) {
      setTentou(true)
      return
    }
    setEnviando(true)
    try {
      // sucesso: o AuthProvider guarda o usuário e o SafeZoneApp troca de tela sozinho
      await entrarNaApi({ email, senha })
    } catch (erro) {
      setErroApi(erro.message ?? 'Não foi possível entrar. Tente novamente.')
      setEnviando(false)
    }
  }

  const toggle = (
    <button
      type="button"
      onClick={() => setMostrar((v) => !v)}
      aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
      aria-pressed={mostrar}
      className="flex size-11 items-center justify-center rounded-lg text-ink2 hover:bg-brand-soft"
    >
      {mostrar ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
    </button>
  )

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <header className="bg-nav text-nav-fg shadow-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2.5 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <SafeZoneLogo />
            <span className="text-xl font-extrabold tracking-tight">SafeZone</span>
          </div>
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
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold">Entrar</h1>
            <p className="mt-2 text-base text-ink2">Acesse o painel de alertas e acompanhe os riscos na sua região.</p>
          </div>

          <form
            onSubmit={entrar}
            noValidate
            className="flex flex-col gap-4 rounded-2xl border-2 border-line bg-surface p-4 sm:p-6"
          >
            {erroApi && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border-l-4 border-crit bg-crit-soft p-3 text-base font-bold text-crit-ink">
                <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                {erroApi}
              </p>
            )}

            <FloatingField
              id="login-email"
              label="E-mail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={tentou ? erroEmail : undefined}
            />
            <FloatingField
              id="login-senha"
              label="Senha"
              type={mostrar ? 'text' : 'password'}
              autoComplete="current-password"
              rightSlot={toggle}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              error={tentou ? erroSenha : undefined}
            />

            <button
              type="submit"
              disabled={enviando}
              className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-lg font-extrabold text-brand-fg disabled:opacity-60"
            >
              <LogIn className="size-5" aria-hidden="true" />
              {enviando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-5 text-center text-base text-ink2">
            Ainda não tem conta?{' '}
            <button type="button" onClick={onCriarConta} className="font-bold text-ink underline underline-offset-4">
              Criar conta
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
