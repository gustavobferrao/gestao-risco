'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { definirSessao } from '@/lib/api/client'
import { authService } from '@/lib/api/services'

// Sessão guardada no navegador para sobreviver ao recarregar a página.
// ATENÇÃO: sem token, isto é só conveniência, não segurança — a API ainda confia
// no X-Usuario-Id. A segurança de verdade vem com o JWT (etapa seguinte).
const CHAVE_STORAGE = 'safezone.usuario'

const AuthContext = createContext(null)

function iniciaisDe(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  const primeira = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? partes.at(-1)[0] : ''
  return (primeira + ultima).toUpperCase()
}

/** UsuarioResponse da API -> usuário da sessão */
function paraSessao(u) {
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    telefone: u.telefone,
    perfil: u.perfil, // 'CIDADAO' | 'AGENTE' (vem do banco, nunca da tela)
    orgaoId: u.orgaoId,
    orgaoNome: u.orgaoNome,
    iniciais: iniciaisDe(u.nome),
    agente: u.perfil === 'AGENTE',
  }
}

function lerStorage() {
  try {
    const bruto = localStorage.getItem(CHAVE_STORAGE)
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [pronto, setPronto] = useState(false) // evita piscar a tela de login ao recarregar

  const sair = useCallback(() => {
    definirSessao()
    localStorage.removeItem(CHAVE_STORAGE)
    setUsuario(null)
  }, [])

  // o cliente HTTP precisa do id ANTES de as telas logadas buscarem dados
  const iniciarSessao = useCallback(
    (dadosApi) => {
      const sessao = paraSessao(dadosApi)
      definirSessao({ usuarioId: sessao.id, aoPerderSessao: sair })
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(sessao))
      setUsuario(sessao)
      return sessao
    },
    [sair],
  )

  useEffect(() => {
    const salvo = lerStorage()
    if (salvo?.id) {
      definirSessao({ usuarioId: salvo.id, aoPerderSessao: sair })
      setUsuario(salvo)
    }
    setPronto(true)
  }, [sair])

  const entrar = useCallback(
    async ({ email, senha }) => iniciarSessao(await authService.login({ email, senha })),
    [iniciarSessao],
  )

  const valor = useMemo(
    () => ({ usuario, pronto, entrar, iniciarSessao, sair }),
    [usuario, pronto, entrar, iniciarSessao, sair],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return ctx
}
