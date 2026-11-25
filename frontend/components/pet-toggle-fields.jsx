'use client'

import { useRef, useState } from 'react'
import { Camera, PawPrint, RefreshCw, Trash2 } from 'lucide-react'
import { SelectField, TextField } from '@/components/agent/fields'
import { Segmented, Switch } from '@/components/form-controls'
import { especiesPet, portesPet } from '@/lib/mock-data'

export function PetToggleFields({ id = 'pets', value, onChange, label = 'Estou com meu(s) pet(s)', hint }) {
  const set = (campo, v) => onChange({ ...value, [campo]: v })

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-line bg-bg p-3">
      <Switch id={`${id}-toggle`} label={label} hint={hint} checked={value.ativo} onChange={(v) => set('ativo', v)} />

      {value.ativo && (
        <div className="flex flex-col gap-3 border-t-2 border-line pt-3">
          <p className="flex items-center gap-2 text-sm font-bold text-ink2">
            <PawPrint className="size-4" aria-hidden="true" />
            Assim a equipe leva transporte e abrigo adequados.
          </p>
          <div className="grid grid-cols-[6.5rem_1fr] gap-3">
            <TextField
              id={`${id}-qtd`}
              label="Quantidade"
              inputMode="numeric"
              value={value.quantidade}
              onChange={(e) => set('quantidade', e.target.value.replace(/\D/g, '').slice(0, 2))}
            />
            <SelectField
              id={`${id}-especie`}
              label="Espécie"
              options={especiesPet}
              value={value.especie}
              onChange={(e) => set('especie', e.target.value)}
            />
          </div>
          {value.especie === 'outro' && (
            <TextField
              id={`${id}-especie-outro`}
              label="Qual é o seu pet?"
              placeholder="Ex.: furão, calopsita, mini porco"
              autoComplete="off"
              maxLength={40}
              value={value.especieOutro ?? ''}
              onChange={(e) => set('especieOutro', e.target.value)}
            />
          )}
          <Segmented legend="Porte" name={`${id}-porte`} value={value.porte} onChange={(v) => set('porte', v)} options={portesPet} />
          <PetPhotoField id={`${id}-foto`} foto={value.foto} onChange={(v) => set('foto', v)} />
        </div>
      )}
    </div>
  )
}

const TAMANHO_MAX_MB = 5

function PetPhotoField({ id, foto, onChange }) {
  const inputRef = useRef(null)
  const [erro, setErro] = useState('')

  const escolher = (e) => {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    if (!arquivo.type.startsWith('image/')) return setErro('Escolha um arquivo de imagem (JPG, PNG ou HEIC).')
    if (arquivo.size > TAMANHO_MAX_MB * 1024 * 1024) return setErro(`A foto deve ter até ${TAMANHO_MAX_MB} MB.`)
    setErro('')
    const leitor = new FileReader()
    leitor.onload = () => onChange({ nome: arquivo.name, url: leitor.result })
    leitor.readAsDataURL(arquivo)
  }

  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="text-base font-bold text-ink">
        Foto do pet <span className="font-semibold text-ink2">(opcional)</span>
      </span>
      <p className="text-sm text-ink2">Ajuda a equipe a identificar seu pet no resgate ou no abrigo.</p>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-labelledby={`${id}-label`}
        aria-invalid={Boolean(erro)}
        aria-describedby={erro ? `${id}-erro` : undefined}
        onChange={escolher}
      />

      {foto ? (
        <div className="flex items-center gap-3 rounded-xl border-2 border-line-strong bg-surface p-2">
          <img src={foto.url} alt="Foto do pet enviada" className="size-20 shrink-0 rounded-lg object-cover" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="truncate text-sm font-semibold text-ink">{foto.nome}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex min-h-11 items-center gap-1.5 rounded-lg border-2 border-line-strong px-3 text-sm font-bold text-ink"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Trocar
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="flex min-h-11 items-center gap-1.5 rounded-lg border-2 border-line-strong px-3 text-sm font-bold text-crit-ink"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Remover
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line-strong bg-surface p-4 text-ink"
        >
          <Camera className="size-7 text-brand" aria-hidden="true" />
          <span className="text-base font-bold">Enviar foto do pet</span>
          <span className="text-sm text-ink2">Tire uma foto ou escolha da galeria · até {TAMANHO_MAX_MB} MB</span>
        </button>
      )}

      {erro && (
        <p id={`${id}-erro`} role="alert" className="text-sm font-bold text-crit-ink">
          {erro}
        </p>
      )}
    </div>
  )
}

export function resumoPets(pets) {
  if (!pets?.ativo) return null
  const especie =
    pets.especie === 'outro' && pets.especieOutro?.trim()
      ? pets.especieOutro.trim()
      : (especiesPet.find((e) => e.value === pets.especie)?.label ?? '')
  const porte = portesPet.find((p) => p.id === pets.porte)?.label.toLowerCase() ?? ''
  return `${pets.quantidade || 1} pet(s): ${especie}, porte ${porte}${pets.foto ? ' · com foto' : ''}`
}
