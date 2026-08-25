import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useStore } from '~/app/store'
import { ActivitySheet } from '~/components/ActivitySheet'
import { AssistantReveal } from '~/components/Assistant'
import { Ticks } from '~/components/Bits'
import { RoseMark, RuleWithTick } from '~/illustrations'
import { VALUES, valueById } from '~/data/values'
import { composeTelos, think } from '~/lib/assistant'
import type { ValueCard } from '~/lib/types'

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * The sort.
 *
 * Two values at a time, and the list fills from both ends: send one up to
 * claim the next place from the top, or down to claim the next place from
 * the bottom. The card left standing waits for the next challenger, and
 * whatever survives to the end lands in the middle.
 *
 * Ten values settle in nine choices. A family that can name ten values has
 * said nothing; a family that can put two of them in order has said
 * something — and being able to push one to the bottom is a statement too.
 */
export function ValuesActivity() {
  const { doc, dispatch, closeActivity } = useStore()

  const resuming =
    doc.valueRanking.length === VALUES.length &&
    new Set(doc.valueRanking).size === VALUES.length

  const [deck] = useState(() => shuffle(VALUES))
  const [onScreen, setOnScreen] = useState<ValueCard[]>(() => (resuming ? [] : deck.slice(0, 2)))
  const [pool, setPool] = useState<ValueCard[]>(() => (resuming ? [] : deck.slice(2)))
  const [top, setTop] = useState<string[]>([])
  const [bottom, setBottom] = useState<string[]>([])
  const [sorted, setSorted] = useState(resuming)

  const placed = top.length + bottom.length

  const choose = (id: string, direction: 'up' | 'down') => {
    /* A card stays in the DOM while it animates away, so a quick second tap
       can land on one that has already been placed. Without this guard that
       tap places the same value twice and silently drops another. */
    if (top.includes(id) || bottom.includes(id)) return
    if (!onScreen.some((c) => c.id === id)) return

    const rest = onScreen.filter((c) => c.id !== id)
    const nextTop = direction === 'up' ? [...top, id] : top
    const nextBottom = direction === 'down' ? [...bottom, id] : bottom

    setTop(nextTop)
    setBottom(nextBottom)

    if (pool.length) {
      setOnScreen([...rest, pool[0]])
      setPool((p) => p.slice(1))
    } else {
      const middle = rest.map((c) => c.id)
      const finalOrder = [...new Set([...nextTop, ...middle, ...[...nextBottom].reverse()])]
      setOnScreen([])
      dispatch({ type: 'setRanking', ranking: finalOrder })
      setSorted(true)
    }
    navigator.vibrate?.(6)
  }

  const resort = () => {
    const fresh = shuffle(VALUES)
    setTop([])
    setBottom([])
    setOnScreen(fresh.slice(0, 2))
    setPool(fresh.slice(2))
    setSorted(false)
    dispatch({ type: 'setRanking', ranking: [] })
    dispatch({ type: 'setTelos', telos: '' })
  }

  if (sorted) return <Sorted onResort={resort} onClose={closeActivity} />

  return (
    <ActivitySheet
      title="Family Constitution · Values"
      onClose={closeActivity}
      progress={<Ticks total={VALUES.length - 1} index={placed} />}
    >
      <div className="flex h-full flex-col pt-2">
        <div className="relative flex flex-1 flex-col justify-center gap-3 pb-3">
          <p className="type-caption mb-1 text-center">
            {placed === 0 ? 'Which of these matters more to your family?' : 'And now?'}
          </p>

          <AnimatePresence mode="popLayout">
            {onScreen.map((card) => (
              <ValueTile
                key={card.id}
                card={card}
                onChoose={(direction) => choose(card.id, direction)}
              />
            ))}
          </AnimatePresence>
        </div>

        <p className="type-caption pb-2 text-center text-[0.75rem]">
          Send one up to claim a place near the top, or down to send it to the bottom.
        </p>
      </div>
    </ActivitySheet>
  )
}

function ValueTile({
  card,
  onChoose,
}: {
  card: ValueCard
  onChoose: (direction: 'up' | 'down') => void
}) {
  const [leaving, setLeaving] = useState<'up' | 'down' | null>(null)

  const go = (direction: 'up' | 'down') => {
    setLeaving(direction)
    onChoose(direction)
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -70 || info.velocity.y < -420) go('up')
    else if (info.offset.y > 70 || info.velocity.y > 420) go('down')
  }

  return (
    <motion.div
      layout
      drag="y"
      dragDirectionLock
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.6}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        y: leaving === 'down' ? 220 : -220,
        scale: 0.9,
        pointerEvents: 'none',
        transition: { duration: 0.32 },
      }}
      transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      className="surface-raised touch-none"
    >
      <button
        type="button"
        onClick={() => go('up')}
        aria-label={`${card.title} — matters more`}
        className="w-full px-6 pt-6 pb-3 text-left"
      >
        <span className="mb-3 block opacity-70">
          <RoseMark size={22} />
        </span>
        <span className="type-h2 block leading-tight">{card.title}</span>
        <span className="type-caption mt-2.5 block">{card.blurb}</span>
      </button>

      <div className="flex items-center justify-between border-t border-[var(--color-rule)] px-3 py-1.5">
        <button
          type="button"
          onClick={() => go('down')}
          className="type-caption flex items-center gap-1.5 px-2 py-1 text-[0.78rem] transition-colors hover:text-[var(--color-ink)]"
        >
          <Chevron down /> Matters less
        </button>
        <button
          type="button"
          onClick={() => go('up')}
          className="flex items-center gap-1.5 px-2 py-1 text-[0.78rem] font-medium transition-colors hover:text-[var(--color-ochre)]"
        >
          Matters more <Chevron />
        </button>
      </div>
    </motion.div>
  )
}

