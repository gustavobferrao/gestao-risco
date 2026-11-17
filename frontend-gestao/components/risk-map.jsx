'use client'

import { useState } from 'react'
import { Home, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { abrigos, areasRisco, filtrosMapa, posicaoUsuario, severidades } from '@/lib/mock-data'

const MAP_W = 800
const MAP_H = 500

const pct = (valor, total) => `${(valor / total) * 100}%`

function MapBackground() {
  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="absolute inset-0 size-full"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <rect width={MAP_W} height={MAP_H} fill="#EEF1F4" />
      {/* quarteirões */}
      <g fill="#E4E8ED">
        {Array.from({ length: 9 }).map((_, col) =>
          Array.from({ length: 6 }).map((_, row) => (
            <rect key={`${col}-${row}`} x={30 + col * 88} y={24 + row * 74} width={64} height={52} rx={6} />
          )),
        )}
      </g>
      {/* rio / marginal */}
      <path d="M0 440 C 150 410, 260 470, 400 440 S 650 400, 800 430 L800 500 L0 500 Z" fill="#D5E4EC" />
      {/* avenidas */}
      <g stroke="#FFFFFF" strokeLinecap="round" fill="none">
        <path d="M0 300 L800 270" strokeWidth="12" />
        <path d="M455 0 L470 500" strokeWidth="12" />
        <path d="M0 60 L340 500" strokeWidth="8" />
        <path d="M800 60 L560 500" strokeWidth="8" />
        <path d="M0 175 L800 150" strokeWidth="6" />
        <path d="M250 0 L270 500" strokeWidth="6" />
        <path d="M660 0 L690 500" strokeWidth="6" />
      </g>
      <g stroke="#D3D9E0" strokeLinecap="round" fill="none" strokeWidth="1.5">
        <path d="M0 300 L800 270" strokeDasharray="2 10" />
        <path d="M455 0 L470 500" strokeDasharray="2 10" />
      </g>
    </svg>
  )
}

export function RiskMap() {
  const [filtro, setFiltro] = useState('todas')

  const zonasVisiveis = areasRisco.filter((zona) => filtro === 'todas' || filtro === zona.tipo)
  const mostrarAbrigos = filtro === 'todas' || filtro === 'abrigos'

  return (
    <section aria-labelledby="titulo-mapa" className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="titulo-mapa" className="text-lg font-bold text-slate-900">
            Mapa de riscos em tempo real
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">Zonas de perigo e pontos de apoio ativos</p>
        </div>

        <div role="group" aria-label="Filtrar mapa" className="flex flex-wrap gap-2">
          {filtrosMapa.map((item) => {
            const ativo = filtro === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFiltro(item.id)}
                aria-pressed={ativo}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors',
                  ativo ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </header>

      <div className="relative mt-5 aspect-[8/5] w-full overflow-hidden rounded-2xl ring-1 ring-slate-200">
        <MapBackground />

        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="absolute inset-0 size-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {zonasVisiveis.map((zona) => {
            const sev = severidades[zona.nivel]
            return (
              <polygon
                key={zona.id}
                points={zona.pontos}
                fill={sev.fill}
                stroke={sev.stroke}
                strokeWidth="3"
                strokeDasharray="10 7"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>

        {zonasVisiveis.map((zona) => {
          const sev = severidades[zona.nivel]
          return (
            <div
              key={zona.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-900 shadow-md sm:gap-1.5 sm:px-2.5 sm:text-xs"
              style={{ left: pct(zona.rotulo.x, MAP_W), top: pct(zona.rotulo.y, MAP_H) }}
            >
              <MapPin className={cn('size-3 sm:size-3.5', sev.text)} aria-hidden="true" />
              <span className="whitespace-nowrap">{zona.nome}</span>
              <span className="sr-only">, risco {sev.label.toLowerCase()}</span>
            </div>
          )
        })}

        {mostrarAbrigos &&
          abrigos.map((abrigo) => (
            <div
              key={abrigo.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: pct(abrigo.posicao.x, MAP_W), top: pct(abrigo.posicao.y, MAP_H) }}
            >
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white sm:size-9',
                  abrigo.recomendado && 'ring-4 ring-emerald-300/70',
                )}
                title={`${abrigo.nome} · ${abrigo.vagas_disponiveis} vagas`}
              >
                <Home className="size-3.5 sm:size-4" aria-hidden="true" />
                <span className="sr-only">Abrigo {abrigo.nome}</span>
              </span>
            </div>
          ))}

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: pct(posicaoUsuario.x, MAP_W), top: pct(posicaoUsuario.y, MAP_H) }}
        >
          <span className="relative flex size-4 items-center justify-center">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-500 opacity-50" />
            <span className="relative inline-flex size-4 rounded-full bg-blue-600 ring-[3px] ring-white" />
            <span className="sr-only">Sua localização</span>
          </span>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-rose-600" /> Crítico
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-500" /> Alto
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-yellow-400" /> Médio
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-500" /> Abrigo
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-blue-600" /> Você
        </li>
      </ul>
    </section>
  )
}
