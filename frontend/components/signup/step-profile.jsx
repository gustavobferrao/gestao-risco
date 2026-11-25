import { Check, House, ShieldHalf } from 'lucide-react'
import { cn } from '@/lib/utils'

const perfis = [
  {
    id: 'morador',
    titulo: 'Sou morador',
    descricao: 'Quero receber alertas e pedir ajuda perto de onde moro.',
    Icon: House,
  },
  {
    id: 'agente',
    titulo: 'Sou agente da Defesa Civil',
    descricao: 'Represento um órgão e acompanho ocorrências na região.',
    Icon: ShieldHalf,
  },
]

export function StepProfile({ valor, onChange }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold">Como você vai usar o SafeZone?</h2>
      <p className="mt-1 text-base text-ink2">Escolha uma opção para continuar.</p>
      <div role="radiogroup" aria-label="Tipo de perfil" className="mt-5 grid gap-4 sm:grid-cols-2">
        {perfis.map(({ id, titulo, descricao, Icon }) => {
          const ativo = valor === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={ativo}
              onClick={() => onChange(id)}
              className={cn(
                'relative flex min-h-48 flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-colors',
                ativo ? 'border-brand bg-brand-soft' : 'border-line-strong bg-surface hover:bg-brand-soft',
              )}
            >
              <Icon className="size-10 text-brand" aria-hidden="true" />
              <span className="text-xl font-extrabold">{titulo}</span>
              <span className="text-base text-ink2">{descricao}</span>
              {ativo && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-md bg-brand px-2 py-1 text-xs font-extrabold text-brand-fg">
                  <Check className="size-4" aria-hidden="true" />
                  SELECIONADO
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
