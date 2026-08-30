import { useRef, useState } from 'react'
import { AnimatePresence, Reorder, motion, useDragControls, type PanInfo } from 'framer-motion'
import { useStore } from '~/app/store'
import { Popup } from '~/components/Popup'
import { ArrowRight, IconButton, Ticks, Undo } from '~/components/Bits'
import { VALUES } from '~/data/values'
import type { ValueCard } from '~/lib/types'

const N = VALUES.length

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Everything the sort can be rewound to. */
type Snapshot = {
  play: (ValueCard | null)[]
  queue: ValueCard[]
  ranked: ValueCard[]
  settled: boolean
}

/**
 * The sort, in two halves.
 *
 * Above the rule: one question and two values, and nothing else — a family
 * is not rating values one at a time, they are deciding which of two gives
 * way. Below it: the ranking those decisions are building.
 *
 * The value you choose stays in play and faces the next one. The other goes
 * straight to the top of the ranking and pushes everything already there
 * down a place, which is the right position for it: it just lost to the card
 * that has beaten everything ranked below. The last value standing drops in
 * above them all at the end.
 */
export function ValuesPopup() {
  const { doc, dispatch, closeActivity, openDocument } = useStore()

  const [started, setStarted] = useState(false)
  const [deck] = useState(() => shuffle(VALUES))
  const [play, setPlay] = useState<(ValueCard | null)[]>(() => deck.slice(0, 2))
  const [queue, setQueue] = useState<ValueCard[]>(() => deck.slice(2))
  const [ranked, setRanked] = useState<ValueCard[]>([])
  const [settled, setSettled] = useState(false)
  const [past, setPast] = useState<Snapshot[]>([])

  /* A card that has just been chosen is still under the finger for a frame
     or two. Without this, a second tap lands on the pair that is already on
     its way out and the same value gets counted twice. */
  const busy = useRef(false)
  const claim = () => {
    if (busy.current) return false
    busy.current = true
    window.setTimeout(() => {
      busy.current = false
    }, 240)
    return true
  }

  const family = doc.origin.familyName.trim()
  const decided = Math.min(N - 1, N - queue.length - play.filter(Boolean).length)

  const remember = () => setPast((p) => [...p, { play, queue, ranked, settled }])

  const undo = () => {
    const last = past[past.length - 1]
    if (!last) return
    setPlay(last.play)
    setQueue(last.queue)
    setRanked(last.ranked)
    setSettled(last.settled)
    setPast(past.slice(0, -1))
    navigator.vibrate?.(4)
  }

  /** The tapped value stays where it is; the other one goes to the top of the list. */
  const choose = (seat: number) => {
    const other = seat === 0 ? 1 : 0
    const winner = play[seat]
    const loser = play[other]
    if (!winner || !loser || !claim()) return

    remember()
    const nextPlay = [...play]

    if (queue.length) {
      setRanked([loser, ...ranked])
      nextPlay[other] = queue[0]
      setQueue(queue.slice(1))
    } else {
      /* Nothing left to face it. The winner has beaten everything, so it
         goes in above the value it just beat and the sort is over. */
      setRanked([winner, loser, ...ranked])
      setSettled(true)
      nextPlay[other] = null
      nextPlay[seat] = null
    }

    setPlay(nextPlay)
    navigator.vibrate?.(6)
  }

  /** Dragging inside the list rewrites the order it was built in. */
  const reorder = (next: ValueCard[]) => {
    remember()
    setRanked(next)
  }

  const finish = () => {
    dispatch({ type: 'setRanking', ranking: ranked.map((c) => c.id) })
    dispatch({ type: 'completeValues' })
    /* Family Values, open, with nothing else open beside it. */
    dispatch({ type: 'focusPanel', open: ['values'] })
    openDocument('values')
  }

  const framing = (
    <div className="shrink-0">
      <p className="type-eyebrow mb-2 text-center">Select what matters most</p>
      <p className="surface px-4 py-3 text-center">
        <span className="prose-editorial !text-[1rem]">
          When engaging with AI, {family ? `the ${family} family` : 'our family'} values{' '}
          <span
            className="inline-block w-[6ch] translate-y-[0.1em] border-b-[1.5px] border-[var(--color-ochre)]"
            aria-hidden="true"
          />
          .
        </span>
      </p>
    </div>
  )

  if (!started) {
    return (
      <Popup title="Family Values Activity" onClose={closeActivity}>
        <div className="flex flex-col gap-5 py-2">
          <p className="prose-editorial">
            This activity presents two values at a time and asks you to decide what matters
            more. We've provided a short sentence to help frame the decision.
          </p>

          {framing}

          <p className="prose-editorial">
            Read each value and decide which matters more. Tap or swipe up to choose. The
            one you set aside takes its place in the ranking below.
          </p>

          <button
            type="button"
            className="btn btn-primary mt-2 w-full"
            onClick={() => setStarted(true)}
          >
            Continue
          </button>
        </div>
      </Popup>
    )
  }

  return (
    <Popup
      title="Family Values Activity"
      onClose={closeActivity}
      progress={<Ticks total={N - 1} index={decided} />}
      footer={
        <div className="flex items-center justify-between">
          <IconButton label="Undo" onClick={undo} disabled={!past.length}>
            <Undo />
          </IconButton>
          <IconButton label="Save ranking" onClick={finish} disabled={!settled}>
            <ArrowRight />
          </IconButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        {framing}

        {/* Two values, and no third one in the corner of the eye. Once the
            list is settled there is nothing left to weigh. */}
        {settled ? (
          <p className="type-caption text-center">
            Every value has a place. Drag to change the order, then continue.
          </p>
        ) : (
          <div className="grid grid-cols-2 items-stretch gap-3">
            {play.map((card, seat) => (
              <div key={seat} className="min-w-0">
                {/* Keyed on the value, so the replacement simply takes the
                    slot. There is no exit animation to wait on: a card that
                    stayed on screen a moment too long is how the same value
                    used to get counted twice. */}
                {card && <ValueTile key={card.id} card={card} onChoose={() => choose(seat)} />}
              </div>
            ))}
          </div>
        )}

        <Ranking cards={ranked} onReorder={reorder} />
      </div>
    </Popup>
  )
}

/* -------------------------------------------------------------------------- */

function ValueTile({ card, onChoose }: { card: ValueCard; onChoose: () => void }) {
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -60 || info.velocity.y < -400) onChoose()
  }

  return (
    <motion.button
      type="button"
      drag="y"
      dragDirectionLock
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.55, bottom: 0.1 }}
      onDragEnd={onDragEnd}
      onClick={onChoose}
      aria-label={`${card.title} — matters more`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 460, damping: 38 }}
      className="surface-raised flex h-full min-h-[9.5rem] w-full touch-none flex-col px-4 py-3.5 text-left transition-colors hover:border-[var(--color-ochre)]"
    >
      <p className="type-h3 hyphens-auto leading-snug">{card.title}</p>
      <p className="type-caption mt-1.5 leading-snug">{card.blurb}</p>
    </motion.button>
  )
}

