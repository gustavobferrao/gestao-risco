'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { Modal } from '@/components/agent/modal'
import { TextField } from '@/components/agent/fields'
import { Switch } from '@/components/form-controls'

export function ShelterFormModal({ abrigo, onSalvar, onFechar }) {
  const editando = Boolean(abrigo)
  const [nome, setNome] = useState(abrigo?.nome ?? '')
  const [endereco, setEndereco] = useState(abrigo?.endereco ?? '')
  const [capacidade, setCapacidade] = useState(abrigo ? String(abrigo.capacidade) : '')
  const [vagas, setVagas] = useState(abrigo ? String(abrigo.vagas) : '')
  const [telefone, setTelefone] = useState(abrigo?.telefone ?? '')
  const [aceitaPets, setAceitaPets] = useState(abrigo?.aceitaPets ?? false)
  const [capacidadePets, setCapacidadePets] = useState(abrigo?.aceitaPets ? String(abrigo.capacidadePets ?? '') : '')
  const [tentou, setTentou] = useState(false)

  const cap = Number(capacidade)
  const vag = Number(vagas)
  const capPets = Number(capacidadePets)

  const erros = {
    nome: nome.trim().length < 3 ? 'Informe o nome do abrigo.' : undefined,
    endereco: endereco.trim().length < 5 ? 'Informe o endereço do abrigo.' : undefined,
    capacidade: !Number.isInteger(cap) || cap < 1 ? 'Informe uma capacidade maior que zero.' : undefined,
    vagas:
      vagas === '' || !Number.isInteger(vag) || vag < 0
        ? 'Informe o número de vagas disponíveis.'
        : cap >= 1 && vag > cap
          ? 'As vagas não podem ser maiores que a capacidade.'
          : undefined,
    capacidadePets:
      aceitaPets && (capacidadePets === '' || !Number.isInteger(capPets) || capPets < 1)
        ? 'Informe quantos pets o abrigo comporta.'
        : undefined,
  }
  const temErro = Object.values(erros).some(Boolean)

  const enviar = (e) => {
    e.preventDefault()
    if (temErro) {
      setTentou(true)
      return
    }
    onSalvar({
      id: abrigo?.id ?? `sh-${Date.now()}`,
      nome: nome.trim(),
      endereco: endereco.trim(),
      capacidade: cap,
      vagas: vag,
      telefone: telefone.trim() || 'Não informado',
      coords: abrigo?.coords,
      aceitaPets,
      capacidadePets: aceitaPets ? capPets : 0,
      vagasPets: aceitaPets ? Math.min(abrigo?.aceitaPets ? (abrigo.vagasPets ?? capPets) : capPets, capPets) : 0,
    })
  }

  const mostrar = (campo) => (tentou ? erros[campo] : undefined)

  return (
    <Modal titulo={editando ? 'Editar abrigo' : 'Novo abrigo'} onFechar={onFechar}>
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <TextField id="abrigo-nome" label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} error={mostrar('nome')} />
        <TextField
          id="abrigo-endereco"
          label="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          error={mostrar('endereco')}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="abrigo-capacidade"
            label="Capacidade total"
            inputMode="numeric"
            value={capacidade}
            onChange={(e) => setCapacidade(e.target.value.replace(/\D/g, ''))}
            error={mostrar('capacidade')}
          />
          <TextField
            id="abrigo-vagas"
            label="Vagas disponíveis"
            inputMode="numeric"
            value={vagas}
            onChange={(e) => setVagas(e.target.value.replace(/\D/g, ''))}
            error={mostrar('vagas')}
          />
        </div>
        <div className="flex flex-col gap-3 rounded-xl border-2 border-line bg-bg p-3">
          <Switch
            id="abrigo-aceita-pets"
            label="Aceita pets"
            hint="Moradores com animais verão este abrigo no filtro."
            checked={aceitaPets}
            onChange={setAceitaPets}
          />
          {aceitaPets && (
            <TextField
              id="abrigo-capacidade-pets"
              label="Capacidade para pets"
              inputMode="numeric"
              value={capacidadePets}
              onChange={(e) => setCapacidadePets(e.target.value.replace(/\D/g, ''))}
              error={mostrar('capacidadePets')}
            />
          )}
        </div>
        <TextField
          id="abrigo-telefone"
          label="Telefone"
          type="tel"
          inputMode="tel"
          placeholder="(11) 3333-0000"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onFechar}
            className="min-h-12 rounded-xl border-2 border-line-strong px-5 text-base font-bold hover:bg-brand-soft"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-base font-extrabold text-brand-fg"
          >
            <Save className="size-5" aria-hidden="true" />
            {editando ? 'Salvar alterações' : 'Cadastrar abrigo'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
