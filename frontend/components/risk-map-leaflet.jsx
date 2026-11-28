'use client'

// Mapa real (Leaflet + OpenStreetMap). Só roda no navegador: é carregado por
// risk-map.jsx com next/dynamic e { ssr: false }, porque o Leaflet usa `window`.

import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { googleMapsRotaUrl } from '@/lib/maps'
import { CENTRO_INICIAL_MAPA } from '@/lib/use-localizacao'

const TILES_URL = process.env.NEXT_PUBLIC_MAP_TILES_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATRIBUICAO = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

// Ao abrir, enquadra o usuário e o que está a até esta distância dele.
// Áreas mais longe continuam no mapa: é só afastar o zoom.
const RAIO_ENQUADRAMENTO_KM = 60

// cor do tema por nível (mesma lógica de lib/severity.js)
const VARIAVEL_POR_NIVEL = { critico: '--sz-crit', alto: '--sz-high', medio: '--sz-mid', info: '--sz-info' }
const ROTULO_NIVEL = { alto: 'alto', medio: 'médio', info: 'baixo' }

/** SVG não entende var(--x): lê o valor real das variáveis CSS do tema. */
function lerCores() {
  const css = getComputedStyle(document.documentElement)
  const v = (nome) => css.getPropertyValue(nome).trim()
  return {
    nivel: Object.fromEntries(Object.entries(VARIAVEL_POR_NIVEL).map(([n, variavel]) => [n, v(variavel)])),
    semAlerta: v('--sz-ink2'),
    abrigo: v('--sz-safe'),
    voce: v('--sz-info'),
    borda: v('--sz-surface'),
  }
}

/** Relê as cores quando o alto contraste liga/desliga (classe "hc" no <html>). */
function useCoresTema() {
  const [cores, setCores] = useState(lerCores)
  useEffect(() => {
    const observador = new MutationObserver(() => setCores(lerCores()))
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observador.disconnect()
  }, [])
  return cores
}

function distanciaKm(a, b) {
  const rad = (g) => (g * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

const paraLatLng = (c) => [c.lat, c.lng]

/**
 * Ajusta o zoom para mostrar o que importa. Roda quando a posição ou os dados chegam,
 * não quando o usuário filtra (para o mapa não "pular").
 */
function Enquadrar({ posicao, pontos }) {
  const mapa = useMap()
  const chave = `${posicao?.lat},${posicao?.lng}|${pontos.length}`

  useEffect(() => {
    const perto = posicao ? pontos.filter((p) => distanciaKm(p, posicao) <= RAIO_ENQUADRAMENTO_KM) : pontos
    const alvo = [...(posicao ? [posicao] : []), ...perto]
    if (alvo.length === 0) return
    if (alvo.length === 1) {
      mapa.setView(paraLatLng(alvo[0]), 13)
      return
    }
    mapa.fitBounds(alvo.map(paraLatLng), { padding: [32, 32], maxZoom: 14 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapa, chave])

  return null
}

/**
 * @param zonas               áreas já filtradas (o que aparece)
 * @param abrigos             abrigos já filtrados (o que aparece)
 * @param pontosEnquadramento todos os pontos, sem filtro (só para o zoom inicial)
 */
export default function RiskMapLeaflet({ zonas, abrigos, posicao, pontosEnquadramento, onVerArea }) {
  const cores = useCoresTema()
  const centroInicial = posicao ?? CENTRO_INICIAL_MAPA

  return (
    <MapContainer
      center={paraLatLng(centroInicial)}
      zoom={11}
      scrollWheelZoom={false} // não "prende" a rolagem da página; zoom pelos botões ou pinça
      className="size-full"
    >
      <TileLayer url={TILES_URL} attribution={ATRIBUICAO} />
      <Enquadrar posicao={posicao} pontos={pontosEnquadramento} />

      {zonas
        .filter((z) => z.coords)
        .map((z) => {
          const resolvido = z.status === 'resolvido'
          const cor = resolvido ? cores.semAlerta : cores.nivel[z.nivel]
          return (
            <CircleMarker
              key={`zona-${z.id}`}
              center={paraLatLng(z.coords)}
              radius={16}
              pathOptions={{
                color: cor,
                fillColor: cor,
                fillOpacity: resolvido ? 0.15 : 0.35,
                weight: 3,
                dashArray: resolvido ? '4 6' : undefined,
              }}
            >
              <Tooltip direction="top" offset={[0, -14]}>
                {z.nome}
              </Tooltip>
              <Popup>
                <strong>{z.nome}</strong>
                <br />
                {z.localidade} · {z.zona === 'RURAL' ? 'Rural' : 'Urbana'}
                <br />
                Risco {ROTULO_NIVEL[z.nivel] ?? z.nivel}
                {' · '}
                {z.alertasAtivos > 0 ? `${z.alertasAtivos} alerta(s) ativo(s)` : 'sem alerta ativo'}
                {onVerArea && (
                  <>
                    <br />
                    <button type="button" className="leaflet-popup-acao" onClick={() => onVerArea(z)}>
                      Ver detalhes da área
                    </button>
                  </>
                )}
              </Popup>
            </CircleMarker>
          )
        })}

      {abrigos
        .filter((a) => a.coords)
        .map((a) => (
          <CircleMarker
            key={`abrigo-${a.id}`}
            center={paraLatLng(a.coords)}
            radius={a.recomendado ? 11 : 8}
            pathOptions={{ color: cores.borda, fillColor: cores.abrigo, fillOpacity: 1, weight: 3 }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              {a.recomendado ? `Abrigo recomendado: ${a.nome}` : `Abrigo: ${a.nome}`}
            </Tooltip>
            <Popup>
              <strong>{a.nome}</strong>
              {a.recomendado && ' (recomendado)'}
              <br />
              {a.endereco}
              <br />
              {a.vagas_disponiveis > 0 ? `${a.vagas_disponiveis} vagas` : 'Lotado'} ·{' '}
              {a.distanciaKm.toString().replace('.', ',')} km
              <br />
              <a href={googleMapsRotaUrl(a)} target="_blank" rel="noopener noreferrer">
                Como chegar (Google Maps)
              </a>
            </Popup>
          </CircleMarker>
        ))}

      {posicao && (
        <CircleMarker
          center={paraLatLng(posicao)}
          radius={8}
          pathOptions={{ color: cores.borda, fillColor: cores.voce, fillOpacity: 1, weight: 3 }}
        >
          <Tooltip direction="top" offset={[0, -8]} permanent>
            Você
          </Tooltip>
        </CircleMarker>
      )}
    </MapContainer>
  )
}