/* -------------------------------------------------------------------------- */

/**
 * The ranking, as numbered slots.
 *
 * Every slot is on screen from the first decision, so the family can see the
 * whole shape of what they are filling in. Values arrive at the top and push
 * the rest down; the empty slots wait underneath.
 */
function Ranking({
  cards,
  onReorder,
}: {
  cards: ValueCard[]
  onReorder: (next: ValueCard[]) => void
}) {
  const [explaining, setExplaining] = useState(false)
  const [flipped, setFlipped] = useState<string[]>([])
  const empty = N - cards.length

  return (
    <div className="relative border-t border-[var(--color-rule)] pt-3">
      <div className="mb-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setExplaining((v) => !v)}
          onMouseEnter={() => setExplaining(true)}
          onMouseLeave={() => setExplaining(false)}
          aria-label="What is this?"
          className="flex h-4 w-4 items-center justify-center rounded-full border border-[var(--color-rule-strong)] text-[0.6rem] font-semibold text-[var(--color-muted)]"
        >
          i
        </button>
        <p className="type-eyebrow">Ranking</p>
      </div>

      <AnimatePresence>
        {explaining && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            role="tooltip"
            className="surface-raised absolute bottom-full left-0 z-10 mb-2 px-4 py-3"
          >
            <p className="type-caption text-[var(--color-ink)]">
              Each value you set aside takes the highest open place, above everything it
              outranks. Your top three will inform your Telos statement. Tap a card to read
              what it means, or drag the handle to move it.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-1.5">
        <Reorder.Group
          axis="y"
          values={cards}
          onReorder={onReorder}
          className="flex list-none flex-col gap-1.5"
        >
          {cards.map((card, i) => (
            <RankRow
              key={card.id}
              card={card}
              n={i + 1}
              flipped={flipped.includes(card.id)}
              onFlip={() =>
                setFlipped((f) =>
                  f.includes(card.id) ? f.filter((x) => x !== card.id) : [...f, card.id],
                )
              }
            />
          ))}
        </Reorder.Group>

        {Array.from({ length: empty }, (_, i) => (
          <EmptySlot key={`empty-${i}`} n={cards.length + i + 1} />
        ))}
      </div>
    </div>
  )
}

function EmptySlot({ n }: { n: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-[4.5rem] items-center gap-3 px-4 py-3"
      style={{
        border: '1px dashed var(--color-rule-strong)',
        borderRadius: 'var(--radius-card)',
        opacity: 0.45,
      }}
    >
      <span className="w-4 shrink-0 text-center text-[0.75rem] tabular-nums text-[var(--color-muted)]">
        {n}
      </span>
      <span className="flex-1" />
    </div>
  )
}

function RankRow({
  card,
  n,
  flipped,
  onFlip,
}: {
  card: ValueCard
  n: number
  flipped: boolean
  onFlip: () => void
}) {
  const controls = useDragControls()
  /* The top three are the ones the Telos statement will read. */
  const isTop = n <= 3

  return (
    <Reorder.Item
      value={card}
      dragListener={false}
      dragControls={controls}
      className="flex min-h-[4.5rem] items-center gap-3 px-4 py-3"
      style={{
        background: isTop ? 'var(--color-ochre-wash)' : 'var(--color-paper-dark)',
        border: `1px solid ${
          isTop ? 'color-mix(in srgb, var(--color-ochre) 40%, transparent)' : 'var(--color-rule)'
        }`,
        borderRadius: 'var(--radius-card)',
      }}
    >
      <span className="w-4 shrink-0 text-center text-[0.75rem] tabular-nums text-[var(--color-muted)]">
        {n}
      </span>

      {/* Every card is already tall enough for its definition, so turning
          one over reveals text instead of pushing the list around. */}
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
              {card.blurb}
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
              {card.title}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <button
        type="button"
        aria-label={`Move ${card.title}`}
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
