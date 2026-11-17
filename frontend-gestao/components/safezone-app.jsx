'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Overview } from '@/components/overview'
import { ChamadoTab, MapaTab, PrevisaoTab } from '@/components/simple-tabs'

export function SafeZoneApp() {
  const [aba, setAba] = useState('visao-geral')
  const [evacuacaoConfirmada, setEvacuacaoConfirmada] = useState(false)

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <Navbar abaAtiva={aba} onChange={setAba} />
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:pt-28">
        {aba === 'visao-geral' && (
          <Overview
            evacuacaoConfirmada={evacuacaoConfirmada}
            onConfirmar={() => setEvacuacaoConfirmada((v) => !v)}
            onVerRota={() => setAba('mapa')}
          />
        )}
        {aba === 'mapa' && <MapaTab />}
        {aba === 'previsao' && <PrevisaoTab />}
        {aba === 'chamado' && <ChamadoTab />}
      </main>
    </div>
  )
}
