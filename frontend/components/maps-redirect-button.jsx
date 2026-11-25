import { ExternalLink, Navigation } from 'lucide-react'
import { googleMapsRotaUrl } from '@/lib/maps'
import { cn } from '@/lib/utils'

const variantes = {
  primario: 'min-h-14 rounded-xl bg-brand px-5 text-lg font-extrabold text-brand-fg',
  contorno: 'min-h-11 rounded-xl border-2 border-line-strong bg-surface px-3 text-sm font-bold text-ink hover:bg-brand-soft',
  claro: 'min-h-16 rounded-2xl bg-white px-6 text-xl font-extrabold text-[#7F1D1D]',
}

export function MapsRedirectButton({
  coords,
  endereco,
  destinoNome,
  variante = 'contorno',
  Icon = Navigation,
  className,
  children = 'Como chegar',
  onClick,
  anchorRef,
}) {
  return (
    <a
      ref={anchorRef}
      href={googleMapsRotaUrl({ coords, endereco })}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label={destinoNome ? `${typeof children === 'string' ? children : 'Como chegar'} até ${destinoNome} (abre o Google Maps em nova aba)` : undefined}
      className={cn('inline-flex items-center justify-center gap-2', variantes[variante], className)}
    >
      <Icon className={variante === 'contorno' ? 'size-4' : 'size-5'} aria-hidden="true" />
      {children}
      <ExternalLink className="size-4 opacity-70" aria-hidden="true" />
    </a>
  )
}
