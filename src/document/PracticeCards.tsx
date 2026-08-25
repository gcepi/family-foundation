import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '~/app/store'
import { Check, Cross } from '~/components/Bits'
import type { Practice } from '~/lib/types'

/**
 * Every decision the family made, kept and refused alike, in the order they
 * choose to put them. No tags, no grouping — the PRD is deliberate about
 * that. Rearranging is the only sorting on offer, and rearranging is itself
 * an argument the family has to have.
 *
 * Tapping a card opens it; the grip in the corner moves it. Separating the
 * two means neither has to guess at the other's intent, and the card stays
 * an ordinary button that a keyboard can reach.
 */
export function PracticeCards({ editable = true }: { editable?: boolean }) {
  const { doc, dispatch, participantName } = useStore()
  const order = doc.practiceOrder.length ? doc.practiceOrder : doc.practices.map((p) => p.id)
  const cards = order
    .map((id) => doc.practices.find((p) => p.id === id))
    .filter(Boolean) as Practice[]

  /* The drag listeners live on the window and outlive a render, so they
     read the order through a ref rather than a stale closure. */
  const orderRef = useRef(order)
  useEffect(() => {
    orderRef.current = order
  })

  const [open, setOpen] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const nodes = useRef(new Map<string, HTMLElement>())

  const startDrag = (e: React.PointerEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragId(id)
    navigator.vibrate?.(8)

    const onMove = (ev: PointerEvent) => {
      const overId = [...nodes.current.entries()].find(([, el]) => {
        const r = el.getBoundingClientRect()
        return (
          ev.clientX >= r.left && ev.clientX <= r.right &&
          ev.clientY >= r.top && ev.clientY <= r.bottom
        )
      })?.[0]
      if (!overId || overId === id) return

      const current = orderRef.current
      const from = current.indexOf(id)
      const to = current.indexOf(overId)
      if (from < 0 || to < 0) return
      const next = [...current]
      next.splice(to, 0, next.splice(from, 1)[0])
      orderRef.current = next
      dispatch({ type: 'setPracticeOrder', order: next })
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      setDragId(null)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  /** Keyboard equivalent, so reordering is not a mouse-only privilege. */
  const nudge = (id: string, delta: number) => {
    const current = orderRef.current
    const from = current.indexOf(id)
    const to = from + delta
    if (from < 0 || to < 0 || to >= current.length) return
    const next = [...current]
    next.splice(to, 0, next.splice(from, 1)[0])
    orderRef.current = next
    dispatch({ type: 'setPracticeOrder', order: next })
  }

  if (!cards.length) return null

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((p) => {
          const kept = p.decision === 'kept'
          const isDragging = dragId === p.id
          return (
            <motion.div
              key={p.id}
              layout
              ref={(el: HTMLDivElement | null) => {
                if (el) nodes.current.set(p.id, el)
                else nodes.current.delete(p.id)
              }}
              transition={{ type: 'spring', stiffness: 520, damping: 38 }}
              animate={{ scale: isDragging ? 1.05 : 1 }}
              className="surface-raised relative"
              style={{
                zIndex: isDragging ? 5 : 0,
                boxShadow: isDragging ? '0 18px 34px -14px rgba(37,35,33,0.5)' : undefined,
                borderColor: isDragging ? 'var(--color-ochre)' : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(p.id)}
                className="flex w-full flex-col items-start p-3.5 pr-8 text-left"
              >
                <span
                  className="mb-2.5 flex h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    background: kept ? 'var(--color-affirm-wash)' : 'var(--color-decline-wash)',
                    color: kept ? 'var(--color-affirm)' : 'var(--color-decline)',
                  }}
                >
                  {kept ? <Check size={13} /> : <Cross size={12} />}
                </span>
                <span className="type-h3 leading-snug hyphens-auto break-words">{p.thing}</span>
                <span className="type-caption mt-1.5 text-[0.75rem]">
                  {participantName(p.participantId)}
                </span>
              </button>

              {editable && (
                <button
                  type="button"
                  aria-label={`Move ${p.thing}. Use the left and right arrow keys.`}
                  onPointerDown={(e) => startDrag(e, p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                      e.preventDefault()
                      nudge(p.id, -1)
                    }
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                      e.preventDefault()
                      nudge(p.id, 1)
                    }
                  }}
                  className="absolute top-2.5 right-2 flex h-7 w-6 cursor-grab touch-none items-center justify-center text-[var(--color-muted)] opacity-45 transition-opacity hover:opacity-100 active:cursor-grabbing"
                >
                  <Grip />
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      {editable && (
        <p className="type-caption mt-3 text-[0.75rem]">
          Tap a card to read it. Drag the handle to move it.
        </p>
      )}

      <AnimatePresence>
        {open && <CardDetail id={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </>
  )
}

const Grip = () => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true">
    {[0, 1, 2].map((row) =>
      [0, 1].map((col) => (
        <circle key={`${row}-${col}`} cx={1.5 + col * 7} cy={2 + row * 5} r="1.15" fill="currentColor" />
      )),
    )}
  </svg>
)

function CardDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { doc, participantName } = useStore()
  const p = doc.practices.find((x) => x.id === id)
  if (!p) return null
  const kept = p.decision === 'kept'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-end bg-[rgba(37,35,33,0.32)] md:rounded-[34px]"
      onClick={onClose}
      role="dialog"
      aria-label={p.thing}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        onClick={(e) => e.stopPropagation()}
        className="paper-grain relative max-h-[80%] w-full overflow-y-auto rounded-t-[24px] border-t border-[var(--color-rule-strong)] bg-[var(--color-paper)] px-6 pt-5 pb-[max(1.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-[var(--color-rule-strong)]" />
        <div className="relative z-1">
          <p
            className="type-eyebrow"
            style={{ color: kept ? 'var(--color-affirm)' : 'var(--color-decline)' }}
          >
            {kept ? 'Taken' : 'Refused'} · {participantName(p.participantId)}
          </p>
          <h3 className="type-h2 mt-2">{p.thing}</h3>

          {kept ? (
            <div className="mt-5 flex flex-col gap-3">
              <Line label="Now you can" text="hand it over" />
              <Line label="You'll no longer have to" text={p.relief} />
              <Line label="You're no longer able to" text={p.bargain?.noLongerAble ?? ''} dim />
              <Line label="Now you'll have to" text={p.bargain?.nowHaveTo ?? ''} dim />
            </div>
          ) : (
            <p className="prose-editorial mt-5">
              We will not {p.refusal?.willNot}, and will still have to{' '}
              {p.refusal?.willStillHaveTo}, so we will still be able to {p.refusal?.soStillAble},
              and be able to {p.refusal?.andAble}.
            </p>
          )}

          <button type="button" onClick={onClose} className="btn btn-ghost mt-7 w-full">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Line({ label, text, dim }: { label: string; text: string; dim?: boolean }) {
  return (
    <div>
      <p className="type-eyebrow" style={dim ? { color: 'var(--color-blue-ink)' } : undefined}>
        {label}
      </p>
      <p className="prose-editorial !text-[1rem]">{text}</p>
    </div>
  )
}
