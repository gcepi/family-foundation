import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '~/app/store'
import { Screen } from '~/app/Shell'
import { FamilyPhoto } from '~/components/FamilyPhoto'
import { ArrowRight, Check, Lock } from '~/components/Bits'
import { downloadMarkdown } from '~/lib/export'
import type { SectionId } from '~/lib/types'

type Row = {
  id: SectionId
  title: string
  blurb: string
}

export function Cover() {
  const { doc, dispatch, openDocument, goSetup, goPrompts, unlocked } = useStore()
  const [confirming, setConfirming] = useState(false)
  const c = doc.completed

  const rows: Row[] = [
    {
      id: 'portrait',
      title: 'Family Portrait',
      blurb: 'A picture of who our family is, who we are becoming, and how we will get there.',
    },
    {
      id: 'practices',
      title: 'Family Practices',
      blurb: 'Considering technology in light of its consequences for ourselves and others.',
    },
    {
      id: 'values',
      title: 'Family Values',
      blurb: 'The things we value point toward the life we are looking for.',
    },
  ]

  const status = (id: SectionId): 'locked' | 'open' | 'started' | 'done' => {
    if (!unlocked(id)) return 'locked'
    if (id === 'portrait') {
      const whole = c.origin && !!doc.praxisStatement.trim() && !!doc.telosStatement.trim()
      return whole ? 'done' : c.origin ? 'started' : 'open'
    }
    if (id === 'practices') return c.practices ? 'done' : doc.practices.length ? 'started' : 'open'
    if (id === 'values') return c.values ? 'done' : doc.valueRanking.length ? 'started' : 'open'
    return 'open'
  }

  const setupDone = c.setup
  const family = doc.origin.familyName.trim()

  return (
    <Screen>
      <div className="relative z-1 flex flex-col px-7 pt-[max(2rem,env(safe-area-inset-top))] pb-10">
        {/* Masthead */}
        <div className="mb-1 flex items-center justify-between">
          <p className="type-eyebrow">
            {family ? `${family} Family Foundation` : 'Family Foundation'}
          </p>
          {setupDone && (
            <button
              type="button"
              onClick={goSetup}
              className="type-caption underline decoration-[var(--color-rule-strong)] underline-offset-4 transition-colors hover:text-[var(--color-ink)]"
            >
              Participants
            </button>
          )}
        </div>

        <div className="my-5">
          <FamilyPhoto />
        </div>

        <h1 className="type-h1 text-center">
          {family ? `${family} Family Foundation` : 'Your Family Foundation'}
        </h1>

        {/* Setup gate */}
        {!setupDone ? (
          <button type="button" onClick={goSetup} className="btn btn-primary mt-8 w-full">
            Begin
          </button>
        ) : (
          <>
            <div className="mt-9 mb-3">
              <span className="type-eyebrow">Contents</span>
            </div>

            <ul className="flex flex-col">
              {rows.map((row, i) => {
                const s = status(row.id)
                const locked = s === 'locked'
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
                      {/* The slot the section mark used to occupy. The state
                          badge lives here now, so the row's left edge tells
                          you where the family is rather than which icon it is. */}
                      <span className="mt-1 flex w-5 shrink-0 justify-center">
                        {locked ? (
                          <span className="text-[var(--color-muted)]">
                            <Lock size={14} />
                          </span>
                        ) : (
                          s === 'done' && (
                            <span className="text-[var(--color-affirm)]">
                              <Check size={16} />
                            </span>
                          )
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="type-h3">{row.title}</span>
                        {row.blurb && (
                          <span className="type-caption mt-1 block">{row.blurb}</span>
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
          </>
        )}

        {c.document && (
          <div className="pt-8">
            <button
              type="button"
              onClick={() => downloadMarkdown(doc)}
              className="btn btn-ghost w-full"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M8 2v8m0 0 3-3m-3 3L5 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.5 11.5v1a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5v-1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Download Markdown
            </button>
          </div>
        )}

        {setupDone && (
          <div className="pt-7 pb-1 text-center">
            <button
              type="button"
              onClick={goPrompts}
              className="type-caption underline decoration-[var(--color-rule-strong)] underline-offset-4 transition-colors hover:text-[var(--color-ink)]"
            >
              AI prompts
            </button>
            <span className="type-caption mx-2 text-[var(--color-rule-strong)]">·</span>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="type-caption underline decoration-[var(--color-rule-strong)] underline-offset-4 transition-colors hover:text-[var(--color-decline)]"
            >
              Start over
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirming && (
          <StartOverWarning
            onCancel={() => setConfirming(false)}
            onConfirm={() => {
              setConfirming(false)
              dispatch({ type: 'reset' })
              goSetup()
            }}
          />
        )}
      </AnimatePresence>
    </Screen>
  )
}

/**
 * Asks in the page rather than in the browser.
 *
 * window.confirm is suppressed inside the artifact viewer's sandboxed frame,
 * which is why the button appeared to do nothing there: the dialog never
 * opened, so the answer was always no.
 */
function StartOverWarning({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onClick={onCancel}
      role="dialog"
      aria-label="Start over"
      className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(37,35,33,0.32)] p-6 md:rounded-[34px]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 520, damping: 40, mass: 0.7 }}
        onClick={(e) => e.stopPropagation()}
        className="surface-raised w-full max-w-[20rem] px-6 py-6"
      >
        <p className="type-h3">Are you sure?</p>
        <p className="type-caption mt-2">All progress will be lost.</p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="btn w-full"
            style={{
              background: 'var(--color-decline-wash)',
              color: 'var(--color-decline)',
              borderColor: 'color-mix(in srgb, var(--color-decline) 34%, transparent)',
            }}
          >
            Start over
          </button>
          <button type="button" onClick={onCancel} className="btn btn-ghost w-full">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
