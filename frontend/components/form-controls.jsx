'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Switch({ checked, onChange, label, hint, id }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-base font-semibold text-ink">
          {label}
        </label>
        {hint && <p className="text-sm text-ink2">{hint}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-11 w-[76px] shrink-0 items-center rounded-full border-2 px-1 transition-colors',
          checked ? 'border-brand bg-brand text-brand-fg' : 'border-line-strong bg-surface text-ink2',
        )}
      >
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-full text-[10px] font-extrabold transition-transform',
            checked ? 'translate-x-[32px] bg-brand-fg text-brand' : 'translate-x-0 bg-line-strong text-surface',
          )}
        >
          {checked ? 'SIM' : 'NÃO'}
        </span>
        <span className="sr-only">{checked ? 'Ligado' : 'Desligado'}</span>
      </button>
    </div>
  )
}

export function Segmented({ legend, value, onChange, options, name }) {
  return (
    <fieldset>
      <legend className="mb-2 text-base font-semibold text-ink">{legend}</legend>
      <div role="radiogroup" aria-label={legend} className="flex flex-wrap gap-2">
        {options.map((op) => {
          const ativo = op.id === value
          return (
            <button
              key={op.id}
              type="button"
              role="radio"
              name={name}
              aria-checked={ativo}
              onClick={() => onChange(op.id)}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-xl border-2 px-4 text-base font-semibold transition-colors',
                ativo
                  ? 'border-brand bg-brand text-brand-fg'
                  : 'border-line-strong bg-surface text-ink hover:bg-brand-soft',
              )}
            >
              {ativo && <Check className="size-4" aria-hidden="true" />}
              {op.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function CheckCard({ checked, onChange, label, id }) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-base font-semibold transition-colors',
        checked ? 'border-brand bg-brand-soft text-ink' : 'border-line-strong bg-surface text-ink',
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-6 shrink-0 accent-[var(--sz-brand)]"
      />
      {label}
    </label>
  )
}

export function PillGroup({ legend, value, onChange, options }) {
  return (
    <div role="group" aria-label={legend} className="flex flex-wrap gap-2">
      {options.map((op) => {
        const ativo = op.id === value
        return (
          <button
            key={op.id}
            type="button"
            onClick={() => onChange(op.id)}
            aria-pressed={ativo}
            className={cn(
              'inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 text-sm font-bold transition-colors',
              ativo
                ? 'border-brand bg-brand text-brand-fg'
                : 'border-line-strong bg-surface text-ink hover:bg-brand-soft',
            )}
          >
            {ativo && <Check className="size-4" aria-hidden="true" />}
            {op.label}
          </button>
        )
      })}
    </div>
  )
}
