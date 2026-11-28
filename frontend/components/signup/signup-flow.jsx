'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, Check, CircleAlert, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ENDERECO_INICIAL, validarEndereco } from '@/components/endereco/campos-endereco'
import { StepAccount } from '@/components/signup/step-account'
import { StepLocation } from '@/components/signup/step-location'
import { StepReview } from '@/components/signup/step-review'
import { authService } from '@/lib/api/services'
import { useAuth } from '@/lib/auth-context'
import { cpfValido, emailValido, telefoneValido } from '@/lib/masks'

// Cadastro público: sempre cria MORADOR (a API define o perfil).
// Agentes são cadastrados por outro agente, dentro do painel.
const dadosIniciais = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  senha: '',
  confirma: '',
  aceite: false,
  endereco: ENDERECO_INICIAL,
}

const PASSO_CONTA = 1
const PASSO_ENDERECO = 2
const PASSO_REVISAO = 3
const CAMPOS_CONTA = new Set(['nome', 'cpf', 'telefone', 'email', 'senha'])
// mensagens 422 do backend que são sobre o endereço (cidade não atendida, rua, CEP...)
const ERRO_DE_ENDERECO = /atendida|cep|rua|cidade|endereço/i

function validar(passo, d) {
  const e = {}
  if (passo === PASSO_CONTA) {
    if (d.nome.trim().split(/\s+/).filter(Boolean).length < 2) e.nome = 'Digite nome e sobrenome.'
    if (!cpfValido(d.cpf)) e.cpf = 'CPF inválido. Confira os 11 números.'
    if (!telefoneValido(d.telefone)) e.telefone = 'Telefone inválido. Use DDD e número.'
    if (!emailValido(d.email)) e.email = 'E-mail inválido. Exemplo: nome@email.com'
    if (d.senha.length < 8) e.senha = 'A senha precisa ter pelo menos 8 caracteres.'
    if (d.confirma !== d.senha || !d.confirma) e.confirma = 'As senhas não são iguais.'
  }
  if (passo === PASSO_ENDERECO) {
    const erros = validarEndereco(d.endereco)
    if (Object.keys(erros).length > 0) e.endereco = erros
  }
  if (passo === PASSO_REVISAO && !d.aceite) e.aceite = 'Aceite os termos para criar a conta.'
  return e
}

/**
 * Traduz o erro da API para erros por campo (400 do @Valid ou 422 de regra).
 * Erros do endereço chegam como "endereco.cep" (400) ou como mensagem de regra (422).
 */
function errosDaApi(erro) {
  if (erro.campos) {
    const conta = Object.fromEntries(Object.entries(erro.campos).filter(([c]) => CAMPOS_CONTA.has(c)))
    const endereco = Object.fromEntries(
      Object.entries(erro.campos)
        .filter(([c]) => c.startsWith('endereco.'))
        .map(([c, msg]) => [c.slice('endereco.'.length), msg]),
    )
    return Object.keys(endereco).length > 0 ? { ...conta, endereco } : conta
  }
  if (erro.status === 422 && /e-mail/i.test(erro.message)) return { email: erro.message }
  if (erro.status === 422 && /cpf/i.test(erro.message)) return { cpf: erro.message }
  if ((erro.status === 422 || erro.status === 503) && ERRO_DE_ENDERECO.test(erro.message))
    return { endereco: { geral: erro.message } }
  return {}
}

