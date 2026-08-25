import { motion } from 'framer-motion'
import { useStore } from '~/app/store'
import { Screen } from '~/app/Shell'
import { Astrolabe } from '~/illustrations'
import { SECTION_MARKS } from '~/illustrations/marks'
import { ArrowRight, Check, Lock } from '~/components/Bits'
import type { SectionId } from '~/lib/types'

type Row = {
  id: SectionId
  title: string
  blurb: string
  parts?: { label: string; done: boolean }[]
}

export function Cover() {
  const { doc, openDocument, goSetup, unlocked, freeNav, setFreeNav, dispatch } = useStore()
  const c = doc.completed

  const rows: Row[] = [
    {
      id: 'portrait',
      title: 'Family Portrait',
      blurb: 'Where you began, how you practice, what you are aiming at.',
      parts: [
        { label: 'Origin', done: c.origin },
        { label: 'Praxis', done: c.praxis },
        { label: 'Telos', done: c.constitution },
      ],
    },
    {
      id: 'practices',
      title: 'Family Practices',
      blurb: 'What your family will hand over, and what it will keep.',
    },
    {
      id: 'constitution',
      title: 'Family Constitution',
      blurb: 'The values you would protect when they cost something.',
    },
    {
      id: 'covenant',
      title: 'The Finished Document',
      blurb: 'Everything you wrote, in one piece, to take home.',
    },
  ]

  const status = (id: SectionId): 'locked' | 'open' | 'started' | 'done' => {
    if (!unlocked(id)) return 'locked'
    if (id === 'portrait') return c.constitution ? 'done' : c.origin ? 'started' : 'open'
    if (id === 'practices') return c.practices ? 'done' : doc.practices.length ? 'started' : 'open'
    if (id === 'constitution') return c.constitution ? 'done' : doc.valueRanking.length ? 'started' : 'open'
    return c.constitution ? 'open' : 'locked'
  }

  const setupDone = c.setup

  return (
    <Screen>
      <div className="relative z-1 flex min-h-full flex-col px-7 pt-[max(2rem,env(safe-area-inset-top))] pb-10">
        {/* Masthead */}
        <div className="mb-1 flex items-center justify-between">
          <p className="type-eyebrow">Family Foundation</p>
          {setupDone && (
            <button
              type="button"
              onClick={goSetup}
              className="type-caption underline decoration-[var(--color-rule-strong)] underline-offset-4 transition-colors hover:text-[var(--color-ink)]"
            >
              Who's here
            </button>
          )}
        </div>

        <div className="my-5 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <Astrolabe
              size={212}
              progress={{
                portrait: c.origin,
                practices: c.practices,
                constitution: c.constitution,
              }}
            />
          </motion.div>
        </div>

        <h1 className="type-h1 text-center">
          {doc.origin.familyName.trim() ? `The ${doc.origin.familyName.trim()} Family` : 'Your Family'}
        </h1>
        <p className="type-caption mx-auto mt-3 max-w-[34ch] text-balance text-center">
          Three sessions, one document, and nothing in it is finished until you say so.
        </p>

        {/* Setup gate */}
        {!setupDone ? (
          <button
            type="button"
            onClick={goSetup}
            className="btn btn-primary mt-8 w-full"
          >
            Begin — who is here today?
            <ArrowRight />
          </button>
        ) : (
          <>
            <div className="mt-9 mb-3 flex items-center gap-3">
              <span className="type-eyebrow">Contents</span>
              <span className="h-px flex-1 bg-[var(--color-rule)]" />
            </div>

            <ul className="flex flex-col">
              {rows.map((row, i) => {
                const s = status(row.id)
                const locked = s === 'locked'
                const Mark = SECTION_MARKS[row.id]
                return (
                  <motion.li
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <button
                      type="button"
                      disabled={locked}
                      aria-label={`${row.title} — ${
                        locked
                          ? 'not yet available'
                          : s === 'done'
                            ? 'finished'
                            : s === 'started'
                              ? 'in progress'
                              : 'not started'
                      }`}
                      onClick={() => openDocument(row.id)}
                      className="group flex w-full items-start gap-4 border-b border-[var(--color-rule)] py-4 text-left transition-opacity disabled:cursor-not-allowed"
                      style={{ opacity: locked ? 0.42 : 1 }}
                    >
                      <span className="mt-0.5 shrink-0">
                        <Mark size={24} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="type-h3">{row.title}</span>
                          {s === 'done' && (
                            <span className="text-[var(--color-ochre)]">
                              <Check size={14} />
                            </span>
                          )}
                          {locked && (
                            <span className="text-[var(--color-muted)]">
                              <Lock />
                            </span>
                          )}
                        </span>
                        <span className="type-caption mt-1 block">{row.blurb}</span>

                        {row.parts && (
                          <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                            {row.parts.map((p, pi) => (
                              <span key={p.label} className="flex items-center gap-2">
                                {pi > 0 && (
                                  <span className="text-[var(--color-rule-strong)]" aria-hidden="true">
                                    ·
                                  </span>
                                )}
                                <span
                                  className="text-[0.78rem]"
                                  style={{
                                    color: p.done ? 'var(--color-ink)' : 'var(--color-muted)',
                                    opacity: p.done ? 1 : 0.55,
                                    fontWeight: p.done ? 540 : 400,
                                  }}
                                >
                                  {p.label}
                                </span>
                              </span>
                            ))}
                          </span>
                        )}
                      </span>

                      {!locked && (
                        <span className="mt-1 shrink-0 text-[var(--color-muted)] transition-transform duration-300 group-hover:translate-x-1">
                          <ArrowRight />
                        </span>
                      )}
                    </button>
                  </motion.li>
                )
              })}
            </ul>

            {/* Who's in the room */}
            {doc.participants.length > 0 && (
              <div className="mt-7">
                <p className="type-eyebrow mb-2.5">In the room</p>
                <div className="flex flex-wrap gap-1.5">
                  {doc.participants.map((p) => (
                    <span
                      key={p.id}
                      className="rounded-full border border-[var(--color-rule-strong)] px-3 py-1 text-[0.8rem]"
                      style={{
                        background: p.standing === 'grownup' ? 'transparent' : 'var(--color-blue-wash)',
                      }}
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Prototype controls. Deliberately at the bottom of the front cover and
            nowhere else — they are not part of the experience being tested. */}
        <div className="mt-auto border-t border-dashed border-[var(--color-rule-strong)] pt-4" style={{ marginTop: 'auto', paddingTop: '1.75rem' }}>
          <p className="type-eyebrow mb-3">Prototype</p>
          <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
            <span className="type-caption max-w-[24ch]">
              Review mode — open every section regardless of progress
            </span>
            <span
              className="relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300"
              style={{ background: freeNav ? 'var(--color-ochre)' : 'var(--color-rule-strong)' }}
            >
              <input
                type="checkbox"
                checked={freeNav}
                onChange={(e) => setFreeNav(e.target.checked)}
                className="sr-only"
              />
              <span
                className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-[var(--color-paper)] shadow-sm transition-all duration-300"
                style={{ left: freeNav ? 23 : 3 }}
              />
            </span>
          </label>
          <button
            type="button"
            onClick={() => {
              if (confirm('Clear everything this family has written and start over?')) {
                dispatch({ type: 'reset' })
              }
            }}
            className="type-caption mt-2 underline decoration-[var(--color-rule-strong)] underline-offset-4 transition-colors hover:text-[var(--color-decline)]"
          >
            Start over
          </button>
        </div>
      </div>
    </Screen>
  )
}
