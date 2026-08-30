import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '~/app/store'
import { Popup } from '~/components/Popup'
import { Check, Cross, Ticks } from '~/components/Bits'
import { Thinking } from '~/components/Assistant'
import { RuleWithTick } from '~/illustrations'
import { DOMAINS } from '~/data/domains'
import { composeBargain, think } from '~/lib/assistant'
import { BargainRows } from '~/document/BargainRows'
import type { Practice } from '~/lib/types'

const uid = () => Math.random().toString(36).slice(2, 10)

const fade = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] as const },
}

type Phase = 'brainstorm' | 'input' | 'teaching' | 'composing' | 'decide' | 'primer'

export function PracticesPopup() {
  const { doc, dispatch, closeActivity, openDocument, nav } = useStore()
  const people = doc.participants

  /* A refusal is a conclusion, not a dismissal. The family sees what they
     just decided, written out, before the next card arrives. */
  const [refusedId, setRefusedId] = useState<string | null>(null)
  const refused = doc.practices.find((p) => p.id === refusedId) ?? null

  const primer = nav.activityMode === 'primer'
  const resuming = doc.practices.length > 0
  const [phase, setPhase] = useState<Phase>(
    primer ? 'primer' : resuming ? 'decide' : 'brainstorm',
  )

  /**
   * Leaving the teaching page.
   *
   * It was opened from Family Practices and it goes straight back there,
   * open, with nothing restarted and nothing else on the page unfolded.
   */
  const backToPractices = () => {
    dispatch({ type: 'focusPanel', open: ['practices'] })
    openDocument('practices')
  }
  const [who, setWho] = useState(0)
  const [drafts, setDrafts] = useState<Record<string, { thing: string; relief: string }>>({})

  const draft = drafts[people[who]?.id] ?? { thing: '', relief: '' }
  const setDraft = (patch: Partial<{ thing: string; relief: string }>) =>
    setDrafts((d) => ({ ...d, [people[who].id]: { ...draft, ...patch } }))

  const inputReady = draft.thing.trim().length > 0 && draft.relief.trim().length > 0

  /* ---- compose ------------------------------------------------------- */
  useEffect(() => {
    if (phase !== 'composing') return
    const built: Practice[] = people
      .filter((p) => drafts[p.id]?.thing.trim())
      .map((p) => ({
        id: uid(),
        participantId: p.id,
        thing: drafts[p.id].thing.trim(),
        relief: drafts[p.id].relief.trim(),
        bargain: null,
        decision: 'pending' as const,
        refusal: null,
      }))

    let live = true
    /* The bargain depends on who is speaking: a child automating homework
       gives up something different from an adult automating it. */
    const standingOf = (id: string) => people.find((x) => x.id === id)?.standing
    think(
      () => built.map((p) => ({ ...p, bargain: composeBargain(p, standingOf(p.participantId)) })),
      2600,
    ).then((withBargains) => {
      if (!live) return
      /* Coming back through the activity is another round, not a redo: the
         bargains the family already settled stay on the page. */
      if (doc.practices.length) {
        withBargains.forEach((practice) => dispatch({ type: 'addPractice', practice }))
      } else {
        dispatch({ type: 'setPractices', practices: withBargains })
      }
      setPhase('decide')
    })
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const pending = doc.practices.filter((p) => p.decision === 'pending')
  const decidedCount = doc.practices.length - pending.length

  /* Every bargain decided: the cards belong to the document now, so hand
     them over and get out of the way. */
  useEffect(() => {
    if (phase !== 'decide' || doc.practices.length === 0 || pending.length > 0) return
    /* The last card was refused and is still being read. */
    if (refusedId) return
    dispatch({ type: 'completePractices' })
    /* Family Practices, open, with nothing else open beside it — and the
       page lands on it, so the reading starts writing itself in view. */
    dispatch({ type: 'focusPanel', open: ['practices'] })
    openDocument('practices')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, pending.length, doc.practices.length, refusedId])

  const backTo: Record<Phase, Phase | null> = {
    brainstorm: null,
    input: 'brainstorm',
    teaching: 'input',
    composing: null,
    decide: null,
    primer: null,
  }

  return (
    <Popup
      title={primer ? 'The Bargain' : 'Family Practices Activity'}
      onClose={primer ? backToPractices : closeActivity}
      onBack={
        phase === 'input' && who > 0
          ? () => setWho((w) => w - 1)
          : backTo[phase]
            ? () => setPhase(backTo[phase]!)
            : undefined
      }
      progress={
        phase === 'input' ? (
          <Ticks total={people.length} index={who} />
        ) : phase === 'decide' && doc.practices.length ? (
          <Ticks total={doc.practices.length} index={decidedCount} />
        ) : undefined
      }
      footer={
        refused ? (
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost flex-1"
              onClick={() => {
                dispatch({
                  type: 'patchPractice',
                  id: refused.id,
                  patch: { decision: 'pending' },
                })
                setRefusedId(null)
              }}
            >
              Go back
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={() => setRefusedId(null)}
            >
              Next
            </button>
          </div>
        ) : phase === 'brainstorm' ? (
          <button type="button" className="btn btn-primary w-full" onClick={() => setPhase('input')}>
            Continue
          </button>
        ) : phase === 'input' ? (
          <button
            type="button"
            className="btn btn-primary w-full"
            disabled={!inputReady}
            onClick={() => {
              if (who < people.length - 1) setWho((w) => w + 1)
              else setPhase('teaching')
            }}
          >
            Next
          </button>
        ) : phase === 'teaching' ? (
          <button type="button" className="btn btn-primary w-full" onClick={() => setPhase('composing')}>
            Continue
          </button>
        ) : phase === 'primer' ? (
          <button type="button" className="btn btn-ghost w-full" onClick={backToPractices}>
            Go back
          </button>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait">
        {phase === 'brainstorm' && <Brainstorm key="brainstorm" />}

        {phase === 'input' && people[who] && (
          <motion.div key={`input-${who}`} {...fade} className="pt-4">
            <h2 className="type-h2">{people[who].name}, what do you want to automate?</h2>
            <p className="type-caption mt-2">Type one example from the list.</p>
            <textarea
              className="field-area mt-4"
              rows={2}
              value={draft.thing}
              onChange={(e) => setDraft({ thing: e.target.value })}
            />

            <hr className="hairline my-9" />

            <h2 className="type-h2">So you'll no longer have to…</h2>
            <p className="type-caption mt-2">Finish the sentence.</p>
            <textarea
              className="field-area mt-4"
              rows={3}
              value={draft.relief}
              onChange={(e) => setDraft({ relief: e.target.value })}
            />
          </motion.div>
        )}

        {(phase === 'teaching' || phase === 'primer') && <BargainPrimer key="teaching" />}

        {phase === 'composing' && (
          <motion.div key="composing" {...fade} className="flex h-full flex-col justify-center">
            <Thinking />
          </motion.div>
        )}

        {refused && <Refused key={`refused-${refused.id}`} practice={refused} />}

        {!refused && phase === 'decide' && pending[0] && (
          <Decide key={pending[0].id} practice={pending[0]} onRefuse={setRefusedId} />
        )}
      </AnimatePresence>
    </Popup>
  )
}

/* ==========================================================================
   Brainstorm — reference on screen while the family writes on paper
   ========================================================================== */

function Brainstorm() {
  const TOTAL = 120
  const [left, setLeft] = useState(TOTAL)
  const [running, setRunning] = useState(false)
  const tick = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    tick.current = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setRunning(false)
          return 0
        }
        return l - 1
      })
    }, 1000)
    return () => {
      if (tick.current) window.clearInterval(tick.current)
    }
  }, [running])

  const mm = Math.floor(left / 60)
  const ss = String(left % 60).padStart(2, '0')
  const progress = left / TOTAL

  return (
    <motion.div {...fade} className="pt-4">
      <h2 className="type-h1">Brainstorm things to automate.</h2>
      <RuleWithTick className="my-5" />
      <p className="prose-editorial">
        Take two minutes to brainstorm things your family would like to automate with
        technology. No need to be realistic. We will consider the trade-offs together.
      </p>

      {/* Timer */}
      <button
        type="button"
        onClick={() => (left === 0 ? (setLeft(TOTAL), setRunning(true)) : setRunning((r) => !r))}
        className="surface-raised mt-7 flex w-full items-center gap-4 px-5 py-4"
      >
        <span className="relative h-12 w-12 shrink-0">
          <Wedge progress={progress} />
        </span>
        <span className="flex-1 text-left">
          <span className="type-h3 block tabular-nums">
            {mm}:{ss}
          </span>
          <span className="type-caption">
            {left === 0 ? "Time's up." : running ? 'Tap to pause' : 'Tap to start'}
          </span>
        </span>
      </button>

      <div className="mt-9">
        <p className="type-eyebrow mb-3">Categories to consider</p>
        <div className="flex flex-col gap-3">
          {DOMAINS.map((d) => (
            <div key={d.name} className="surface px-4 py-3">
              <p className="type-h3 mb-1.5">{d.name}</p>
              <p className="type-caption">{d.items.join(' · ')}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="type-caption mt-7">
        When the time is up, each family member circles one favorite. You can access this
        activity for other items at any time.
      </p>
    </motion.div>
  )
}

/**
 * A clock hand sweeping the face clear.
 *
 * Full at the start and gone at zero, so what the family sees is the time
 * they have left rather than the time they have used.
 */
function Wedge({ progress }: { progress: number }) {
  const r = 21
  const c = 24
  /* The remaining time runs from wherever the hand has swept to, clockwise
     back round to twelve. Drawing it the other way round makes a clock that
     appears to empty anti-clockwise. */
  const full = progress >= 0.999
  const elapsed = (1 - progress) * Math.PI * 2
  const x = c + r * Math.sin(elapsed)
  const y = c - r * Math.cos(elapsed)
  const large = progress > 0.5 ? 1 : 0

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="none" stroke="var(--color-rule)" strokeWidth="1.5" />
      {full ? (
        <circle cx={c} cy={c} r={r} fill="var(--color-ochre)" />
      ) : (
        progress > 0 && (
          <path
            d={`M ${c} ${c} L ${x} ${y} A ${r} ${r} 0 ${large} 1 ${c} ${c - r} Z`}
            fill="var(--color-ochre)"
          />
        )
      )}
    </svg>
  )
}

/* ==========================================================================
   The primer — what the assistant is about to do, and why
   ========================================================================== */

function BargainPrimer() {

  return (
    <motion.div {...fade} className="pt-4">
      <h2 className="type-h1">The Bargain</h2>
      <RuleWithTick className="my-5" />

      <p className="prose-editorial">
        Every automation, every innovation, and every technology has trade-offs.
      </p>

      <p className="prose-editorial mt-4">
        At first, technology promises to relieve a problem, a pain, or an inconvenience.
        Consider the invention of the automobile and the interstate highway:
      </p>

      <div className="surface mt-5 px-5 py-4">
        <div className="flex flex-col gap-3">
          <Example label="Now you can" text="Make a cross-country roadtrip" />
          <Example
            label="So you don't have to"
            text="Plan a journey around daylight, weather, and where you can stop"
          />
        </div>
      </div>

      <p className="prose-editorial mt-6">
        When we introduce technology into our life, there are usually two consequences that
        follow: 1) you are no longer able to do some of the things you've done before, and
        2) now you have to do something else. Let's reconsider the invention of the
        automobile and the highway.
      </p>

      <div className="surface mt-5 px-5 py-4">
        <div className="flex flex-col gap-3">
          <Example label="You're no longer able to" text="Wander and explore on foot" assistant />
          <Example label="Now you'll have to" text="Purchase and maintain a vehicle" assistant />
        </div>
      </div>

      <p className="prose-editorial mt-6">
        Some technologies have significant trade-offs, while others do not. It's important
        to consider the impact of our decisions, for ourselves and for others.
      </p>

      <p className="prose-editorial mt-4">
        While technology promises to make our lives better, this activity will ask you to
        decide if the consequences are worth it.
      </p>
    </motion.div>
  )
}

