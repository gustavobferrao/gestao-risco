import { CircleAlert, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

function Bloco({ titulo, passo, onEditar, linhas }) {
  return (
    <section className="rounded-2xl border-2 border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold">{titulo}</h3>
        <button
          type="button"
          onClick={() => onEditar(passo)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-base font-bold text-ink underline underline-offset-4 hover:bg-brand-soft"
        >
          <Pencil className="size-4" aria-hidden="true" />
          Editar<span className="sr-only"> {titulo}</span>
        </button>
      </div>
      <dl className="mt-2 flex flex-col gap-2">
        {linhas.map(([rotulo, valor]) => (
          <div key={rotulo}>
            <dt className="text-xs font-bold uppercase tracking-wide text-ink2">{rotulo}</dt>
            <dd className="text-base font-semibold">{valor || '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function StepReview({ form, onEditar }) {
  const d = form.dados
  const erro = form.erroAceite

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-extrabold">Revise e confirme</h2>
        <p className="mt-1 text-base text-ink2">Confira seus dados antes de criar a conta.</p>
      </div>

      <Bloco
        titulo="Conta"
        passo={1}
        onEditar={onEditar}
        linhas={[
          ['Nome', d.nome],
          ['CPF', d.cpf],
          ['Telefone', d.telefone],
          ['E-mail', d.email],
          ['Senha', '••••••••'],
        ]}
      />
      <div>
        <label
          htmlFor="aceite"
          className={cn(
            'flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border-2 p-4 text-base font-semibold',
            d.aceite ? 'border-brand bg-brand-soft' : 'border-line-strong',
            erro && 'border-crit',
          )}
        >
          <input
            id="aceite"
            type="checkbox"
            checked={d.aceite}
            onChange={(e) => form.set('aceite', e.target.checked)}
            aria-invalid={Boolean(erro)}
            className="mt-0.5 size-6 shrink-0 accent-[var(--sz-brand)]"
          />
          <span>
            Li e aceito os{' '}
            <a href="#termos" className="font-bold underline underline-offset-2">
              Termos de uso
            </a>{' '}
            e a{' '}
            <a href="#privacidade" className="font-bold underline underline-offset-2">
              Política de privacidade
            </a>
            .
          </span>
        </label>
        {erro && (
          <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-crit-ink">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {erro}
          </p>
        )}
      </div>
    </div>
  )
}
