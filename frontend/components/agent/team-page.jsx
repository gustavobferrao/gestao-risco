'use client'

import { useState } from 'react'
import { Building2, CircleAlert, CircleCheck, UserPlus } from 'lucide-react'
import { TextField } from '@/components/agent/fields'
import { agentesService } from '@/lib/api/services'
import { useAuth } from '@/lib/auth-context'
import { cpfValido, emailValido, maskCpf, maskTelefone, telefoneValido } from '@/lib/masks'

const vazio = { nome: '', cpf: '', telefone: '', email: '', senha: '', confirma: '' }
const CAMPOS_API = new Set(['nome', 'cpf', 'telefone', 'email', 'senha'])

function validar(d) {
  const e = {}
  if (d.nome.trim().split(/\s+/).filter(Boolean).length < 2) e.nome = 'Digite nome e sobrenome.'
  if (!cpfValido(d.cpf)) e.cpf = 'CPF inválido. Confira os 11 números.'
  if (!telefoneValido(d.telefone)) e.telefone = 'Telefone inválido. Use DDD e número.'
  if (!emailValido(d.email)) e.email = 'E-mail inválido. Exemplo: nome@orgao.gov.br'
  if (d.senha.length < 8) e.senha = 'A senha precisa ter pelo menos 8 caracteres.'
  if (d.confirma !== d.senha || !d.confirma) e.confirma = 'As senhas não são iguais.'
  return e
}

/** Erro da API -> erros por campo (400 do @Valid ou 422 de e-mail/CPF duplicado). */
function errosDaApi(erro) {
  if (erro.campos) return Object.fromEntries(Object.entries(erro.campos).filter(([c]) => CAMPOS_API.has(c)))
  if (erro.status === 422 && /e-mail/i.test(erro.message)) return { email: erro.message }
  if (erro.status === 422 && /cpf/i.test(erro.message)) return { cpf: erro.message }
  return {}
}

export function TeamPage() {
  const { usuario } = useAuth()
  const [dados, setDados] = useState(vazio)
  const [tentou, setTentou] = useState(false)
  const [errosServidor, setErrosServidor] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [cadastrados, setCadastrados] = useState([]) // agentes criados nesta visita

  const erros = { ...validar(dados), ...errosServidor }
  const campo = (nome, mascara) => ({
    id: `agente-${nome}`,
    value: dados[nome],
    error: tentou || errosServidor[nome] ? erros[nome] : undefined,
    onChange: (e) => {
      const valor = mascara ? mascara(e.target.value) : e.target.value
      setDados((d) => ({ ...d, [nome]: valor }))
      setErrosServidor(({ [nome]: _, ...resto }) => resto)
    },
  })

  const enviar = async (e) => {
    e.preventDefault()
    setErroGeral('')
    if (Object.keys(validar(dados)).length > 0) {
      setTentou(true)
      return
    }
    setEnviando(true)
    try {
      const novo = await agentesService.cadastrar(dados)
      setCadastrados((lista) => [novo, ...lista])
      setDados(vazio)
      setTentou(false)
    } catch (erro) {
      const porCampo = errosDaApi(erro)
      if (Object.keys(porCampo).length > 0) setErrosServidor(porCampo)
      else setErroGeral(erro.message ?? 'Não foi possível cadastrar o agente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-extrabold">Equipe</h1>
        <p className="text-base text-ink2">Cadastre novos agentes. Eles terão acesso ao painel e poderão emitir alertas.</p>
      </div>

      <p className="flex items-start gap-2 rounded-xl border-l-4 border-info bg-info-soft p-3 text-base font-semibold text-info-ink">
        <Building2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        O novo agente entra no seu órgão: {usuario.orgaoNome}.
      </p>

      {cadastrados.length > 0 && (
        <ul role="status" className="flex flex-col gap-2">
          {cadastrados.map((a) => (
            <li key={a.id} className="flex items-start gap-2 rounded-xl border-2 border-safe bg-safe-soft p-3 text-base font-semibold text-safe-ink">
              <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              {a.nome} ({a.email}) cadastrado como agente. Passe a senha para a pessoa por um canal seguro.
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={enviar} noValidate className="flex flex-col gap-4 rounded-2xl border-2 border-line bg-surface p-4 sm:p-6">
        <h2 className="text-2xl font-extrabold">Novo agente</h2>
        <TextField label="Nome completo" autoComplete="off" {...campo('nome')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="CPF" inputMode="numeric" autoComplete="off" {...campo('cpf', maskCpf)} />
          <TextField label="Telefone" type="tel" inputMode="tel" autoComplete="off" {...campo('telefone', maskTelefone)} />
        </div>
        <TextField label="E-mail" type="email" autoComplete="off" {...campo('email')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Senha inicial" type="password" autoComplete="new-password" {...campo('senha')} />
          <TextField label="Confirmar senha" type="password" autoComplete="new-password" {...campo('confirma')} />
        </div>

        {erroGeral && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border-l-4 border-crit bg-crit-soft p-3 text-base font-bold text-crit-ink">
            <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            {erroGeral}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-brand px-5 text-base font-extrabold text-brand-fg disabled:opacity-60"
        >
          <UserPlus className="size-5" aria-hidden="true" />
          {enviando ? 'Cadastrando…' : 'Cadastrar agente'}
        </button>
      </form>
    </div>
  )
}