const Chevron = ({ down }: { down?: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
    style={down ? { transform: 'rotate(180deg)' } : undefined}
  >
    <path
      d="M3 9 L7 4.5 L11 9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/* ==========================================================================
   The sorted list — and, above it, what it adds up to
   ========================================================================== */

function Sorted({ onResort, onClose }: { onResort: () => void; onClose: () => void }) {
  const { doc, dispatch } = useStore()
  const [pending, setPending] = useState(!doc.telosSummary)
  const [telos, setTelos] = useState(doc.telosSummary)
  const [editing, setEditing] = useState(false)
  const [belowSummary, setBelowSummary] = useState(true)
  const scroller = useRef<HTMLDivElement>(null)
  const listTop = useRef<HTMLDivElement>(null)

  const run = () => {
    setPending(true)
    think(() => composeTelos(doc.valueRanking, doc.origin.familyName), 2400).then((text) => {
      setTelos(text)
      dispatch({ type: 'setTelos', telos: text })
      setPending(false)
    })
  }

  useEffect(() => {
    if (doc.telosSummary) return
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Land on the list, not on the summary. The summary is something you
     scroll up to find — which is the right instinct: the family should see
     their own order first, and the machine's paragraph second. */
  useLayoutEffect(() => {
    const el = scroller.current
    const anchor = listTop.current
    if (el && anchor) el.scrollTop = anchor.offsetTop - 12
  }, [])

  const finish = () => {
    dispatch({ type: 'setTelos', telos })
    dispatch({ type: 'completeConstitution' })
    onClose()
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 36 }}
      className="paper-grain absolute inset-0 z-30 flex flex-col bg-[var(--color-paper)] md:rounded-[34px]"
      role="dialog"
      aria-label="Your values, in order"
    >
      <header className="relative z-1 flex shrink-0 items-center justify-between gap-3 px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <span className="type-eyebrow">Family Constitution · Values</span>
        <button
          type="button"
          onClick={onResort}
          className="type-caption shrink-0 underline decoration-[var(--color-rule-strong)] underline-offset-4"
        >
          Sort again
        </button>
      </header>

      <div
        ref={scroller}
        onScroll={(e) => setBelowSummary(e.currentTarget.scrollTop > 40)}
        className="scroll-quiet relative z-1 min-h-0 flex-1 overflow-y-auto px-6"
      >
        <div className="pt-2 pb-8">
          <h2 className="type-h1">Telos</h2>
          <RuleWithTick className="my-5" />
          <p className="type-caption mb-6 max-w-[34ch]">
            The end, or the goal. Not who your family is on a good week — who your family
            intends to become.
          </p>

          {editing ? (
            <textarea
              className="field-area"
              rows={9}
              autoFocus
              value={telos}
              onChange={(e) => setTelos(e.target.value)}
              onBlur={() => {
                setEditing(false)
                dispatch({ type: 'setTelos', telos })
              }}
            />
          ) : (
            <AssistantReveal
              pending={pending}
              text={telos}
              eyebrow="Your top three, read back"
              thinkingLabel="Looking at the order you chose"
              action={
                !pending ? (
                  <span className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="type-caption underline decoration-[var(--color-rule-strong)] underline-offset-4"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={run}
                      className="type-caption underline decoration-[var(--color-rule-strong)] underline-offset-4"
                    >
                      Regenerate
                    </button>
                  </span>
                ) : undefined
              }
            />
          )}
        </div>

        <div ref={listTop} className="border-t border-[var(--color-rule)] pt-7 pb-8">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <p className="type-eyebrow">Your values, in order</p>
            {belowSummary && (
              <span className="type-caption shrink-0 text-[0.72rem]">
                scroll up for the summary
              </span>
            )}
          </div>

          <ol className="flex flex-col gap-2">
            {doc.valueRanking.map((id, i) => {
              const v = valueById(id)
              if (!v) return null
              const isTop = i < 3
              return (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.045, duration: 0.4 }}
                  className="flex items-start gap-3.5 px-4 py-3.5"
                  style={{
                    background: isTop ? 'var(--color-ochre-wash)' : 'transparent',
                    border: `1px solid ${
                      isTop
                        ? 'color-mix(in srgb, var(--color-ochre) 40%, transparent)'
                        : 'var(--color-rule)'
                    }`,
                    borderRadius: 'var(--radius-card)',
                  }}
                >
                  <span
                    className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: isTop ? 'var(--color-ochre)' : 'var(--color-rule-strong)' }}
                  />
                  <span className="min-w-0">
                    <span className="type-h3 block leading-snug">{v.title}</span>
                    {isTop && <span className="type-caption mt-1 block">{v.blurb}</span>}
                  </span>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </div>

      <div className="relative z-1 shrink-0 border-t border-[var(--color-rule)] px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button type="button" className="btn btn-primary w-full" disabled={pending} onClick={finish}>
          Write it into the document
        </button>
      </div>
    </motion.div>
  )
}
