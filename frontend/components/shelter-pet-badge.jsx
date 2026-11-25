import { Ban, PawPrint } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ShelterPetBadge({ aceitaPets, className }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 w-fit items-center gap-1.5 rounded-md border-l-4 px-2.5 py-1 text-xs font-extrabold tracking-wide',
        aceitaPets ? 'border-safe bg-safe-soft text-safe-ink' : 'border-line-strong bg-bg text-ink2',
        className,
      )}
    >
      {aceitaPets ? <PawPrint className="size-4 shrink-0" aria-hidden="true" /> : <Ban className="size-4 shrink-0" aria-hidden="true" />}
      {aceitaPets ? 'Aceita pets' : 'Não aceita pets'}
    </span>
  )
}

export function PetVagas({ vagasPets, capacidadePets }) {
  return (
    <p className="flex items-center gap-2 text-base">
      <PawPrint className="size-5 shrink-0" aria-hidden="true" />
      Vagas para pets: <span className="font-bold">{vagasPets}/{capacidadePets}</span>
    </p>
  )
}

export function PetFilter({ checked, onChange, id = 'filtro-pets' }) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex min-h-12 w-fit cursor-pointer items-center gap-3 rounded-xl border-2 px-4 text-base font-semibold',
        checked ? 'border-brand bg-brand-soft' : 'border-line-strong bg-surface',
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-6 shrink-0 accent-[var(--sz-brand)]"
      />
      <PawPrint className="size-5 shrink-0" aria-hidden="true" />
      Mostrar só abrigos que aceitam pets
    </label>
  )
}
