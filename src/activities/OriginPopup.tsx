import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '~/app/store'
import { Popup } from '~/components/Popup'
import { Preamble } from '~/document/Preamble'
import { Close, Handoff } from '~/components/Bits'

/**
 * Origin, as its own activity.
 *
 * Not a wizard. One scrollable page that grows downward: every question the
 * family has answered stays on screen and stays editable, so scrolling up to
 * fix an earlier answer is just scrolling. What they have not reached yet is
 * not rendered at all — there is nothing below to scroll into.
 */
export function OriginPopup() {
  const { doc, dispatch, closeActivity } = useStore()
  const step = Math.max(1, doc.originStep)

  const nameList = (arr: { name: string }[], fallback: string) =>
    arr.length ? nameSentence(arr.map((p) => p.name)) : fallback

  /**
   * Who the phone goes to for the second half.
   *
   * Kids if there are any, because the question lands better asked upward.
   * But a group of adults is an ordinary family, and telling them to hand the
   * phone to children who are not in the room is worse than not asking. With
   * one person there is nobody to hand it to, so the step disappears.
   */
  const kids = doc.participants.filter((p) => p.standing === 'kid')
  const receivers = kids.length ? kids : doc.participants.slice(1)
  const handsOff = receivers.length > 0

  const [members, setMembers] = useState<string[]>(
    doc.origin.memberNames.length ? doc.origin.memberNames : ['', '', ''],
  )
  const filled = members.map((m) => m.trim()).filter(Boolean)

  const o = doc.origin
  const patch = (p: Partial<typeof o>) => dispatch({ type: 'patchOrigin', patch: p })
  const go = (n: number) => dispatch({ type: 'setOriginStep', step: n })
  const family = o.familyName.trim() || 'ㅤ'

  /* Members live in local state while they are being typed so a half-typed
     name does not churn the document on every keystroke. */
  const saveMembers = () => patch({ memberNames: filled })

  return (
    <Popup title="Family Origin Activity" onClose={closeActivity}>
      <div className="flex flex-col gap-9 pb-4">
        <Reveal>
          <Bullet>
            <Question
              text="Who is in our family?"
              help="List everyone in your immediate family, not just the people in this room."
            />
            <ul className="mt-4 flex flex-col gap-1">
              {members.map((m, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <input
                    className="field flex-1 !py-1.5"
                    value={m}
                    placeholder="First name"
                    autoComplete="off"
                    aria-label={`Family member ${i + 1}`}
                    onChange={(e) =>
                      setMembers((ms) => ms.map((x, xi) => (xi === i ? e.target.value : x)))
                    }
                    onBlur={saveMembers}
                  />
                  {members.length > 1 && (
                    <button
                      type="button"
                      aria-label="Remove"
                      className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-decline)]"
                      onClick={() =>
                        setMembers((ms) => {
                          const next = ms.filter((_, xi) => xi !== i)
                          patch({ memberNames: next.map((x) => x.trim()).filter(Boolean) })
                          return next
                        })
                      }
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
          </Bullet>

          <Bullet>
            <Question text="Where does our family live?" />
            <Fragment>
              Today, {filled.length ? nameSentence(filled) : 'we'} live in <Slot value={o.livesIn} />.
            </Fragment>
            <textarea
              className="field-area mt-3"
              rows={2}
              value={o.livesIn}
              placeholder="A yellow house on Olive Avenue"
              onChange={(e) => patch({ livesIn: e.target.value })}
            />
          </Bullet>

          {step === 1 && (
            <Next
              disabled={!filled.length || !o.livesIn.trim()}
              onClick={() => {
                saveMembers()
                go(handsOff ? 2 : 3)
              }}
            />
          )}
        </Reveal>

        {step >= 2 && handsOff && (
          <Reveal>
            <Handoff
              to={nameList(receivers, 'someone else')}
              asking={`${nameList(receivers, 'You')}, ask the following questions out loud, and listen to each answer. Ask follow-up questions if you'd like! When you are ready, type the answers in the fields below.`}
            />
            {step === 2 && <Next onClick={() => go(3)} label="Continue" />}
          </Reveal>
        )}

        {step >= 3 && (
          <Reveal>
            <Bullet>
              <Question text="When did our family start?" />
              <Fragment>
                The {family} family began <Slot value={o.startedWhen} />.
              </Fragment>
              <textarea
                className="field-area mt-3"
                rows={2}
                value={o.startedWhen}
                placeholder="e.g., On this date; during a season; when this moment happened"
                onChange={(e) => patch({ startedWhen: e.target.value })}
              />
            </Bullet>

            <Bullet>
              <Question text="Where did our family start?" />
              {/* No baked-in preposition: the answer might begin "at", "in",
                  or with no preposition at all. */}
              <Fragment>
                The {family} family began{o.startedWhen.trim() ? ` ${o.startedWhen.trim()}` : ''}{' '}
                <Slot value={o.startedWhere} />.
              </Fragment>
              <textarea
                className="field-area mt-3"
                rows={2}
                value={o.startedWhere}
                placeholder="e.g., In the city of; at this building; amongst family"
                onChange={(e) => patch({ startedWhere: e.target.value })}
              />
            </Bullet>

            <Bullet>
              <Question text="Why did our family start?" />
              <Fragment>
                Together, they started a family because <Slot value={o.startedWhy} />.
              </Fragment>
              <textarea
                className="field-area mt-3"
                rows={2}
                value={o.startedWhy}
                placeholder="e.g., They loved each other; they believed in something bigger; they hoped for a better future"
                onChange={(e) => patch({ startedWhy: e.target.value })}
              />
            </Bullet>

            {step === 3 && (
              <Next
                disabled={!o.startedWhere.trim() || !o.startedWhen.trim() || !o.startedWhy.trim()}
                onClick={() => go(4)}
              />
            )}
          </Reveal>
        )}

        {step >= 4 && (
          <Reveal>
            <p className="type-eyebrow mb-1.5">Your preamble</p>
            {/* Editable here, because this is where a family notices a stray
                word or a doubled full stop and wants it gone now. */}
            <Preamble editable />
            <button
              type="button"
              className="btn btn-primary mt-7 w-full"
              onClick={() => {
                dispatch({ type: 'completeOrigin' })
                closeActivity()
              }}
            >
              Save
            </button>
          </Reveal>
        )}
      </div>
    </Popup>
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
      className="flex scroll-mt-4 flex-col gap-9"
    >
      {children}
    </motion.div>
  )
}

/**
 * One question in the outline. A text box is enough on its own to separate
 * one question from the next; a bullet beside it was decoration.
 */
function Bullet({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}

/** "A", "A and B", "A, B, and C". */
function nameSentence(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

function Question({ text, help }: { text: string; help?: string }) {
  return (
    <>
      <h3 className="type-h3">{text}</h3>
      {help && <p className="type-caption mt-1.5">{help}</p>}
    </>
  )
}

/**
 * The sentence this answer is going into, shown while they type it. The
 * origin sentence reads in a fixed tense, and the surest way to get an
 * answer that fits is to show the family the sentence they are completing.
 * It is the only guidance the field gets — a second generic instruction on
 * top of it would just be noise.
 */
function Fragment({ children }: { children: ReactNode }) {
  return (
    <p className="prose-editorial mt-3 !text-[0.98rem] text-[var(--color-muted)] italic">
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
    <span className="border-b-[1.5px] border-[var(--color-ochre)] px-[0.08em] text-[var(--color-ink)] not-italic">
      {value.trim()}
    </span>
  )
}

function Next({
  onClick,
  disabled,
  label = 'Continue',
}: {
  onClick: () => void
  disabled?: boolean
  label?: string
}) {
  return (
    <button
      type="button"
      className="btn btn-primary w-full"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