function Example({
  label,
  text,
  assistant,
}: {
  label: string
  text: string
  assistant?: boolean
}) {
  return (
    <div>
      <span
        className="type-eyebrow block"
        style={assistant ? { color: 'var(--color-blue-ink)' } : undefined}
      >
        {label}
      </span>
      <span className="prose-editorial !text-[0.98rem] block">{text}</span>
    </div>
  )
}

/* ==========================================================================
   Decide — one at a time, the way you clear unread messages
   ========================================================================== */

function Decide({
  practice,
  onRefuse,
}: {
  practice: Practice
  onRefuse: (id: string) => void
}) {
  const { dispatch, doc } = useStore()

  const behind = useMemo(
    () => doc.practices.filter((p) => p.decision === 'pending' && p.id !== practice.id).length,
    [doc.practices, practice.id],
  )

  /* Both outcomes write the same shape. Refusing is not a different kind of
     answer, it is the same bargain read the other way round. */
  const decide = (decision: 'kept' | 'refused') => {
    dispatch({ type: 'patchPractice', id: practice.id, patch: { decision } })
    if (decision === 'refused') onRefuse(practice.id)
  }

  return (
    <motion.div {...fade} className="pt-4">
      <p className="type-eyebrow mb-4">The bargain</p>

      {/* The stack: what is still waiting shows behind the card. */}
      <div className="relative">
        {behind > 0 && (
          <span className="surface absolute inset-x-3 -bottom-2 h-8 rounded-b-[14px]" aria-hidden="true" />
        )}
        {behind > 1 && (
          <span className="surface absolute inset-x-6 -bottom-4 h-8 rounded-b-[14px] opacity-60" aria-hidden="true" />
        )}

        <div className="surface-raised relative px-5 py-6">
          <h2 className="type-h2">{practice.thing}</h2>
          <hr className="hairline my-5" />

          {/* Shown as it will be kept. Refusing turns the same four rows
              around rather than replacing them with a paragraph. */}
          <BargainRows practice={practice} />
        </div>
      </div>

      <p className="type-caption mt-8 mb-4 text-center">
        Talk it over as a family. Is the trade worth it?
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => decide('refused')}
          className="btn flex-1 !py-4"
          style={{
            background: 'var(--color-decline-wash)',
            color: 'var(--color-decline)',
            borderColor: 'color-mix(in srgb, var(--color-decline) 34%, transparent)',
          }}
        >
          <Cross size={17} />
          Refuse
        </button>
        <button
          type="button"
          onClick={() => decide('kept')}
          className="btn flex-1 !py-4"
          style={{
            background: 'var(--color-affirm-wash)',
            color: 'var(--color-affirm)',
            borderColor: 'color-mix(in srgb, var(--color-affirm) 34%, transparent)',
          }}
        >
          <Check size={17} />
          Accept
        </button>
      </div>
    </motion.div>
  )
}

/* ==========================================================================
   Refused — the same card the document will hold, before moving on
   ========================================================================== */

/**
 * What refusing actually said.
 *
 * The four rows turn around when a bargain is declined, and that reversal is
 * the whole lesson: what you will still have to do, what you can still do.
 * Showing it here, full page, means the family reads their own decision
 * rather than discovering it later on a card they happen to tap.
 */
function Refused({ practice }: { practice: Practice }) {
  const { dispatch } = useStore()

  return (
    <motion.div {...fade} className="pt-4">
      <p className="type-eyebrow mb-4">The bargain</p>

      <div className="flex items-start gap-3">
        <span
          className="mt-[7px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{
            background: 'var(--color-decline-wash)',
            color: 'var(--color-decline)',
          }}
        >
          <Cross size={14} />
        </span>
        <h2 className="type-h1">{practice.thing}</h2>
      </div>

      <hr className="hairline my-6" />

      <BargainRows
        practice={practice}
        onEdit={(patch) => dispatch({ type: 'patchPractice', id: practice.id, patch })}
      />
    </motion.div>
  )
}
