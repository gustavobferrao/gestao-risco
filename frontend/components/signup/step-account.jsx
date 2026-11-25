'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FloatingField } from '@/components/signup/floating-field'
import { forcaSenha, maskCpf, maskTelefone } from '@/lib/masks'

const coresForca = ['bg-crit', 'bg-high', 'bg-mid', 'bg-safe']

export function StepAccount({ form }) {
  const [mostrar, setMostrar] = useState(false)
  const forca = forcaSenha(form.dados.senha)

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
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-extrabold">Crie sua conta</h2>
        <p className="mt-1 text-base text-ink2">Usamos seus dados só para te proteger e te avisar.</p>
      </div>

      <FloatingField id="nome" label="Nome completo" autoComplete="name" {...form.props('nome')} />
      <FloatingField id="cpf" label="CPF" inputMode="numeric" autoComplete="off" {...form.props('cpf', maskCpf)} />
      <FloatingField id="telefone" label="Telefone" type="tel" inputMode="tel" autoComplete="tel" {...form.props('telefone', maskTelefone)} />
      <FloatingField id="email" label="E-mail" type="email" autoComplete="email" {...form.props('email')} />

      <div>
        <FloatingField
          id="senha"
          label="Senha"
          type={mostrar ? 'text' : 'password'}
          autoComplete="new-password"
          rightSlot={toggle}
          hint="Mínimo de 8 caracteres."
          {...form.props('senha')}
        />
        {form.dados.senha && (
          <div role="status" className="mt-2 flex items-center gap-3">
            <div className="flex flex-1 gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className={cn('h-2 flex-1 rounded-full', n <= forca.nivel ? coresForca[forca.nivel - 1] : 'bg-line')}
                />
              ))}
            </div>
            <span className="text-sm font-bold">Força da senha: {forca.rotulo}</span>
          </div>
        )}
      </div>

      <FloatingField
        id="confirma"
        label="Confirmar senha"
        type={mostrar ? 'text' : 'password'}
        autoComplete="new-password"
        {...form.props('confirma')}
      />
    </div>
  )
}
