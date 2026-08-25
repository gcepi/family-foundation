import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '~/app/store'
import { Preamble } from '~/document/Preamble'
import { ArrowRight, Close, Handoff } from '~/components/Bits'

/**
 * Origin, written straight into the document.
 *
 * Each answered question reveals the next one below it and scrolls it into
 * view, so the page grows downward under the family's hands. They are not
 * visiting an activity and coming back with a result; they are watching
 * their own document fill in.
 */
export function OriginSection() {
  const { doc, dispatch } = useStore()
  const step = doc.originStep

  const grownups = doc.participants.filter((p) => p.standing === 'grownup')
  const kids = doc.participants.filter((p) => p.standing === 'kid')
  const nameList = (arr: { name: string }[], fallback: string) =>
    arr.length ? arr.map((p) => p.name).join(' and ') : fallback

  const [members, setMembers] = useState<string[]>(
    doc.origin.memberNames.length ? doc.origin.memberNames : ['', '', ''],
  )
  const filled = members.map((m) => m.trim()).filter(Boolean)

  const o = doc.origin
  const patch = (p: Partial<typeof o>) => dispatch({ type: 'patchOrigin', patch: p })
  const go = (n: number) => dispatch({ type: 'setOriginStep', step: n })

  /* Finished: the questions have done their job and the sentence replaces
     them. Anything wrong with it is fixed by tapping the word itself. */
  if (doc.completed.origin) {
    return <Preamble editable />
  }

  const saveMembers = () => patch({ memberNames: filled })

  return (
    <div className="flex flex-col gap-8">
      {step === 0 && (
        <Reveal>
          <p className="type-caption mb-5 max-w-[34ch]">
            Four angles — who, where, when, and why. One of you asks, the other answers out
            loud, and then it goes on the page.
          </p>
          <button type="button" className="btn btn-primary w-full" onClick={() => go(1)}>
            Start
            <ArrowRight />
          </button>
        </Reveal>
      )}

      {step >= 1 && (
        <Reveal>
          <Asker>{nameList(grownups, 'Grown-ups')} — ask the kids</Asker>

          <Question text="Who is in our family?" help="Everyone. Not only the people in this room." />
          <ul className="mt-4">
            {members.map((m, i) => (
              <li key={i} className="flex items-end gap-2 py-2">
                <input
                  className="field flex-1"
                  value={m}
                  placeholder="First name"
                  autoComplete="off"
                  aria-label={`Family member ${i + 1}`}
                  disabled={step > 1}
                  onChange={(e) =>
                    setMembers((ms) => ms.map((x, xi) => (xi === i ? e.target.value : x)))
                  }
                />
                {members.length > 1 && step === 1 && (
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
          {step === 1 && (
            <button
              type="button"
              className="btn btn-ghost mt-3 !py-2 !text-[0.85rem]"
              onClick={() => setMembers((ms) => [...ms, ''])}
            >
              Add someone
            </button>
          )}

          <hr className="hairline my-8" />

          <Question text="Where does our family live?" />
          <Fragment>
            Today, {filled.length ? filled.join(', ') : 'we'} live in <Slot value={o.livesIn} />.
          </Fragment>
          <input
            className="field mt-3"
            value={o.livesIn}
            disabled={step > 1}
            onChange={(e) => patch({ livesIn: e.target.value })}
            placeholder="a yellow house on Lorain Avenue"
            autoComplete="off"
          />

          {step === 1 && (
            <Next
              disabled={!filled.length || !o.livesIn.trim()}
              onClick={() => {
                saveMembers()
                go(2)
              }}
            />
          )}
        </Reveal>
      )}

      {step >= 2 && (
        <Reveal>
          <Handoff
            to={nameList(kids, 'the kids')}
            asking="Three questions for the grown-ups. Ask them out loud, listen to the answer, then write it down."
          />
          {step === 2 && <Next onClick={() => go(3)} label="Continue" />}
        </Reveal>
      )}

      {step >= 3 && (
        <Reveal>
          <Asker>{nameList(kids, 'Kids')} — ask the grown-ups</Asker>

          <Question text="Where did our family start?" />
          <Fragment>
            The {o.familyName} family began in <Slot value={o.startedWhere} />.
          </Fragment>
          <input
            className="field mt-3"
            value={o.startedWhere}
            disabled={step > 3}
            onChange={(e) => patch({ startedWhere: e.target.value })}
            placeholder="a rented apartment in Cleveland"
            autoComplete="off"
          />

          <hr className="hairline my-8" />

          <Question
            text="When did our family start?"
            help="Finish the sentence below — it needs something that happened, not a date on its own."
          />
          <Fragment>
            …began in {o.startedWhere || '…'} when <Slot value={o.startedWhen} />.
          </Fragment>
          <input
            className="field mt-3"
            value={o.startedWhen}
            disabled={step > 3}
            onChange={(e) => patch({ startedWhen: e.target.value })}
            placeholder="Mom finished nursing school"
            autoComplete="off"
          />

          <hr className="hairline my-8" />

          <Question text="Why did our family start?" />
          <Fragment>
            Together, they started a family because <Slot value={o.startedWhy} />.
          </Fragment>
          <textarea
            className="field-area mt-3"
            rows={3}
            value={o.startedWhy}
            disabled={step > 3}
            onChange={(e) => patch({ startedWhy: e.target.value })}
            placeholder="we wanted somewhere the people we loved could always come back to"
          />

          {step === 3 && (
            <Next
              disabled={
                !o.startedWhere.trim() || !o.startedWhen.trim() || !o.startedWhy.trim()
              }
              onClick={() => go(4)}
            />
          )}
        </Reveal>
      )}

      {step >= 4 && (
        <Reveal>
          <p className="type-eyebrow mb-3">Your preamble</p>
          <Preamble />
          <button
            type="button"
            className="btn btn-primary mt-7 w-full"
            onClick={() => dispatch({ type: 'completeOrigin' })}
          >
            Save
          </button>
        </Reveal>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */

/** Appears, then brings itself into view. This is the downward pull. */
function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    const t = window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      className="scroll-mt-6"
    >
      {children}
    </motion.div>
  )
}

function Asker({ children }: { children: ReactNode }) {
  return <p className="type-eyebrow mb-4">{children}</p>
}

function Question({ text, help }: { text: string; help?: string }) {
  return (
    <>
      <h3 className="type-h2">{text}</h3>
      {help && <p className="type-caption mt-2">{help}</p>}
    </>
  )
}

/**
 * The sentence this answer is going into, shown while they type it. The
 * origin sentence reads in a fixed tense, and the surest way to get an
 * answer that fits is to show the family the sentence they are completing.
 */
function Fragment({ children }: { children: ReactNode }) {
  return (
    <p className="prose-editorial mt-4 !text-[0.98rem] text-[var(--color-muted)] italic">
      {children}
    </p>
  )
}

/** The live value if there is one, otherwise the ruled space waiting for it. */
function Slot({ value }: { value: string }) {
  if (!value.trim()) {
    return (
      <span
        className="mx-[0.1em] inline-block w-[8ch] translate-y-[0.1em] border-b-[1.5px] border-[var(--color-ochre)]"
        aria-label="your answer"
      >
        &nbsp;
      </span>
    )
  }
  return (
    <span className="border-b-[1.5px] border-[var(--color-ochre)] px-[0.08em] not-italic text-[var(--color-ink)]">
      {value.trim()}
    </span>
  )
}

function Next({
  onClick,
  disabled,
  label = 'Next',
}: {
  onClick: () => void
  disabled?: boolean
  label?: string
}) {
  return (
    <button type="button" className="btn btn-primary mt-8 w-full" disabled={disabled} onClick={onClick}>
      {label}
      <ArrowRight />
    </button>
  )
}
