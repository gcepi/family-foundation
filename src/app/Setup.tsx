import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '~/app/store'
import { Screen } from '~/app/Shell'
import { ArrowLeft, ArrowRight, Close, IconButton } from '~/components/Bits'
import type { Participant, Standing } from '~/lib/types'

const uid = () => Math.random().toString(36).slice(2, 10)

/**
 * Who is holding the phone.
 *
 * Deliberately not "who is in your family" — that question belongs to the
 * first activity, and asking it twice would give the family two answers to
 * reconcile. This is only the people in the room today, plus the name the
 * document will be filed under.
 */
export function Setup() {
  const { doc, dispatch, goCover, openDocument } = useStore()
  const [familyName, setFamilyName] = useState(doc.origin.familyName)
  const [people, setPeople] = useState<Participant[]>(
    doc.participants.length
      ? doc.participants
      : [
          { id: uid(), name: '', standing: 'grownup' },
          { id: uid(), name: '', standing: 'kid' },
        ],
  )

  const named = people.filter((p) => p.name.trim())
  const ready = named.length > 0 && familyName.trim().length > 0

  const update = (id: string, patch: Partial<Participant>) =>
    setPeople((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  const add = (standing: Standing) =>
    setPeople((ps) => [...ps, { id: uid(), name: '', standing }])

  const remove = (id: string) => setPeople((ps) => ps.filter((p) => p.id !== id))

  const save = () => {
    dispatch({
      type: 'setParticipants',
      participants: named.map((p) => ({ ...p, name: p.name.trim() })),
      familyName: familyName.trim(),
    })
    if (doc.completed.setup) goCover()
    else openDocument('portrait')
  }

  return (
    <Screen
      footer={
        <button type="button" className="btn btn-primary w-full" disabled={!ready} onClick={save}>
          {doc.completed.setup ? 'Save' : 'Open the document'}
          <ArrowRight />
        </button>
      }
    >
      <div className="relative z-1 px-7 pt-[max(1rem,env(safe-area-inset-top))] pb-8">
        <div className="mb-6 flex items-center">
          <IconButton label="Back to contents" onClick={goCover}>
            <ArrowLeft />
          </IconButton>
        </div>

        <h1 className="type-h1">Who is here?</h1>
        <p className="type-caption mt-3 max-w-[32ch]">
          Just the people in the room today. The phone will move between them, so it needs
          to know their names.
        </p>

        <div className="mt-9">
          <label className="type-eyebrow mb-1 block" htmlFor="family-name">
            The family name
          </label>
          <input
            id="family-name"
            className="field"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="Whatever you call yourselves"
            autoComplete="off"
          />
        </div>

        <div className="mt-10 flex items-center gap-3">
          <span className="type-eyebrow">The people</span>
          <span className="h-px flex-1 bg-[var(--color-rule)]" />
        </div>

        <ul className="mt-1">
          <AnimatePresence initial={false}>
            {people.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="flex items-end gap-3 py-3">
                  <input
                    className="field flex-1"
                    value={p.name}
                    onChange={(e) => update(p.id, { name: e.target.value })}
                    placeholder="First name"
                    autoComplete="off"
                    aria-label="First name"
                  />

                  <div className="flex shrink-0 overflow-hidden rounded-full border border-[var(--color-rule-strong)]">
                    {(['grownup', 'kid'] as Standing[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => update(p.id, { standing: s })}
                        aria-pressed={p.standing === s}
                        className="px-3 py-1.5 text-[0.75rem] font-medium transition-colors duration-200"
                        style={{
                          background: p.standing === s ? 'var(--color-ink)' : 'transparent',
                          color: p.standing === s ? 'var(--color-paper)' : 'var(--color-muted)',
                        }}
                      >
                        {s === 'grownup' ? 'Grown-up' : 'Kid'}
                      </button>
                    ))}
                  </div>

                  {people.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remove ${p.name || 'this person'}`}
                      onClick={() => remove(p.id)}
                      className="mb-1.5 shrink-0 text-[var(--color-muted)] transition-colors hover:text-[var(--color-decline)]"
                    >
                      <Close />
                    </button>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <div className="mt-5 flex gap-2">
          <button type="button" className="btn btn-ghost flex-1 !py-2.5 !text-[0.85rem]" onClick={() => add('grownup')}>
            Add a grown-up
          </button>
          <button type="button" className="btn btn-ghost flex-1 !py-2.5 !text-[0.85rem]" onClick={() => add('kid')}>
            Add a kid
          </button>
        </div>
      </div>
    </Screen>
  )
}
