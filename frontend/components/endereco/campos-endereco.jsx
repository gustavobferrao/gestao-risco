'use client'

import { useEffect, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, Info, LoaderCircle, LocateFixed, X } from 'lucide-react'
import { SelectField } from '@/components/agent/fields'
import { Segmented } from '@/components/form-controls'
import { FloatingField } from '@/components/signup/floating-field'
import { cepService, localidadesService } from '@/lib/api/services'
import { useApi } from '@/lib/api/use-api'
import { maskCep, onlyDigits } from '@/lib/masks'
import { cn } from '@/lib/utils'

/**
 * Estado do formulário de endereço (o mesmo no cadastro e em Preferências).
 * modo: 'completo' (CEP + rua) | 'cidade' (só a cidade) | 'depois' (só no cadastro)
 * cepStatus: 'ocioso' | 'buscando' | 'ok' | 'nao-encontrado' | 'nao-atendida' | 'erro'
 */
export const ENDERECO_INICIAL = {
  modo: 'completo',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  codigoIbge: '',
  cidade: '',
  uf: '',
  gps: null,
  consentimento: false,
  cepStatus: 'ocioso',
}

/** Resposta da API (EnderecoUsuarioResponse) -> estado do formulário. */
export function enderecoParaForm(e) {
  if (!e) return ENDERECO_INICIAL
  const temGps = e.origemCoordenada === 'GPS' && e.latitude != null
  return {
    ...ENDERECO_INICIAL,
    modo: e.cep ? 'completo' : 'cidade',
    cep: e.cep ? maskCep(e.cep) : '',
    logradouro: e.logradouro ?? '',
    numero: e.numero ?? '',
    complemento: e.complemento ?? '',
    bairro: e.bairro ?? '',
    codigoIbge: e.codigoIbge ?? '',
    cidade: e.cidade ?? '',
    uf: e.uf ?? '',
    gps: temGps ? { lat: Number(e.latitude), lng: Number(e.longitude) } : null,
    consentimento: true, // quem já tem endereço salvo já aceitou
    cepStatus: e.cep ? 'ok' : 'ocioso',
  }
}

/** Erros por campo. Vazio = pode salvar. */
export function validarEndereco(e) {
  const erros = {}
  if (e.modo === 'depois') return erros

  if (e.modo === 'completo') {
    if (onlyDigits(e.cep).length !== 8) erros.cep = 'Digite os 8 números do CEP.'
    else if (e.cepStatus === 'buscando') erros.cep = 'Aguarde: buscando o CEP.'
    else if (e.cepStatus === 'nao-encontrado') erros.cep = 'CEP não encontrado. Confira os números.'
    else if (e.cepStatus === 'nao-atendida') erros.cep = `${e.cidade} ainda não é atendida pelo SafeZone.`
    else if (e.cepStatus === 'erro' && !e.codigoIbge)
      erros.cep = 'Não conseguimos consultar o CEP agora. Tente de novo ou escolha só a cidade.'
    if (!e.logradouro.trim()) erros.logradouro = 'Digite a rua.'
    if (!e.numero.trim()) erros.numero = 'Digite o número, ou S/N se não houver.'
  }

  if (e.modo === 'cidade' && !e.codigoIbge) erros.codigoIbge = 'Escolha a sua cidade.'
  if (!e.consentimento) erros.consentimento = 'Autorize o uso do endereço para salvar.'
  return erros
}

/** Texto curto do endereço, para revisão e Preferências. */
export function resumoEndereco(e) {
  if (!e || e.modo === 'depois') return null
  const cidade = e.cidade ? `${e.cidade}${e.uf ? ` - ${e.uf}` : ''}` : ''
  if (e.modo === 'cidade') return cidade
  const rua = [e.logradouro, e.numero].filter(Boolean).join(', ')
  const resto = [e.complemento, e.bairro, cidade, e.cep].filter(Boolean).join(' · ')
  return [rua, resto].filter(Boolean).join(' · ')
}

const nomeComUf = (c) => `${c.nome} (${c.uf})`

