'use client'

import { useState } from 'react'
import { Clock, Footprints, Users } from 'lucide-react'
import { Carregando, ErroApi } from '@/components/api-state'
import { MapsRedirectButton } from '@/components/maps-redirect-button'
import { LocalizacaoAviso } from '@/components/localizacao-aviso'
import { RiskMap } from '@/components/risk-map'
import { PetFilter, PetVagas, ShelterPetBadge } from '@/components/shelter-pet-badge'

function ListaAbrigos({ abrigos }) {
  return (
    <ul className="mt-4 grid gap-3 md:grid-cols-3">
      {abrigos.map((a) => {
        const temInfoPets = a.aceitaPets !== null && a.aceitaPets !== undefined
        return (
          <li
            key={a.id}
            className={
              a.recomendado
                ? 'flex flex-col gap-2 rounded-xl border-2 border-safe bg-safe-soft p-4'
                : 'flex flex-col gap-2 rounded-xl border-2 border-line bg-bg p-4'
            }
          >
            <div className="flex flex-wrap gap-2">
              {a.recomendado && (
                <span className="flex min-h-7 w-fit items-center rounded-md bg-safe px-2 text-xs font-extrabold tracking-wider text-white">
                  RECOMENDADO
                </span>
              )}
              {temInfoPets && <ShelterPetBadge aceitaPets={a.aceitaPets} />}
            </div>
            <p className="text-lg font-bold leading-snug">{a.nome}</p>
            <p className="text-sm text-ink2">{a.endereco}</p>
            <p className="flex items-center gap-2 text-base">
              <Footprints className="size-5 shrink-0" aria-hidden="true" />
              {a.distanciaKm.toString().replace('.', ',')} km
            </p>
            <p className="flex items-center gap-2 text-base">
              <Clock className="size-5 shrink-0" aria-hidden="true" />
              {a.tempoMin} min a pé
            </p>
            <p className="flex items-center gap-2 text-base">
              <Users className="size-5 shrink-0" aria-hidden="true" />
              {a.vagas_disponiveis > 0 ? `${a.vagas_disponiveis} vagas` : 'Lotado'}
            </p>
            {a.aceitaPets && <PetVagas vagasPets={a.vagasPets} capacidadePets={a.capacidadePets} />}
            <MapsRedirectButton coords={a.coords} endereco={a.endereco} destinoNome={a.nome} className="mt-1" />
          </li>
        )
      })}
    </ul>
  )
}

export function MapPage({ abrigos, abrigosReq, localizacao, onVerArea }) {
  const [soPets, setSoPets] = useState(false)
  // o filtro só faz sentido quando a API informar pets (ainda não informa)
  const temDadosPets = abrigos.some((a) => a.aceitaPets !== null && a.aceitaPets !== undefined)
  const visiveis = soPets && temDadosPets ? abrigos.filter((a) => a.aceitaPets) : abrigos

  let conteudo
  if (abrigosReq.carregando && !abrigosReq.dados) {
    conteudo = <Carregando texto="Buscando abrigos próximos…" className="mt-4" />
  } else if (visiveis.length === 0 && !abrigosReq.erro) {
    conteudo = <p className="mt-4 rounded-xl bg-bg p-4 text-base font-semibold text-ink2">Nenhum abrigo encontrado.</p>
  } else {
    conteudo = <ListaAbrigos abrigos={visiveis} />
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-extrabold">Mapa de riscos</h1>
        <p className="text-base text-ink2">Zonas de risco, abrigos e a sua posição.</p>
      </div>

      <RiskMap
        titulo="Zonas e abrigos"
        nivelTitulo={2}
        abrigos={abrigos}
        posicao={localizacao.coords}
        onVerArea={onVerArea}
      />

      <section aria-labelledby="titulo-abrigos" className="rounded-2xl border-2 border-line bg-surface p-4 text-ink sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="titulo-abrigos" className="text-2xl font-extrabold">
              Abrigos próximos
            </h2>
            <LocalizacaoAviso localizacao={localizacao} className="mt-1" />
          </div>
          {temDadosPets && <PetFilter id="morador-filtro-pets" checked={soPets} onChange={setSoPets} />}
        </div>
        {abrigosReq.erro && <ErroApi erro={abrigosReq.erro} onTentarNovamente={abrigosReq.recarregar} className="mt-4" />}
        {conteudo}
      </section>
    </div>
  )
}
