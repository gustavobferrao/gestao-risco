import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FloatingField({ id, label, error, hint, rightSlot, className, ...rest }) {
  const erroId = `${id}-erro`
  const dicaId = `${id}-dica`

  return (
    <div className={className}>
      <div className="relative">
        <input
          id={id}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={error ? erroId : hint ? dicaId : undefined}
          className={cn(
            'peer h-14 w-full rounded-xl border-2 bg-surface px-4 pb-1 pt-5 text-base text-ink',
            error ? 'border-crit' : 'border-line-strong focus:border-brand',
            rightSlot && 'pr-14',
          )}
          {...rest}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-ink2 transition-all peer-focus:top-3.5 peer-focus:text-xs peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold"
        >
          {label}
        </label>
        {rightSlot && <div className="absolute right-1 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {error ? (
        <p id={erroId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-crit-ink">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={dicaId} className="mt-1.5 text-sm text-ink2">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
