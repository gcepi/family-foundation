import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { SectionId } from '~/lib/types'

export type ScrubSection = { id: SectionId; label: string; locked: boolean }

/**
 * The right-hand rail.
 *
 * Inside the document you never go "back a page" to get somewhere else —
 * you hold the edge of the paper and slide your thumb to the section you
 * want, the way you would with a thick handout. Releasing lands you there.
 */
export function SectionScrubber({
  sections,
  scrollRef,
  onJump,
}: {
  sections: ScrubSection[]
  scrollRef: React.RefObject<HTMLDivElement | null>
  onJump: (id: SectionId) => void
}) {
  const railRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [hover, setHover] = useState(0)
  const [active, setActive] = useState(0)
  /* The first pointermove can land in the same frame as pointerdown, before
     React has re-rendered with dragging=true. A ref keeps the drag honest. */
  const draggingRef = useRef(false)
  const hoverRef = useRef(0)

  /* Track where the reader actually is, so the rail is a position readout
     even when nobody is touching it. */
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        // The section whose heading is nearest the top third of the viewport.
        let best = 0
        let bestDist = Infinity
        sections.forEach((s, i) => {
          const node = el.querySelector<HTMLElement>(`[data-section="${s.id}"]`)
          if (!node) return
          const d = Math.abs(node.offsetTop - el.scrollTop - el.clientHeight * 0.28)
          if (d < bestDist) {
            bestDist = d
            best = i
          }
        })
        setActive(best)
      })
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [scrollRef, sections])

  const indexFromPointer = useCallback(
    (clientY: number) => {
      const rail = railRef.current
      if (!rail) return 0
      const r = rail.getBoundingClientRect()
      const t = (clientY - r.top) / r.height
      return Math.max(0, Math.min(sections.length - 1, Math.floor(t * sections.length)))
    },
    [sections.length],
  )

  const begin = (e: React.PointerEvent) => {
    e.preventDefault()
    draggingRef.current = true
    const i = indexFromPointer(e.clientY)
    hoverRef.current = i
    setDragging(true)
    setHover(i)

    /* Listen on the window rather than relying on pointer capture: the
       thumb regularly leaves the rail mid-drag, and capture is not
       guaranteed on every input source. */
    const onMove = (ev: PointerEvent) => {
      if (!draggingRef.current) return
      const next = indexFromPointer(ev.clientY)
      if (next !== hoverRef.current) {
        hoverRef.current = next
        setHover(next)
        navigator.vibrate?.(4)
      }
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      if (!draggingRef.current) return
      draggingRef.current = false
      setDragging(false)
      /* Locked sections are still reachable — they are part of the same
         page and you could scroll to them anyway. The section shows its own
         locked state when you arrive. */
      const target = sections[hoverRef.current]
      if (target) onJump(target.id)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center">
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18 }}
            className="mr-2 flex flex-col items-end gap-1.5"
          >
            {sections.map((s, i) => (
              <span
                key={s.id}
                className="rounded-full px-3 py-1 text-[0.8rem] whitespace-nowrap transition-all duration-150"
                style={{
                  background: i === hover ? 'var(--color-ink)' : 'transparent',
                  color:
                    i === hover
                      ? 'var(--color-paper)'
                      : s.locked
                        ? 'color-mix(in srgb, var(--color-muted) 50%, transparent)'
                        : 'var(--color-muted)',
                  fontWeight: i === hover ? 540 : 400,
                }}
              >
                {s.label}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={railRef}
        onPointerDown={begin}
        className="pointer-events-auto flex h-[46%] w-9 cursor-grab touch-none flex-col justify-around py-2 pr-2 active:cursor-grabbing"
        role="presentation"
        aria-hidden="true"
      >
        {sections.map((s, i) => {
          const on = dragging ? i === hover : i === active
          return (
            <span
              key={s.id}
              className="rounded-full transition-all duration-200"
              style={{
                height: 2,
                width: on ? 22 : s.locked ? 8 : 13,
                marginLeft: 'auto',
                background: on
                  ? 'var(--color-ochre)'
                  : s.locked
                    ? 'var(--color-rule)'
                    : 'var(--color-rule-strong)',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
