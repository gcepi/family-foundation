import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '~/app/store'
import { Popup } from '~/components/Popup'
import { ArrowRight, Check, Cross, Ticks } from '~/components/Bits'
import { InlineEdit } from '~/components/InlineEdit'
import { Thinking } from '~/components/Assistant'
import { RuleWithTick } from '~/illustrations'
import { DOMAINS } from '~/data/domains'
import { composeBargain, composeRefusal, think } from '~/lib/assistant'
import type { Practice, Refusal } from '~/lib/types'

const uid = () => Math.random().toString(36).slice(2, 10)

const fade = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] as const },
}

type Phase = 'brainstorm' | 'input' | 'teaching' | 'composing' | 'decide'

export function PracticesPopup() {
  const { doc, dispatch, closeActivity } = useStore()
  const people = doc.participants

  const resuming = doc.practices.length > 0
  const [phase, setPhase] = useState<Phase>(resuming ? 'decide' : 'brainstorm')
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
    think(() => built.map((p) => ({ ...p, bargain: composeBargain(p) })), 2600).then((withBargains) => {
      if (!live) return
      dispatch({ type: 'setPractices', practices: withBargains })
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
    dispatch({ type: 'completePractices' })
    closeActivity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, pending.length, doc.practices.length])

  const backTo: Record<Phase, Phase | null> = {
    brainstorm: null,
    input: 'brainstorm',
    teaching: 'input',
    composing: null,
    decide: null,
  }

  return (
    <Popup
      title="Family Practices"
      onClose={closeActivity}
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
        phase === 'brainstorm' ? (
          <button type="button" className="btn btn-primary w-full" onClick={() => setPhase('input')}>
            Continue
            <ArrowRight />
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
            <ArrowRight />
          </button>
        ) : phase === 'teaching' ? (
          <button type="button" className="btn btn-primary w-full" onClick={() => setPhase('composing')}>
            Continue
          </button>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait">
        {phase === 'brainstorm' && <Brainstorm key="brainstorm" />}

        {phase === 'input' && people[who] && (
          <motion.div key={`input-${who}`} {...fade} className="pt-4">
            <p className="type-eyebrow">
              {who === 0
                ? `${people[who].name}'s turn`
                : `Hand the phone to ${people[who].name}`}
            </p>
            <h2 className="type-h2 mt-4">What do you want to automate?</h2>
            <p className="type-caption mt-2">Your one favorite from the list. Just the thing itself.</p>
            <input
              className="field mt-4"
              value={draft.thing}
              onChange={(e) => setDraft({ thing: e.target.value })}
              placeholder="Homework, laundry, the drive to school…"
              autoComplete="off"
            />

            <hr className="hairline my-9" />

            <h2 className="type-h2">So you'll no longer have to…</h2>
            <p className="type-caption mt-2">Finish the sentence. What does it get you out of?</p>
            <textarea
              className="field-area mt-4"
              rows={3}
              value={draft.relief}
              onChange={(e) => setDraft({ relief: e.target.value })}
              placeholder="…spend an hour every night at the kitchen table"
            />
          </motion.div>
        )}

        {phase === 'teaching' && <BargainPrimer key="teaching" />}

        {phase === 'composing' && (
          <motion.div key="composing" {...fade} className="flex h-full flex-col justify-center">
            <Thinking />
            <p className="type-caption mx-auto max-w-[26ch] text-center">
              Every bargain has four parts. You named two of them.
            </p>
          </motion.div>
        )}

        {phase === 'decide' && pending[0] && <Decide key={pending[0].id} practice={pending[0]} />}
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
      <h2 className="type-h1">Everything you'd hand over</h2>
      <RuleWithTick className="my-5" />
      <p className="prose-editorial">
        Two minutes. Write down anything and everything your family would automate if it
        could. The sky is the limit — this is not limited to what is possible today.
      </p>
      <p className="prose-editorial mt-4">
        No hedging. Nothing gets judged yet. Write it all on paper.
      </p>

      {/* Timer */}
      <button
        type="button"
        onClick={() => (left === 0 ? (setLeft(TOTAL), setRunning(true)) : setRunning((r) => !r))}
        className="surface-raised mt-7 flex w-full items-center gap-4 px-5 py-4"
      >
        <span className="relative h-12 w-12 shrink-0">
          <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
            <circle cx="24" cy="24" r="21" stroke="var(--color-rule)" strokeWidth="2" fill="none" />
            <circle
              cx="24"
              cy="24"
              r="21"
              stroke="var(--color-ochre)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 21}
              strokeDashoffset={2 * Math.PI * 21 * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
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
        <p className="type-eyebrow mb-3">If you get stuck</p>
        <div className="flex flex-col gap-3">
          {DOMAINS.map((d) => (
            <div key={d.name} className="surface px-4 py-3">
              <p className="type-h3 mb-1.5">{d.name}</p>
              <p className="type-caption">{d.items.join(' · ')}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="type-caption mt-7 max-w-[32ch]">
        When time is up, everyone circles one favorite. You can come back to the rest.
      </p>
    </motion.div>
  )
}

/* ==========================================================================
   The primer — what the assistant is about to do, and why
   ========================================================================== */

function BargainPrimer() {
  const rows = [
    { label: 'Now you can', note: 'the new ability — the reason anyone wants it', ours: true },
    { label: "You'll no longer have to", note: 'the burden it lifts', ours: true },
    { label: "You're no longer able to", note: 'the ability quietly handed over with it', ours: false },
    { label: "Now you'll have to", note: 'the new obligation that arrives in its place', ours: false },
  ]

  return (
    <motion.div {...fade} className="pt-4">
      <h2 className="type-h1">The bargain</h2>
      <RuleWithTick className="my-5" />
      <p className="prose-editorial">
        Every tool a family adopts is a trade, and the trade has four parts. Two of them get
        advertised. Two of them do not.
      </p>

      <div className="mt-7 flex flex-col">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex gap-3.5 border-b border-[var(--color-rule)] py-3.5 last:border-0"
          >
            <span
              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: r.ours ? 'var(--color-ochre)' : 'var(--color-blue-ink)' }}
            />
            <span>
              <span className="type-h3 block">{r.label}…</span>
              <span className="type-caption">{r.note}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="prose-editorial mt-7">
        You have already named the first two for yourselves. The assistant's only job is to
        name the other two — not to talk you out of anything. What you do with them is your
        family's call.
      </p>
    </motion.div>
  )
}

/* ==========================================================================
   Decide — one at a time, the way you clear unread messages
   ========================================================================== */

function Decide({ practice }: { practice: Practice }) {
  const { dispatch, participantName, doc } = useStore()
  const [refusing, setRefusing] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [refusal, setRefusal] = useState<Refusal | null>(null)

  const behind = useMemo(
    () => doc.practices.filter((p) => p.decision === 'pending' && p.id !== practice.id).length,
    [doc.practices, practice.id],
  )

  const keep = () => dispatch({ type: 'patchPractice', id: practice.id, patch: { decision: 'kept' } })

  const refuse = () => {
    setRefusing(true)
    setDrafting(true)
    think(() => composeRefusal(practice), 1500).then((r) => {
      setRefusal(r)
      setDrafting(false)
    })
  }

  const commitRefusal = () =>
    dispatch({
      type: 'patchPractice',
      id: practice.id,
      patch: { decision: 'refused', refusal },
    })

  if (refusing) {
    return (
      <motion.div {...fade} className="pt-4">
        <p className="type-eyebrow" style={{ color: 'var(--color-decline)' }}>
          Turning it down
        </p>
        <h2 className="type-h2 mt-3">{practice.thing}</h2>

        {drafting ? (
          <Thinking label="Putting your refusal into words" />
        ) : refusal ? (
          <>
            <p className="type-caption mt-6 mb-4 max-w-[32ch]">
              A draft, in your voice. Change any part of it — these have to be your words
              before you move on.
            </p>
            <p className="prose-editorial !text-[1.1rem] !leading-[2]">
              We will not{' '}
              <InlineEdit
                label="what we will not do"
                value={refusal.willNot}
                onChange={(v) => setRefusal({ ...refusal, willNot: v })}
              />
              , and will still have to{' '}
              <InlineEdit
                label="what we will still have to do"
                value={refusal.willStillHaveTo}
                onChange={(v) => setRefusal({ ...refusal, willStillHaveTo: v })}
              />
              , so we will still be able to{' '}
              <InlineEdit
                label="what we will still be able to do"
                value={refusal.soStillAble}
                onChange={(v) => setRefusal({ ...refusal, soStillAble: v })}
              />
              , and be able to{' '}
              <InlineEdit
                label="and what else"
                value={refusal.andAble}
                onChange={(v) => setRefusal({ ...refusal, andAble: v })}
              />
              .
            </p>

            <div className="mt-9 flex gap-2.5">
              <button
                type="button"
                className="btn btn-ghost flex-1"
                onClick={() => {
                  setRefusing(false)
                  setRefusal(null)
                }}
              >
                Back
              </button>
              <button type="button" className="btn btn-primary flex-1" onClick={commitRefusal}>
                Save
              </button>
            </div>
          </>
        ) : null}
      </motion.div>
    )
  }

  return (
    <motion.div {...fade} className="pt-4">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="type-eyebrow">{participantName(practice.participantId)} chose</p>
        {behind > 0 && (
          <p className="type-caption text-[0.75rem]">
            {behind} more after this
          </p>
        )}
      </div>

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

          <div className="flex flex-col gap-4">
            <Row tone="ours" label="Now you can" text="hand it over" />
            <Row tone="ours" label="You'll no longer have to" text={practice.relief} />
            <Row tone="theirs" label="You're no longer able to" text={practice.bargain?.noLongerAble ?? ''} />
            <Row tone="theirs" label="Now you'll have to" text={practice.bargain?.nowHaveTo ?? ''} />
          </div>
        </div>
      </div>

      <p className="type-caption mt-8 mb-4 text-center">
        Talk it over as a family. Is the trade worth it?
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={refuse}
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
          onClick={keep}
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

function Row({ label, text, tone }: { label: string; text: string; tone: 'ours' | 'theirs' }) {
  return (
    <div className="flex gap-3">
      <span
        className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: tone === 'ours' ? 'var(--color-ochre)' : 'var(--color-blue-ink)' }}
      />
      <span className="min-w-0">
        <span className="type-eyebrow block">{label}</span>
        <span className="prose-editorial !text-[1.02rem] block">{text}</span>
      </span>
    </div>
  )
}
