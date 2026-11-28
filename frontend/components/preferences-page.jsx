'use client'

import { CheckCard, Segmented, Switch } from '@/components/form-controls'
import { usePrefs } from '@/lib/prefs-context'
import { categoriasRisco } from '@/lib/mock-data'
import { formatarDistancia } from '@/lib/format'
import { idiomas } from '@/lib/i18n'
import { MeuEndereco } from '@/components/endereco/meu-endereco'

function Secao({ id, titulo, children }) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border-2 border-line bg-surface p-4 text-ink sm:p-6">
      <h2 id={id} className="mb-4 text-xl font-extrabold">
        {titulo}
      </h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}

export function PreferencesPage({ enderecoReq }) {
  const { prefs, atualizar, alternarTipo, t } = usePrefs()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-3xl font-extrabold">{t('prefs.title')}</h1>
        <p className="text-base text-ink2">{t('prefs.subtitle')}</p>
      </div>

      {enderecoReq && (
        <Secao id="pref-endereco-titulo" titulo="Meu endereço">
          <MeuEndereco enderecoReq={enderecoReq} />
        </Secao>
      )}

      <Secao id="pref-tipos" titulo={t('prefs.types')}>
        <p className="-mt-3 text-base text-ink2">{t('prefs.typesHint')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {categoriasRisco.map((c) => (
            <CheckCard
              key={c.id}
              id={`tipo-${c.id}`}
              label={c.label}
              checked={prefs.tipos[c.id]}
              onChange={() => alternarTipo(c.id)}
            />
          ))}
        </div>
      </Secao>

      <Secao id="pref-raio" titulo={t('prefs.radius')}>
        <div>
          <label htmlFor="raio" className="flex items-baseline justify-between gap-3 text-base font-semibold">
            <span>{t('prefs.radiusHint')}</span>
            <output htmlFor="raio" className="shrink-0 text-2xl font-extrabold">
              {formatarDistancia(prefs.raioM)}
            </output>
          </label>
          <input
            id="raio"
            type="range"
            min={500}
            max={10000}
            step={500}
            value={prefs.raioM}
            onChange={(e) => atualizar({ raioM: Number(e.target.value) })}
            aria-valuetext={formatarDistancia(prefs.raioM)}
            className="mt-3 h-11 w-full accent-[var(--sz-brand)]"
          />
          <div className="flex justify-between text-sm font-semibold text-ink2" aria-hidden="true">
            <span>500 m</span>
            <span>10 km</span>
          </div>
        </div>
      </Secao>

      <Secao id="pref-exibicao" titulo={t('prefs.display')}>
        <Switch
          id="pref-contraste"
          label={t('prefs.contrast')}
          hint={t('prefs.contrastHint')}
          checked={prefs.altoContraste}
          onChange={(v) => atualizar({ altoContraste: v })}
        />
        <Segmented
          legend={t('prefs.fontSize')}
          name="fonte"
          value={prefs.fonteGrande ? 'grande' : 'normal'}
          onChange={(v) => atualizar({ fonteGrande: v === 'grande' })}
          options={[
            { id: 'normal', label: t('prefs.fontNormal') },
            { id: 'grande', label: t('prefs.fontLarge') },
          ]}
        />
        <Segmented
          legend={t('prefs.language')}
          name="idioma"
          value={prefs.idioma}
          onChange={(v) => atualizar({ idioma: v })}
          options={idiomas}
        />
      </Secao>
    </div>
  )
}