function StatusCep({ valor, atendidas }) {
  const { cepStatus, cidade, uf } = valor
  if (cepStatus === 'buscando')
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-semibold text-ink2">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Buscando o CEP…
      </p>
    )
  if (cepStatus === 'ok')
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-bold text-safe-ink">
        <CircleCheck className="size-4" aria-hidden="true" />
        {`${cidade} (${uf}) · cidade atendida pelo SafeZone`}
      </p>
    )
  if (cepStatus === 'nao-atendida')
    return (
      <p role="alert" className="text-sm font-semibold text-crit-ink">
        {`${cidade} (${uf}) ainda não é atendida. Hoje o SafeZone cobre: ${atendidas.map(nomeComUf).join(', ')}.`}
      </p>
    )
  return null
}

/**
 * Campos de endereço controlados: `valor` é o estado, `onChange(patch)` aplica mudanças.
 * `erros` só deve vir preenchido quando for hora de mostrar (depois de tentar avançar).
 */
export function CamposEndereco({ id = 'endereco', valor, onChange, erros = {}, permitirDepois = false }) {
  const atendidasReq = useApi((signal) => localidadesService.atendidas({ signal }), [])
  const atendidas = atendidasReq.dados ?? []
  const [gpsErro, setGpsErro] = useState('')
  const [buscandoGps, setBuscandoGps] = useState(false)

  // busca o CEP quando ele fica completo; a resposta de um CEP antigo é descartada
  const cepDigitos = onlyDigits(valor.cep)
  const ultimoCep = useRef(valor.cepStatus === 'ok' ? cepDigitos : null)
  // rua e bairro que vieram do CEP anterior: um CEP novo pode trocá-los,
  // mas o que o usuário digitou à mão fica
  const preenchidoPeloCep = useRef({ logradouro: '', bairro: '' })
  const preencherDoCep = (r) => {
    const patch = {}
    for (const nome of ['logradouro', 'bairro']) {
      const atual = valor[nome].trim()
      const veioDoCep = atual === '' || atual === preenchidoPeloCep.current[nome]
      if (veioDoCep) patch[nome] = r[nome] ?? ''
      preenchidoPeloCep.current[nome] = veioDoCep ? (r[nome] ?? '') : ''
    }
    return patch
  }

  useEffect(() => {
    if (valor.modo !== 'completo' || cepDigitos.length !== 8 || ultimoCep.current === cepDigitos) return
    ultimoCep.current = cepDigitos
    const controle = new AbortController()
    onChange({ cepStatus: 'buscando' })
    cepService
      .consultar(cepDigitos, { signal: controle.signal })
      .then((r) =>
        onChange({
          cepStatus: r.atendida ? 'ok' : 'nao-atendida',
          codigoIbge: r.codigoIbge,
          cidade: r.cidade,
          uf: r.uf,
          ...preencherDoCep(r),
        }),
      )
      .catch((erro) => {
        if (erro?.name === 'AbortError') return
        onChange({ cepStatus: erro.status === 404 ? 'nao-encontrado' : 'erro', codigoIbge: '', cidade: '', uf: '' })
      })
    return () => controle.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cepDigitos, valor.modo])

  const mudarCep = (e) => {
    const cep = maskCep(e.target.value)
    // CEP mudou: a cidade antiga não vale mais até a nova busca
    if (onlyDigits(cep) !== cepDigitos) {
      ultimoCep.current = null
      onChange({ cep, cepStatus: 'ocioso', codigoIbge: '', cidade: '', uf: '' })
    } else onChange({ cep })
  }

  const usarGps = () => {
    if (!('geolocation' in navigator)) {
      setGpsErro('Este aparelho não informa a localização.')
      return
    }
    setBuscandoGps(true)
    setGpsErro('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuscandoGps(false)
        onChange({ gps: { lat: pos.coords.latitude, lng: pos.coords.longitude } })
      },
      () => {
        setBuscandoGps(false)
        setGpsErro('Não conseguimos a localização. Verifique a permissão do navegador.')
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }

  const campo = (nome, extras = {}) => ({
    id: `${id}-${nome}`,
    value: valor[nome],
    error: erros[nome],
    onChange: (e) => onChange({ [nome]: e.target.value }),
    ...extras,
  })

  const modos = [
    { id: 'completo', label: 'Endereço completo' },
    { id: 'cidade', label: 'Só a cidade' },
    ...(permitirDepois ? [{ id: 'depois', label: 'Informar depois' }] : []),
  ]

  return (
    <div className="flex flex-col gap-4">
      <Segmented legend="Como você quer informar?" name={`${id}-modo`} value={valor.modo} onChange={(modo) => onChange({ modo })} options={modos} />

      {valor.modo === 'depois' && (
        <p className="flex items-start gap-2 rounded-xl border-l-4 border-high bg-high-soft p-3 text-base font-medium text-high-ink">
          <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          Sem endereço, o SafeZone só sabe onde você está quando a localização do aparelho estiver ligada. Com ele,
          você recebe avisos e abrigos perto de casa mesmo com o GPS desligado. Você pode cadastrar depois em
          Preferências.
        </p>
      )}

      {valor.modo === 'completo' && (
        <>
          <div className="flex flex-col gap-1.5">
            <FloatingField
              {...campo('cep')}
              label="CEP"
              inputMode="numeric"
              autoComplete="postal-code"
              onChange={mudarCep}
              hint="Digite o CEP: rua, bairro e cidade são preenchidos sozinhos."
            />
            <StatusCep valor={valor} atendidas={atendidas} />
          </div>
          <FloatingField {...campo('logradouro')} label="Rua" autoComplete="address-line1" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FloatingField {...campo('numero')} label="Número" autoComplete="off" />
            <FloatingField {...campo('complemento')} label="Complemento (opcional)" autoComplete="address-line2" />
          </div>
          <FloatingField {...campo('bairro')} label="Bairro" autoComplete="off" />
        </>
      )}

      {valor.modo === 'cidade' && (
        <SelectField
          id={`${id}-cidade`}
          label="Sua cidade"
          error={erros.codigoIbge}
          value={valor.codigoIbge}
          onChange={(e) => {
            const c = atendidas.find((a) => a.codigoIbge === e.target.value)
            onChange({ codigoIbge: e.target.value, cidade: c?.nome ?? '', uf: c?.uf ?? '' })
          }}
          options={[
            { value: '', label: atendidasReq.carregando ? 'Carregando cidades…' : 'Escolha a cidade' },
            ...atendidas.map((c) => ({ value: c.codigoIbge, label: nomeComUf(c) })),
          ]}
        />
      )}

      {valor.modo !== 'depois' && (
        <>
          <div className="flex flex-col gap-2 rounded-xl border-2 border-line p-3">
            {valor.gps ? (
              <p className="flex items-center justify-between gap-2 text-base font-bold text-safe-ink">
                <span className="flex items-center gap-2">
                  <CircleCheck className="size-5 shrink-0" aria-hidden="true" />
                  Localização do aparelho registrada para este endereço.
                </span>
                <button
                  type="button"
                  onClick={() => onChange({ gps: null })}
                  className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-bold text-ink underline underline-offset-4"
                >
                  <X className="size-4" aria-hidden="true" />
                  Remover
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={usarGps}
                disabled={buscandoGps}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-brand px-4 text-base font-bold text-ink hover:bg-brand-soft disabled:opacity-60"
              >
                <LocateFixed className="size-5" aria-hidden="true" />
                {buscandoGps ? 'Obtendo localização…' : 'Estou em casa: usar a localização do aparelho'}
              </button>
            )}
            <p className="text-sm text-ink2">Opcional. Deixa as distâncias até os abrigos mais precisas.</p>
            {gpsErro && <p role="alert" className="text-sm font-semibold text-crit-ink">{gpsErro}</p>}
          </div>

          <div>
            <label
              htmlFor={`${id}-consentimento`}
              className={cn(
                'flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border-2 p-4 text-base font-semibold',
                valor.consentimento ? 'border-brand bg-brand-soft' : 'border-line-strong',
                erros.consentimento && 'border-crit',
              )}
            >
              <input
                id={`${id}-consentimento`}
                type="checkbox"
                checked={valor.consentimento}
                onChange={(e) => onChange({ consentimento: e.target.checked })}
                aria-invalid={Boolean(erros.consentimento)}
                className="mt-0.5 size-6 shrink-0 accent-[var(--sz-brand)]"
              />
              <span>
                Autorizo o SafeZone a usar meu endereço para me avisar sobre riscos e indicar abrigos perto de casa.
                Posso apagar o endereço quando quiser, em Preferências.
              </span>
            </label>
            {erros.consentimento && (
              <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-crit-ink">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {erros.consentimento}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
