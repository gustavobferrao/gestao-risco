import { ChevronRight, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'
import { severidades } from '@/lib/severity'

export function MetricCard({ rotulo, valor, legenda, Icon, tom, onClick, href, acao, destaque }) {
  const sev = severidades[tom]
  const Raiz = href ? 'a' : onClick ? 'button' : 'div'
  const linkProps = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <Raiz
      type={onClick && !href ? 'button' : undefined}
      {...linkProps}
      onClick={onClick}
      className={cn(
        'flex min-h-28 items-center gap-4 rounded-2xl border-2 bg-surface p-4 text-left text-ink',
        destaque ? cn('border-2', sev.badge.split(' ').find((c) => c.startsWith('border-'))) : 'border-line',
        (onClick || href) && 'transition-colors hover:border-line-strong',
      )}
    >
      <span className={cn('flex size-14 shrink-0 items-center justify-center rounded-xl border-l-4', sev.badge)}>
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold uppercase tracking-wide text-ink2">{rotulo}</span>
        <span className="block text-3xl font-extrabold leading-tight">{valor}</span>
        <span className="block text-base font-medium text-ink2">{legenda}</span>
        {href && (
          <span className="mt-1 inline-flex items-center gap-1 text-sm font-extrabold text-ink underline underline-offset-4">
            <Navigation className="size-4" aria-hidden="true" />
            Como chegar
          </span>
        )}
      </span>
      {(onClick || href) && (
        <span className="flex shrink-0 items-center text-sm font-bold text-ink2">
          <span className="sr-only">{acao}</span>
          <ChevronRight className="size-6" aria-hidden="true" />
        </span>
      )}
    </Raiz>
  )
}
