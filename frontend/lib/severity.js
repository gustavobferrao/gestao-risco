import { CircleAlert, HandHelping, Info, OctagonAlert, ShieldCheck, TriangleAlert } from 'lucide-react'

// Classes completas para o Tailwind detectar em build.
// Severidade = cor + ícone + rótulo em texto (nunca só cor).
export const severidades = {
  critico: {
    label: 'CRÍTICO',
    Icon: OctagonAlert,
    cor: 'var(--sz-crit)',
    barra: 'bg-crit',
    texto: 'text-crit',
    badge: 'bg-crit-soft text-crit-ink border-crit',
    suave: 'bg-crit-soft',
  },
  alto: {
    label: 'ALTO',
    Icon: TriangleAlert,
    cor: 'var(--sz-high)',
    barra: 'bg-high',
    texto: 'text-high',
    badge: 'bg-high-soft text-high-ink border-high',
    suave: 'bg-high-soft',
  },
  medio: {
    label: 'MÉDIO',
    Icon: CircleAlert,
    cor: 'var(--sz-mid)',
    barra: 'bg-mid',
    texto: 'text-mid',
    badge: 'bg-mid-soft text-mid-ink border-mid',
    suave: 'bg-mid-soft',
  },
  info: {
    label: 'INFORMATIVO',
    Icon: Info,
    cor: 'var(--sz-info)',
    barra: 'bg-info',
    texto: 'text-info',
    badge: 'bg-info-soft text-info-ink border-info',
    suave: 'bg-info-soft',
  },
  seguro: {
    label: 'SEGURO',
    Icon: ShieldCheck,
    cor: 'var(--sz-safe)',
    barra: 'bg-safe',
    texto: 'text-safe',
    badge: 'bg-safe-soft text-safe-ink border-safe',
    suave: 'bg-safe-soft',
  },
  ajuda: {
    label: 'AJUDA',
    Icon: HandHelping,
    cor: 'var(--sz-help)',
    barra: 'bg-help',
    texto: 'text-help',
    badge: 'bg-help-soft text-help-ink border-help',
    suave: 'bg-help-soft',
  },
}