function Progresso({ passo }) {
  const etapas = ['Conta', 'Endereço', 'Revisão']
  return (
    <div className="mb-6">
      <p className="mb-2 text-sm font-bold text-ink2">{`Passo ${passo} de ${etapas.length}`}</p>
      <ol className="flex items-center gap-2" aria-label="Progresso do cadastro">
        {etapas.map((nome, i) => {
          const n = i + 1
          const feito = n < passo
          const ativo = n === passo
          return (
            <li key={nome} className="flex flex-1 items-center gap-2" aria-current={ativo ? 'step' : undefined}>
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-extrabold',
                  feito && 'border-safe bg-safe text-white',
                  ativo && 'border-brand bg-brand text-brand-fg ring-4 ring-brand-soft',
                  !feito && !ativo && 'border-line-strong text-ink2',
                )}
              >
                {feito ? <Check className="size-5" aria-hidden="true" /> : n}
              </span>
              <span className="hidden text-sm font-bold sm:inline">{nome}</span>
              {i < etapas.length - 1 && <span className="h-0.5 flex-1 bg-line-strong" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function SignupFlow({ onVoltarLogin }) {
  const { iniciarSessao } = useAuth()
  const [passo, setPasso] = useState(PASSO_CONTA)
  const [dados, setDados] = useState(dadosIniciais)
  const [tocados, setTocados] = useState({})
  const [tentou, setTentou] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errosServidor, setErrosServidor] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [criado, setCriado] = useState(null) // UsuarioResponse da API
  const topo = useRef(null)

  const erros = { ...validar(passo, dados), ...errosServidor }
  const set = (campo, valor) => setDados((d) => ({ ...d, [campo]: valor }))
  const tocar = (campo) => setTocados((t) => ({ ...t, [campo]: true }))
  const mostrar = (campo) => (tentou || tocados[campo] || errosServidor[campo] ? erros[campo] : undefined)

  const form = {
    dados,
    set,
    tocar,
    erroAceite: tentou ? erros.aceite : undefined,
    errosEndereco: tentou || errosServidor.endereco ? (erros.endereco ?? {}) : {},
    setEndereco: (patch) => {
      setDados((d) => ({ ...d, endereco: { ...d.endereco, ...patch } }))
      setErrosServidor(({ endereco: _, ...resto }) => resto)
    },
    props: (campo, mascara) => ({
      value: dados[campo],
      error: mostrar(campo),
      onChange: (e) => {
        const valor = mascara ? mascara(e.target.value) : e.target.value
        setDados((d) => ({ ...d, [campo]: valor }))
        // o usuário corrigiu o campo: some o erro que veio da API
        setErrosServidor(({ [campo]: _, ...resto }) => resto)
      },
      onBlur: () => tocar(campo),
    }),
  }

  const irPara = (novo) => {
    setPasso(novo)
    setTentou(false)
    topo.current?.scrollIntoView({ block: 'start' })
  }

  const criarConta = async () => {
    setEnviando(true)
    setErroGeral('')
    try {
      const { endereco, ...conta } = dados
      setCriado(await authService.cadastrar({ ...conta, endereco: endereco.modo === 'depois' ? null : endereco }))
    } catch (erro) {
      const porCampo = errosDaApi(erro)
      if (Object.keys(porCampo).length > 0) {
        setErrosServidor(porCampo)
        // volta para o passo que tem o campo com erro
        irPara(Object.keys(porCampo).some((c) => CAMPOS_CONTA.has(c)) ? PASSO_CONTA : PASSO_ENDERECO)
      } else {
        setErroGeral(erro.message ?? 'Não foi possível criar a conta. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  const avancar = () => {
    if (Object.keys(erros).length > 0) {
      setTentou(true)
      return
    }
    if (passo === PASSO_REVISAO) {
      void criarConta() // erros já são tratados dentro de criarConta
      return
    }
    irPara(passo + 1)
  }

  let rotuloBotao = 'Continuar'
  if (passo === PASSO_REVISAO) rotuloBotao = enviando ? 'Criando conta...' : 'Criar minha conta'

  if (criado) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border-2 border-safe bg-safe-soft p-8 text-center text-ink">
        <ShieldCheck className="size-14 text-safe-ink" aria-hidden="true" />
        <h1 className="text-3xl font-extrabold">Conta criada</h1>
        <p className="text-lg">{`Tudo pronto, ${criado.nome.split(' ')[0]}. Você receberá alertas da sua região.`}</p>
        <button
          type="button"
          onClick={() => iniciarSessao(criado)}
          className="min-h-14 rounded-xl bg-brand px-8 text-lg font-extrabold text-brand-fg"
        >
          Ir para o painel
        </button>
      </div>
    )
  }

  return (
    <div ref={topo} className="mx-auto max-w-xl scroll-mt-20">
      <h1 className="mb-4 text-3xl font-extrabold">Criar conta</h1>
      <Progresso passo={passo} />

      <div className="rounded-2xl border-2 border-line bg-surface p-4 text-ink sm:p-6">
        {passo === PASSO_CONTA && <StepAccount form={form} />}
        {passo === PASSO_ENDERECO && <StepLocation form={form} />}
        {passo === PASSO_REVISAO && <StepReview form={form} onEditar={irPara} />}

        {erroGeral && (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border-l-4 border-crit bg-crit-soft p-3 text-base font-bold text-crit-ink">
            <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            {erroGeral}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          {passo > PASSO_CONTA && (
            <button
              type="button"
              onClick={() => irPara(passo - 1)}
              disabled={enviando}
              className="flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 border-line-strong px-6 text-lg font-bold disabled:opacity-60 sm:flex-none"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
              Voltar
            </button>
          )}
          <button
            type="button"
            onClick={avancar}
            disabled={enviando}
            className="min-h-14 flex-1 rounded-xl bg-brand px-6 text-lg font-extrabold text-brand-fg disabled:opacity-60"
          >
            {rotuloBotao}
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-base text-ink2">
        Já tem conta?{' '}
        <button type="button" onClick={onVoltarLogin} className="font-bold text-ink underline underline-offset-4">
          Entrar
        </button>
      </p>
    </div>
  )
}
