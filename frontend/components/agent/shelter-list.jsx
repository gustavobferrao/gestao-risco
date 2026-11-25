'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ShelterCard } from '@/components/agent/shelter-card'
import { ShelterFormModal } from '@/components/agent/shelter-form-modal'
import { PetFilter } from '@/components/shelter-pet-badge'

export function ShelterList({ abrigos, onSalvar }) {
  const [formulario, setFormulario] = useState(null)
  const [soPets, setSoPets] = useState(false)
  const visiveis = soPets ? abrigos.filter((a) => a.aceitaPets) : abrigos

  const salvar = (abrigo) => {
    onSalvar(abrigo)
    setFormulario(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Abrigos</h1>
          <p className="text-base text-ink2">Gerencie capacidade e vagas disponíveis.</p>
        </div>
        <button
          type="button"
          onClick={() => setFormulario({ abrigo: null })}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-base font-extrabold text-brand-fg"
        >
          <Plus className="size-5" aria-hidden="true" />
          Novo abrigo
        </button>
      </div>

      <PetFilter id="agente-filtro-pets" checked={soPets} onChange={setSoPets} />

      {visiveis.length === 0 && <p className="text-base text-ink2">Nenhum abrigo cadastrado aceita pets.</p>}

      <ul className="grid gap-3 md:grid-cols-2">
        {visiveis.map((a) => (
          <ShelterCard key={a.id} abrigo={a} onEditar={(abrigo) => setFormulario({ abrigo })} />
        ))}
      </ul>

      {formulario && (
        <ShelterFormModal abrigo={formulario.abrigo} onSalvar={salvar} onFechar={() => setFormulario(null)} />
      )}
    </div>
  )
}
