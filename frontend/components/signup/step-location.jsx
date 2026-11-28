'use client'

import { CircleAlert, Info } from 'lucide-react'
import { CamposEndereco } from '@/components/endereco/campos-endereco'

// Passo do endereço no cadastro: fortemente incentivado, mas pode ficar para depois.
export function StepLocation({ form }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-extrabold">Onde você mora?</h2>
        <p className="mt-1 text-base text-ink2">Com o endereço, avisamos sobre riscos e indicamos abrigos perto da sua casa.</p>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-info-soft p-3 text-base font-medium text-info-ink">
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        Usamos o endereço apenas para a sua segurança. Ele não aparece para outros moradores.
      </p>

      {form.errosEndereco.geral && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border-l-4 border-crit bg-crit-soft p-3 text-base font-bold text-crit-ink">
          <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          {form.errosEndereco.geral}
        </p>
      )}

      <CamposEndereco
        id="cadastro-endereco"
        valor={form.dados.endereco}
        onChange={form.setEndereco}
        erros={form.errosEndereco}
        permitirDepois
      />
    </div>
  )
}
