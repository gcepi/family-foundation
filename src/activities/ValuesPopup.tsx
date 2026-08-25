import { useState } from 'react'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useStore } from '~/app/store'
import { Popup } from '~/components/Popup'
import { Ticks } from '~/components/Bits'
import { VALUES } from '~/data/values'
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
 * The sort, side by side.
 *
 * Two values held next to each other is the whole point — a family is not
 * rating one value at a time, they are deciding which of two gives way. The
 * list fills from both ends: up claims the next place from the top, down the
 * next from the bottom, and whatever is left standing lands in the middle.
 */
export function ValuesPopup() {
  const { doc, dispatch, closeActivity } = useStore()

  const [deck] = useState(() => shuffle(VALUES))
  const [onScreen, setOnScreen] = useState<ValueCard[]>(() => deck.slice(0, 2))
  const [pool, setPool] = useState<ValueCard[]>(() => deck.slice(2))
  const [top, setTop] = useState<string[]>([])
  const [bottom, setBottom] = useState<string[]>([])

  const placed = top.length + bottom.length
  const family = doc.origin.familyName.trim()

  const choose = (id: string, direction: 'up' | 'down') => {
    /* A card stays in the DOM while it animates away, so a quick second tap
       can land on one already placed — which would rank it twice and
       silently drop another. */
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
      dispatch({ type: 'completeConstitution' })
      closeActivity()
    }
    navigator.vibrate?.(6)
  }

  return (
    <Popup
      title="Family Constitution · Values"
      onClose={closeActivity}
      progress={<Ticks total={VALUES.length - 1} index={placed} />}
    >
      <div className="flex h-full flex-col">
        <p className="type-caption mx-auto max-w-[38ch] text-center">
          Sort the following values into priority order using the arrows on each card.
        </p>

        <div className="flex flex-1 flex-col justify-center">
          <p className="prose-editorial mb-5 text-center !text-[1.02rem]">
            When engaging with technology like AI, the {family || 'ㅤ'} family values:
          </p>

          <div className="grid grid-cols-2 items-stretch gap-3">
            <AnimatePresence mode="popLayout">
              {onScreen.map((card) => (
                <ValueColumn
                  key={card.id}
                  card={card}
                  onChoose={(direction) => choose(card.id, direction)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Popup>
  )
}

function ValueColumn({
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
    if (info.offset.y < -60 || info.velocity.y < -400) go('up')
    else if (info.offset.y > 60 || info.velocity.y > 400) go('down')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        y: leaving === 'down' ? 180 : -180,
        scale: 0.92,
        pointerEvents: 'none',
        transition: { duration: 0.26 },
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      className="flex h-full flex-col items-stretch gap-2"
    >
      {/* The arrows sit outside the card, above and below it, so the card
          itself stays a thing you read rather than a thing covered in
          controls. */}
      <Arrow direction="up" label={`${card.title} — matters more`} onClick={() => go('up')} />

      <motion.div
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.55}
        onDragEnd={onDragEnd}
        className="surface-raised flex flex-1 flex-col justify-center touch-none px-4 py-5"
      >
        <p className="type-h3 leading-snug hyphens-auto">{card.title}</p>
        <p className="type-caption mt-2 leading-snug">{card.blurb}</p>
      </motion.div>

      <Arrow direction="down" label={`${card.title} — matters less`} onClick={() => go('down')} />
    </motion.div>
  )
}

function Arrow({
  direction,
  label,
  onClick,
}: {
  direction: 'up' | 'down'
  label: string
  onClick: () => void
}) {
  const up = direction === 'up'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-rule-strong)] py-1.5 text-[0.72rem] font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-ochre)] hover:text-[var(--color-ink)] active:scale-[0.97]"
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        style={up ? undefined : { transform: 'rotate(180deg)' }}
      >
        <path
          d="M3 9 L7 4.5 L11 9"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {up ? 'More' : 'Less'}
    </button>
  )
}
