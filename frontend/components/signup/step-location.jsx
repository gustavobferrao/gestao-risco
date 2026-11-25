'use client'

import { useState } from 'react'
import { CircleCheck, Info, LocateFixed } from 'lucide-react'
import { FloatingField } from '@/components/signup/floating-field'
import { PetToggleFields } from '@/components/pet-toggle-fields'
import { enderecosMock } from '@/lib/mock-data'
import { maskCep, maskCnpj, maskTelefone } from '@/lib/masks'

const normalizar = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function ResidentFields({ form }) {
  const [foco, setFoco] = useState(false)
  const busca = normalizar(form.dados.logradouro)
  const sugestoes =
    foco && busca.length >= 2
      ? enderecosMock.filter((e) => normalizar(`${e.logradouro} ${e.bairro}`).includes(busca)).slice(0, 4)
      : []

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-2 rounded-xl bg-info-soft p-3 text-base font-medium text-info-ink">
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        Usamos o endereço apenas para avisar sobre riscos perto de você.
      </p>

      <button
        type="button"
        onClick={form.usarLocalizacao}
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-brand px-4 text-base font-bold text-ink hover:bg-brand-soft"
      >
        <LocateFixed className="size-5" aria-hidden="true" />
        Usar minha localização atual
      </button>

      {form.dados.usouGps && (
        <p role="status" className="flex items-center gap-2 rounded-xl border-l-4 border-safe bg-safe-soft p-3 text-base font-bold text-safe-ink">
          <CircleCheck className="size-5 shrink-0" aria-hidden="true" />
          Localização obtida e preenchida abaixo.
        </p>
      )}

      <div className="relative">
        <FloatingField
          id="logradouro"
          label="Rua e número"
          autoComplete="off"
          role="combobox"
          aria-expanded={sugestoes.length > 0}
          aria-controls="lista-enderecos"
          aria-autocomplete="list"
          onFocus={() => setFoco(true)}
          {...form.props('logradouro')}
          onBlur={() => {
            setFoco(false)
            form.tocar('logradouro')
          }}
        />
        {sugestoes.length > 0 && (
          <ul
            id="lista-enderecos"
            role="listbox"
            aria-label="Sugestões de endereço"
            className="absolute inset-x-0 top-15 z-10 overflow-hidden rounded-xl border-2 border-line-strong bg-surface shadow-lg"
          >
            {sugestoes.map((s) => (
              <li key={s.cep} role="option" aria-selected="false">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    form.preencherEndereco(s)
                    setFoco(false)
                  }}
                  className="flex min-h-14 w-full flex-col items-start justify-center px-4 py-2 text-left hover:bg-brand-soft"
                >
                  <span className="text-base font-bold text-ink">{s.logradouro}</span>
                  <span className="text-sm text-ink2">
                    {s.bairro} · {s.cep}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <FloatingField id="bairro" label="Bairro" autoComplete="off" {...form.props('bairro')} />
      <FloatingField id="cep" label="CEP" inputMode="numeric" autoComplete="postal-code" {...form.props('cep', maskCep)} />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-lg font-extrabold">
          Tem animais de estimação em casa? <span className="text-sm font-semibold text-ink2">(opcional)</span>
        </legend>
        <PetToggleFields
          id="cadastro-pets"
          label="Sim, tenho pet(s)"
          hint="Ajuda a Defesa Civil a indicar abrigos que aceitam animais."
          value={form.dados.pets}
          onChange={(v) => form.set('pets', v)}
        />
      </fieldset>
    </div>
  )
}

function AgentFields({ form }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-2 rounded-xl bg-info-soft p-3 text-base font-medium text-info-ink">
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        Contas de agentes passam por validação do órgão antes de serem ativadas.
      </p>
      <FloatingField id="orgao" label="Órgão ou instituição" autoComplete="organization" {...form.props('orgao')} />
      <FloatingField id="cnpj" label="CNPJ" inputMode="numeric" autoComplete="off" {...form.props('cnpj', maskCnpj)} />
      <FloatingField id="telInst" label="Telefone institucional" type="tel" inputMode="tel" {...form.props('telInst', maskTelefone)} />
    </div>
  )
}

export function StepLocation({ perfil, form }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-extrabold">{perfil === 'agente' ? 'Dados do órgão' : 'Onde você mora?'}</h2>
      {perfil === 'agente' ? <AgentFields form={form} /> : <ResidentFields form={form} />}
    </div>
  )
}
