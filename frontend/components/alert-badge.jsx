import { cn } from '@/lib/utils'
import { severidades } from '@/lib/severity'

export function AlertBadge({ nivel, rotulo, className }) {
  const sev = severidades[nivel]
  if (!sev) return null
  const { Icon } = sev

  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center gap-1.5 rounded-md border-l-4 px-2.5 py-1 text-xs font-extrabold tracking-wider',
        sev.badge,
        className,
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {rotulo ?? sev.label}
    </span>
  )
}
