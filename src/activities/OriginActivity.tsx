import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '~/app/store'
import { ActivitySheet } from '~/components/ActivitySheet'
import { ArrowRight, Blank, Close, Handoff, Ticks } from '~/components/Bits'
import { RuleWithTick } from '~/illustrations'

const fade = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] as const },
}

export function OriginActivity() {
  const { doc, dispatch, closeActivity } = useStore()
  const [step, setStep] = useState(0)

  const grownups = doc.participants.filter((p) => p.standing === 'grownup')
  const kids = doc.participants.filter((p) => p.standing === 'kid')
  const nameList = (arr: { name: string }[], fallback: string) =>
    arr.length ? arr.map((p) => p.name).join(' and ') : fallback

  const [members, setMembers] = useState<string[]>(
    doc.origin.memberNames.length ? doc.origin.memberNames : ['', '', ''],
  )
  const [livesIn, setLivesIn] = useState(doc.origin.livesIn)
  const [startedWhen, setStartedWhen] = useState(doc.origin.startedWhen)
  const [startedWhere, setStartedWhere] = useState(doc.origin.startedWhere)
  const [startedWhy, setStartedWhy] = useState(doc.origin.startedWhy)

  const filledMembers = members.map((m) => m.trim()).filter(Boolean)

  /* Steps: intro, who+where, handoff, when/where/why started, the preamble. */
  const STEPS = ['intro', 'who', 'handoff', 'beginnings', 'preamble'] as const
  const current = STEPS[step]

  const canAdvance = (() => {
    switch (current) {
      case 'who':
        return filledMembers.length > 0 && livesIn.trim().length > 0
      case 'beginnings':
        return (
          startedWhen.trim().length > 0 &&
          startedWhere.trim().length > 0 &&
          startedWhy.trim().length > 0
        )
      default:
        return true
    }
  })()

  const persist = () =>
    dispatch({
      type: 'patchOrigin',
      patch: {
        memberNames: filledMembers,
        livesIn: livesIn.trim(),
        startedWhen: startedWhen.trim(),
        startedWhere: startedWhere.trim(),
        startedWhy: startedWhy.trim(),
      },
    })

  const next = () => {
    if (current === 'beginnings') persist()
    setStep((s) => Math.min(STEPS.length - 1, s + 1))
  }

  const finish = () => {
    persist()
    dispatch({ type: 'completeOrigin' })
    closeActivity()
  }

  return (
    <ActivitySheet
      title="Family Portrait · Origin"
      onClose={closeActivity}
      onBack={step > 0 ? () => setStep((s) => s - 1) : undefined}
      progress={<Ticks total={STEPS.length} index={step} />}
      footer={
        current === 'preamble' ? (
          <button type="button" className="btn btn-primary w-full" onClick={finish}>
            Write it into the document
          </button>
        ) : (
          <button type="button" className="btn btn-primary w-full" disabled={!canAdvance} onClick={next}>
            {current === 'handoff' ? 'They have it' : 'Next'}
            <ArrowRight />
          </button>
        )
      }
    >
      <AnimatePresence mode="wait">
        {current === 'intro' && (
          <motion.div key="intro" {...fade} className="pt-4">
            <h2 className="type-h1">Origin</h2>
            <RuleWithTick className="my-5" />
            <p className="prose-editorial">
              This activity examines your family identity from four angles: Who, Where, When,
              and Why.
            </p>
            <p className="prose-editorial mt-4">
              Some families assume answers to these questions are common knowledge, others
              don't bother to think about them. The truth is, the beginning is the most
              important part of any story. This activity is an invitation to share the origin
              story if it's for the first time or the hundredth.
            </p>
            <div className="surface mt-7 px-5 py-4">
              <p className="type-eyebrow mb-1.5">Instructions</p>
              <p className="type-caption text-[var(--color-ink)]">
                When asked a question, share the answer with your family first, then fill in
                the text field.
              </p>
            </div>
          </motion.div>
        )}

        {current === 'who' && (
          <motion.div key="who" {...fade} className="pt-4">
            <p className="type-eyebrow">{nameList(grownups, 'Grown-ups')} — ask the kids</p>

            <h2 className="type-h2 mt-4">Who is in our family?</h2>
            <p className="type-caption mt-2">Everyone. Not only the people in this room.</p>

            <ul className="mt-5">
              {members.map((m, i) => (
                <li key={i} className="flex items-end gap-2 py-2">
                  <input
                    className="field flex-1"
                    value={m}
                    placeholder="First name"
                    autoComplete="off"
                    aria-label={`Family member ${i + 1}`}
                    onChange={(e) =>
                      setMembers((ms) => ms.map((x, xi) => (xi === i ? e.target.value : x)))
                    }
                  />
                  {members.length > 1 && (
                    <button
                      type="button"
                      aria-label="Remove"
                      className="mb-1.5 text-[var(--color-muted)] transition-colors hover:text-[var(--color-decline)]"
                      onClick={() => setMembers((ms) => ms.filter((_, xi) => xi !== i))}
                    >
                      <Close />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-ghost mt-3 !py-2 !text-[0.85rem]"
              onClick={() => setMembers((ms) => [...ms, ''])}
            >
              Add someone
            </button>

            <hr className="hairline my-8" />

            <h2 className="type-h2">Where does our family live?</h2>
            <input
              className="field mt-4"
              value={livesIn}
              onChange={(e) => setLivesIn(e.target.value)}
              placeholder="A town, a street, a house"
              autoComplete="off"
            />
          </motion.div>
        )}

        {current === 'handoff' && (
          <motion.div key="handoff" {...fade} className="flex h-full flex-col justify-center py-6">
            <Handoff
              to={nameList(kids, 'the kids')}
              asking="Three questions for the grown-ups. Ask them out loud, listen to the answer, then write it down."
            />
          </motion.div>
        )}

        {current === 'beginnings' && (
          <motion.div key="beginnings" {...fade} className="pt-4">
            <p className="type-eyebrow">{nameList(kids, 'Kids')} — ask the grown-ups</p>

            <h2 className="type-h2 mt-4">When did our family start?</h2>
            <textarea
              className="field-area mt-3"
              rows={3}
              value={startedWhen}
              onChange={(e) => setStartedWhen(e.target.value)}
              placeholder="A year, a season, a day everybody remembers"
            />

            <hr className="hairline my-8" />

            <h2 className="type-h2">Where did our family start?</h2>
            <input
              className="field mt-4"
              value={startedWhere}
              onChange={(e) => setStartedWhere(e.target.value)}
              placeholder="A city, a church, a kitchen"
              autoComplete="off"
            />

            <hr className="hairline my-8" />

            <h2 className="type-h2">Why did our family start?</h2>
            <textarea
              className="field-area mt-3"
              rows={4}
              value={startedWhy}
              onChange={(e) => setStartedWhy(e.target.value)}
              placeholder="Take your time with this one"
            />
          </motion.div>
        )}

        {current === 'preamble' && (
          <motion.div key="preamble" {...fade} className="pt-4">
            <p className="type-eyebrow">Your preamble</p>
            <RuleWithTick className="my-5" />
            <Preamble />
            <p className="type-caption mt-7">
              This opens your family constitution. You can change any part of it later.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </ActivitySheet>
  )
}

/** The filled-in preamble. Shared by the activity and the document itself. */
export function Preamble() {
  const { doc } = useStore()
  const o = doc.origin
  const names = o.memberNames

  return (
    <p className="prose-editorial !text-[1.2rem] !leading-[1.75]">
      The <Blank value={o.familyName} width="8ch" /> family began in{' '}
      <Blank value={o.startedWhere} width="9ch" /> when{' '}
      <Blank value={o.startedWhen} width="11ch" />. Together, they started a family because{' '}
      <Blank value={o.startedWhy} width="13ch" />. Today,{' '}
      {names.length ? (
        names.map((n, i) => (
          <span key={i}>
            {i > 0 && ', '}
            <Blank value={n} width="6ch" />
          </span>
        ))
      ) : (
        <>
          <Blank width="6ch" />, <Blank width="6ch" />, <Blank width="6ch" />
        </>
      )}{' '}
      live in <Blank value={o.livesIn} width="9ch" />.
    </p>
  )
}
