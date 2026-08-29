import { useEffect, useState } from 'react'
import { AnimatePresence, Reorder, motion, useDragControls } from 'framer-motion'
import { useStore } from '~/app/store'
import { FoodForThought } from '~/components/FoodForThought'
import { valueById } from '~/data/values'
import { composeValuesReflection, think } from '~/lib/assistant'

/**
 * After the sort, the values come home to the document.
 *
 * The sorting does not live here — it happened once, in its own card. What
 * remains is the result: a list the family can still argue about by
 * dragging, and a reading of it they can edit or ask for again.
 */
export function ValuesSection({ onApplyToTelos }: { onApplyToTelos: () => void }) {
  const { doc, openActivity } = useStore()

  if (!doc.valueRanking.length) {
    return (
      <button
        type="button"
        className="btn btn-primary w-full"
        onClick={() => openActivity('values')}
      >
        Start Activity
      </button>
    )
  }

  return (
    <div>
      <SortedList />
      <div className="mt-8">
        <Reading onApplyToTelos={onApplyToTelos} />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function SortedList() {
  const { doc, dispatch } = useStore()
  /* Collapsing the section unmounts this list, so every card turns back to
     its title on its own — reopening shows the ranking, not ten sentences. */
  const [flipped, setFlipped] = useState<string[]>([])

  return (
    <Reorder.Group
      axis="y"
      values={doc.valueRanking}
      onReorder={(next) => dispatch({ type: 'setRanking', ranking: next })}
      className="flex list-none flex-col gap-2"
    >
      {doc.valueRanking.map((id, i) => (
        <ValueRow
          key={id}
          id={id}
          isTop={i < 3}
          flipped={flipped.includes(id)}
          onFlip={() =>
            setFlipped((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
          }
        />
      ))}
    </Reorder.Group>
  )
}

function ValueRow({
  id,
  isTop,
  flipped,
  onFlip,
}: {
  id: string
  isTop: boolean
  flipped: boolean
  onFlip: () => void
}) {
  const controls = useDragControls()
  const v = valueById(id)
  if (!v) return null

  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 px-4 py-3"
      /* Every card is tall enough for the longest definition, so turning one
         over reveals text instead of pushing the list around. */
      style={{
        minHeight: '5.25rem',
        background: isTop ? 'var(--color-ochre-wash)' : 'var(--color-paper-dark)',
        border: `1px solid ${
          isTop ? 'color-mix(in srgb, var(--color-ochre) 40%, transparent)' : 'var(--color-rule)'
        }`,
        borderRadius: 'var(--radius-card)',
      }}
    >
      {/* Tap to turn the card over and read what it means; tap again to turn
          it back. The handle still drags, so reordering is unaffected. */}
      <button
        type="button"
        onClick={onFlip}
        aria-expanded={flipped}
        className="min-w-0 flex-1 text-left"
      >
        <AnimatePresence mode="wait" initial={false}>
          {flipped ? (
            <motion.span
              key="back"
              initial={{ opacity: 0, rotateX: -70 }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0, rotateX: 70 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformPerspective: 600 }}
              className="type-caption block leading-snug text-[var(--color-ink)]"
            >
              {v.blurb}
            </motion.span>
          ) : (
            <motion.span
              key="front"
              initial={{ opacity: 0, rotateX: 70 }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0, rotateX: -70 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformPerspective: 600 }}
              className="type-h3 block leading-snug"
            >
              {v.title}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <button
        type="button"
        aria-label={`Move ${v.title}`}
        onPointerDown={(e) => controls.start(e)}
        className="shrink-0 cursor-grab touch-none px-1 py-1 text-[var(--color-muted)] opacity-50 transition-opacity hover:opacity-100 active:cursor-grabbing"
      >
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
          <path d="M1 3h12M1 9h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </Reorder.Item>
  )
}

/* -------------------------------------------------------------------------- */

function Reading({ onApplyToTelos }: { onApplyToTelos: () => void }) {
  const { doc, dispatch } = useStore()
  const [pending, setPending] = useState(!doc.valuesReflection)

  /**
   * Regenerate appears only when the top three have actually changed.
   *
   * Not on every reorder: shuffling the order *within* the top three, or
   * moving anything below it, does not change what the paragraph is about.
   * Only a value entering or leaving the top three does.
   */
  const topThree = doc.valueRanking.slice(0, 3)
  const [writtenFor, setWrittenFor] = useState<string[]>(topThree)
  const stale =
    topThree.length === 3 &&
    writtenFor.length === 3 &&
    [...topThree].sort().join('|') !== [...writtenFor].sort().join('|')

  const run = () => {
    setPending(true)
    const forTop = doc.valueRanking.slice(0, 3)
    think(() => composeValuesReflection(doc.valueRanking, doc.origin.familyName), 2000).then(
      (text) => {
        dispatch({ type: 'setValuesReflection', text })
        setWrittenFor(forTop)
        setPending(false)
      },
    )
  }

  useEffect(() => {
    if (doc.valuesReflection || !doc.valueRanking.length) return
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <FoodForThought
      pending={pending}
      text={doc.valuesReflection}
      onChange={(v) => dispatch({ type: 'setValuesReflection', text: v })}
      thinkingLabel="Looking at the order you chose"
      actions={
        <>
          <button
            type="button"
            className="btn btn-ghost !py-2 !text-[0.82rem]"
            onClick={() => {
              dispatch({ type: 'setTelos', text: doc.valuesReflection })
              onApplyToTelos()
            }}
          >
            Apply to Telos
          </button>
          {stale && (
            <button type="button" className="btn btn-ghost !py-2 !text-[0.82rem]" onClick={run}>
              Regenerate
            </button>
          )}
        </>
      }
    />
  )
}
