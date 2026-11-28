'use client'

import { LoaderCircle, MapPin, MapPinOff } from 'lucide-react'
import { SelectField } from '@/components/agent/fields'
import { localidadesService } from '@/lib/api/services'
import { useApi } from '@/lib/api/use-api'
import { cn } from '@/lib/utils'

const nomeCidade = (c) => (c ? `${c.nome}${c.uf ? ` (${c.uf})` : ''}` : '')

function textoOrigem({ origem, cidade }) {
  switch (origem) {
    case 'gps':
      return 'Usando a localização do aparelho.'
    case 'endereco':
      return 'Usando o seu endereço cadastrado.'
    case 'cidade-endereco':
      return `Usando o centro de ${nomeCidade(cidade)}. Para distâncias mais precisas, ligue a localização do aparelho ou registre-a no seu endereço, em Preferências.`
    case 'cidade-escolhida':
      return `Usando o centro de ${nomeCidade(cidade)}.`
    default:
      return null
  }
}

function EscolherCidade({ localizacao, rotulo }) {
  const req = useApi((signal) => localidadesService.atendidas({ signal }), [])
  const cidades = req.dados ?? []
  return (
    <SelectField
      id="escolher-cidade"
      label={rotulo}
      value={localizacao.cidade?.codigoIbge ?? ''}
      onChange={(e) => localizacao.escolherCidade(cidades.find((c) => c.codigoIbge === e.target.value) ?? null)}
      options={[
        { value: '', label: req.carregando ? 'Carregando cidades…' : 'Escolha a cidade' },
        ...cidades.map((c) => ({ value: c.codigoIbge, label: nomeCidade(c) })),
      ]}
      className="max-w-sm"
    />
  )
}

/**
 * Diz de onde vem a posição usada nas distâncias e, sem posição, pede a cidade.
 * Substitui o antigo "centro de São Paulo" silencioso.
 */
export function LocalizacaoAviso({ localizacao, className }) {
  const { origem } = localizacao

  if (origem === 'pendente')
    return (
      <p role="status" className={cn('flex items-center gap-2 text-sm text-ink2', className)}>
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Localizando você…
      </p>
    )

  if (origem === 'sem-local')
    return (
      <div role="alert" className={cn('flex flex-col gap-3 rounded-xl border-l-4 border-high bg-high-soft p-4 text-high-ink', className)}>
        <p className="flex items-start gap-2 text-base font-bold">
          <MapPinOff className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          Não sabemos onde você está. Ligue a localização do aparelho, cadastre seu endereço em Preferências ou escolha
          a sua cidade.
        </p>
        <EscolherCidade localizacao={localizacao} rotulo="Sua cidade" />
      </div>
    )

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="flex items-start gap-2 text-sm text-ink2">
        <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {textoOrigem(localizacao)}
      </p>
      {origem === 'cidade-escolhida' && <EscolherCidade localizacao={localizacao} rotulo="Trocar de cidade" />}
    </div>
  )
}
