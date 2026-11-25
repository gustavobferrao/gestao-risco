import { ChevronDown, CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

const base =
  'w-full rounded-xl border-2 bg-surface px-4 text-base text-ink focus:border-brand'

function Rotulo({ id, children }) {
  return (
    <label htmlFor={id} className="mb-1.5 block text-base font-semibold text-ink">
      {children}
    </label>
  )
}

function Erro({ id, children }) {
  if (!children) return null
  return (
    <p id={`${id}-erro`} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-crit-ink">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  )
}

export function TextField({ id, label, error, className, ...rest }) {
  return (
    <div className={className}>
      <Rotulo id={id}>{label}</Rotulo>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-erro` : undefined}
        className={cn(base, 'h-14', error ? 'border-crit' : 'border-line-strong')}
        {...rest}
      />
      <Erro id={id}>{error}</Erro>
    </div>
  )
}

export function SelectField({ id, label, error, options, className, ...rest }) {
  return (
    <div className={className}>
      <Rotulo id={id}>{label}</Rotulo>
      <div className="relative">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-erro` : undefined}
          className={cn(base, 'h-14 appearance-none pr-12', error ? 'border-crit' : 'border-line-strong')}
          {...rest}
        >
          {options.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-ink2"
          aria-hidden="true"
        />
      </div>
      <Erro id={id}>{error}</Erro>
    </div>
  )
}

export function TextAreaField({ id, label, error, hint, className, ...rest }) {
  return (
    <div className={className}>
      <Rotulo id={id}>{label}</Rotulo>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-erro` : undefined}
        className={cn(base, 'min-h-28 resize-y py-3', error ? 'border-crit' : 'border-line-strong')}
        {...rest}
      />
      {hint && !error && <p className="mt-1.5 text-sm text-ink2">{hint}</p>}
      <Erro id={id}>{error}</Erro>
    </div>
  )
}
