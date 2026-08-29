import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '~/app/store'
import { Preamble } from '~/document/Preamble'
import { PracticesSection } from '~/document/sections/PracticesSection'
import { PraxisSection } from '~/document/sections/PraxisSection'
import { TelosSection } from '~/document/sections/TelosSection'
import { ValuesSection } from '~/document/sections/ValuesSection'
import { Signatures } from '~/document/Signatures'
import { Definition } from '~/document/Definition'
import { Lock, Tick } from '~/components/Bits'
import { ArrowLeft, IconButton } from '~/components/Bits'
import type { PanelId, SectionId } from '~/lib/types'

/**
 * The foundation page.
 *
 * One continuous document the family drafts by working down it. Everything
 * arrives closed — a heading and an arrow, Notion-style — so the page is a
 * table of its own contents until the family opens the part they are on.
 *
 * Sections they have not unlocked collapse to a greyed heading with nothing
 * underneath: enough to see that something is coming, nothing to scroll into.
 */
export function Document() {
  const { doc, dispatch, nav, clearJump, goCover, unlocked, openActivity } = useStore()
  const scroller = useRef<HTMLDivElement>(null)

  const jump = (id: SectionId, behavior: ScrollBehavior = 'smooth') => {
    const el = scroller.current
    const node = el?.querySelector<HTMLElement>(`[data-section="${id}"]`)
    if (el && node) el.scrollTo({ top: node.offsetTop - 8, behavior })
  }

  /**
   * Go to a section, now.
   *
   * The page jumps — no easing to sit through. The repeats are not a second
   * movement, they are the same one landing again once the panels have
   * finished opening and the page is its real height.
   */
  const goTo = (id: SectionId) => {
    jump(id, 'auto')
    const timers = [60, 320].map((ms) => window.setTimeout(() => jump(id, 'auto'), ms))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }

  /**
   * How the Apply and Revisit links move.
   *
   * Everything closes, the destination opens, the page goes there. A
   * sub-section has to name its parent too — Praxis lives inside Family
   * Portrait, and opening it while the Portrait is shut would leave the
   * family looking at nothing.
   */
  const reveal = (section: SectionId, open: PanelId[]) => {
    dispatch({ type: 'focusPanel', open })
    goTo(section)
  }

  /* An activity that has just handed its result back asks for a section by
     name. The pin holds that heading at the top while the panel underneath
     it opens, so the page settles where it was aimed. */
  useEffect(() => {
    if (!nav.jumpTo) return
    const id = nav.jumpTo
    clearJump()
    return goTo(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav.jumpTo])

  /**
   * Finishing an activity opens the next door.
   *
   * Origin unlocks Family Practices and hands the family straight to it.
   * The other two activities place the family themselves on the way out —
   * they land on their own section, where the work they just did is now
   * sitting with a reading underneath it.
   *
   * The ref is seeded on the first pass rather than acted on: arriving at a
   * finished document should leave the page exactly as the family left it.
   */
  const landedOn = useRef<string | null | undefined>(undefined)
  useEffect(() => {
    if (nav.activity) return
    const key = doc.completed.origin ? 'origin' : null
    if (landedOn.current === undefined) {
      landedOn.current = key
      return
    }
    if (!key || landedOn.current === key) return
    landedOn.current = key
    dispatch({ type: 'focusPanel', open: ['practices'] })
    window.setTimeout(() => goTo('practices'), 80)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.completed.origin, nav.activity])

  return (
    <div className="relative z-1 flex min-h-0 flex-1 flex-col">
      <header className="print-hide relative z-10 flex shrink-0 items-center gap-3 border-b border-[var(--color-rule)] bg-[var(--color-paper)] px-4 pt-[max(0.85rem,env(safe-area-inset-top))] pb-3">
        <IconButton label="Back to contents" onClick={goCover}>
          <ArrowLeft />
        </IconButton>
        <p className="type-eyebrow flex-1 truncate text-center">
          {doc.origin.familyName.trim()
            ? `${doc.origin.familyName.trim()} Family Foundation`
            : 'Your Family Foundation'}
        </p>
        <span className="w-10" aria-hidden="true" />
      </header>

      <div ref={scroller} className="scroll-quiet relative min-h-0 flex-1 overflow-y-auto">
        <div className="px-7 pt-8 pb-28">
          <Section
            id="portrait"
            panel="portrait"
            eyebrow="Activity one"
            title="Family Portrait"
            done={
              doc.completed.origin &&
              !!doc.praxisStatement.trim() &&
              !!doc.telosStatement.trim()
            }
            blurb={
              'This activity describes who we are and the type of people we are ' +
              'becoming.\n\nThe origin of our story, the direction we are headed, and how ' +
              'we get there help us navigate challenges, change, and even emerging ' +
              'technology like AI.\n\nComplete all activities to complete your Family ' +
              'Portrait. You can edit this at any time.'
            }
            locked={!unlocked('portrait')}
          >
            <Part
              panel="origin"
              title="Origin"
              done={doc.completed.origin}
              note={
                <Definition term="or·i·gin" sense="the point or place where something begins.">
                  Our family Origin informs who we are today. Though it is not everything,
                  knowing where we come from contributes to who we are becoming.
                </Definition>
              }
            >
              {doc.completed.origin ? (
                <Preamble editable />
              ) : (
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={() => openActivity('origin')}
                >
                  Start Activity
                </button>
              )}
            </Part>

            <Part
              panel="praxis"
              title="Praxis"
              locked={!doc.praxisStatement.trim()}
              done={!!doc.praxisStatement.trim()}
              note={
                <Definition
                  term="prax·is"
                  sense="the practical application of ideas, lessons, and theory."
                  unlock={
                    doc.praxisStatement.trim()
                      ? undefined
                      : 'Complete the Origin and Family Practices Activity to unlock this section.'
                  }
                >
                  The family Praxis includes commitments, habits, and behaviors that shape us
                  over time.
                </Definition>
              }
            >
              <PraxisSection onRevisit={() => reveal('practices', ['practices'])} />
            </Part>

            <Part
              panel="telos"
              title="Telos"
              locked={!doc.telosStatement.trim()}
              done={!!doc.telosStatement.trim()}
              note={
                <Definition
                  term="te·los"
                  sense="the ultimate goal, end, or vision of the good life that we aim to live toward."
                  unlock={
                    doc.telosStatement.trim()
                      ? undefined
                      : 'Complete the Praxis section and the Family Values Activity to unlock this section.'
                  }
                >
                  Our family Telos is informed by our deepest desires and affections.
                </Definition>
              }
            >
              <TelosSection onRevisit={() => reveal('values', ['values'])} />
            </Part>
          </Section>

          <Section
            id="practices"
            panel="practices"
            eyebrow="Activity two"
            title="Family Practices"
            done={doc.completed.practices}
            blurb={
              'This activity examines the consequences of technology that we take for ' +
              'granted.\n\nWhat we choose to embrace on a small scale can help inform the ' +
              'Praxis that we want our family to live by.'
            }
            locked={!unlocked('practices')}
          >
            <PracticesSection onApplyToPraxis={() => reveal('portrait', ['portrait', 'praxis'])} />
          </Section>

          <Section
            id="values"
            panel="values"
            eyebrow="Activity three"
            title="Family Values"
            done={doc.completed.values}
            blurb={
              'This activity presents two values at a time and asks you to decide what ' +
              'matters more.\n\nThe things we value point toward a vision of the good life. ' +
              'Your top three values will inform your Telos statement.'
            }
            locked={!unlocked('values')}
          >
            <ValuesSection onApplyToTelos={() => reveal('portrait', ['portrait', 'telos'])} />
          </Section>

          {/* The epilogue is never shown greyed. It is not a section the
              family scrolls past waiting for — it simply appears once the
              three sessions are behind them. */}
          {unlocked('signatures') && <Signatures />}
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   Pieces of the page
   ========================================================================== */

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="transition-transform duration-300"
      style={{ transform: open ? 'rotate(90deg)' : 'none' }}
    >
      <path
        d="M5 2.5 L10 7 L5 11.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Section({
  id,
  panel,
  eyebrow,
  title,
  blurb,
  children,
  locked,
  done,
}: {
  id: SectionId
  panel: PanelId
  eyebrow: string
  title: string
  blurb?: string
  children: ReactNode
  locked?: boolean
  /** Green tick beside the heading once every part of it is written. */
  done?: boolean
}) {
  const { dispatch, isOpen } = useStore()
  const open = isOpen(panel)

  if (locked) {
    return (
      <section data-section={id} className="pt-14">
        <div className="pointer-events-none select-none opacity-[0.34]">
          <p className="type-eyebrow mb-3">{eyebrow}</p>
          <div className="flex items-center gap-2.5">
            <h2 className="type-h1">{title}</h2>
            <span className="text-[var(--color-muted)]">
              <Lock size={17} />
            </span>
          </div>
          <hr className="hairline my-5" />
        </div>
      </section>
    )
  }

  return (
    <section data-section={id} className="scroll-mt-4 pt-14 first:pt-0">
      <p className="type-eyebrow mb-3">{eyebrow}</p>

      <button
        type="button"
        onClick={() => dispatch({ type: 'togglePanel', panel })}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 text-left"
      >
        <span className="text-[var(--color-muted)]">
          <Chevron open={open} />
        </span>
        <h2 className="type-h1">{title}</h2>
        {done && (
          <span className="text-[var(--color-affirm)]">
            <Tick size={17} delay={0.45} />
          </span>
        )}
      </button>

      {/* One line under every header, open or closed. The only rule on the
          page, so nothing else has to be reasoned about. */}
      <hr className="hairline my-5" />

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {blurb && <p className="type-caption mb-8 whitespace-pre-line">{blurb}</p>}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/** A sub-part of a section, with its own arrow. */
function Part({
  panel,
  title,
  note,
  children,
  locked,
  done,
}: {
  panel: PanelId
  title: string
  note?: ReactNode
  children: ReactNode
  /** Closed, greyed and padlocked until its turn comes. */
  locked?: boolean
  /** Green tick beside the heading, in the padlock's place. */
  done?: boolean
}) {
  const { dispatch, isOpen } = useStore()
  const open = isOpen(panel) && !locked

  /* Locked reads the same as a locked activity heading: greyed, padlocked
     and inert — and closed. Showing the description of a section nobody can
     open yet only gives the family something to scroll past. */
  if (locked) {
    return (
      <div className="border-t border-[var(--color-rule)] py-6 first:border-t-0 first:pt-0">
        <div className="pointer-events-none flex select-none items-center gap-2.5 opacity-[0.34]">
          <span className="w-[13px]" aria-hidden="true" />
          <h3 className="type-h2">{title}</h3>
          <span className="text-[var(--color-muted)]">
            <Lock size={14} />
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-[var(--color-rule)] py-6 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={() => dispatch({ type: 'togglePanel', panel })}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 text-left"
      >
        <span className="text-[var(--color-muted)]">
          <Chevron open={open} />
        </span>
        <h3 className="type-h2">{title}</h3>
        {done && (
          <span className="text-[var(--color-affirm)]">
            <Tick size={14} delay={0.45} />
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              {note && <div className="mb-5">{note}</div>}
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Preamble }
