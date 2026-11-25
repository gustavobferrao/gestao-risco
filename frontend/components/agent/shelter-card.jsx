import { MapPin, Pencil, Phone } from 'lucide-react'
import { MapsRedirectButton } from '@/components/maps-redirect-button'
import { PetVagas, ShelterPetBadge } from '@/components/shelter-pet-badge'
import { cn } from '@/lib/utils'

function estadoOcupacao(vagas, capacidade) {
  const razao = capacidade > 0 ? vagas / capacidade : 0
  if (vagas === 0) return { barra: 'bg-crit', texto: 'text-crit-ink', rotulo: 'Lotado' }
  if (razao < 0.2) return { barra: 'bg-high', texto: 'text-high-ink', rotulo: 'Poucas vagas' }
  if (razao < 0.5) return { barra: 'bg-mid', texto: 'text-mid-ink', rotulo: 'Vagas limitadas' }
  return { barra: 'bg-safe', texto: 'text-safe-ink', rotulo: 'Vagas disponíveis' }
}

export function ShelterCard({ abrigo, onEditar }) {
  const { nome, endereco, capacidade, vagas, telefone, aceitaPets, capacidadePets, vagasPets, coords } = abrigo
  const estado = estadoOcupacao(vagas, capacidade)
  const percentual = capacidade > 0 ? Math.round((vagas / capacidade) * 100) : 0

  return (
    <li className="flex flex-col gap-4 rounded-2xl border-2 border-line bg-surface p-4 text-ink sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-extrabold">{nome}</h3>
          <p className="mt-1 flex items-start gap-1.5 text-base text-ink2">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {endereco}
          </p>
          <ShelterPetBadge aceitaPets={aceitaPets} className="mt-2" />
        </div>
        <button
          type="button"
          onClick={() => onEditar(abrigo)}
          aria-label={`Editar ${nome}`}
          className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border-2 border-line-strong px-3 text-sm font-bold hover:bg-brand-soft"
        >
          <Pencil className="size-4" aria-hidden="true" />
          Editar
        </button>
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <p className="text-2xl font-extrabold">
            {vagas}/{capacidade} <span className="text-base font-bold text-ink2">vagas</span>
          </p>
          <p className={cn('text-sm font-extrabold uppercase tracking-wide', estado.texto)}>{estado.rotulo}</p>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={capacidade}
          aria-valuenow={vagas}
          aria-label={`${vagas} de ${capacidade} vagas disponíveis`}
          className="h-3 overflow-hidden rounded-full bg-line"
        >
          <div className={cn('h-full rounded-full', estado.barra)} style={{ width: `${percentual}%` }} />
        </div>
      </div>

      {aceitaPets && <PetVagas vagasPets={vagasPets ?? 0} capacidadePets={capacidadePets ?? 0} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-base font-semibold">
          <Phone className="size-4 shrink-0 text-ink2" aria-hidden="true" />
          <a href={`tel:${telefone.replace(/\D/g, '')}`} className="underline underline-offset-4">
            {telefone}
          </a>
        </p>
        <MapsRedirectButton coords={coords} endereco={endereco} destinoNome={nome} />
      </div>
    </li>
  )
}
