import { useEffect, useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '~/app/store'
import { SectionScrubber, type ScrubSection } from '~/document/SectionScrubber'
import { PracticeCards } from '~/document/PracticeCards'
import { Preamble } from '~/activities/OriginActivity'
import { FinishedDocument } from '~/document/FinishedDocument'
import { ArrowLeft, ArrowRight, IconButton, Lock } from '~/components/Bits'
import { RuleWithTick } from '~/illustrations'
import { SECTION_MARKS } from '~/illustrations/marks'
import { valueById } from '~/data/values'
import type { SectionId } from '~/lib/types'

/**
 * The document.
 *
 * One continuous page from the preamble to the signature line. Opening a
 * "module" from the contents does not open a screen — it drops you at a
 * point in this page, and you can always scroll up to what you already
 * wrote or down to what you have not written yet.
 */
export function Document() {
  const { doc, nav, clearJump, goCover, unlocked, openActivity } = useStore()
  const scroller = useRef<HTMLDivElement>(null)

  const sections: ScrubSection[] = [
    { id: 'portrait', label: 'Family Portrait', locked: !unlocked('portrait') },
    { id: 'practices', label: 'Family Practices', locked: !unlocked('practices') },
    { id: 'constitution', label: 'Family Constitution', locked: !unlocked('constitution') },
    { id: 'covenant', label: 'The Finished Document', locked: !unlocked('covenant') },
  ]

  const jump = (id: SectionId, behavior: ScrollBehavior = 'smooth') => {
    const el = scroller.current
    const node = el?.querySelector<HTMLElement>(`[data-section="${id}"]`)
    if (el && node) el.scrollTo({ top: node.offsetTop - 8, behavior })
  }

  /* Arriving from the contents lands on the requested section with no
     animation — you were never anywhere else in this document. */
  useEffect(() => {
    if (!nav.jumpTo) return
    jump(nav.jumpTo, 'auto')
    clearJump()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav.jumpTo])

  return (
    <div className="relative z-1 flex min-h-0 flex-1 flex-col">
      <header className="print-hide relative z-10 flex shrink-0 items-center gap-3 border-b border-[var(--color-rule)] bg-[var(--color-paper)] px-4 pt-[max(0.85rem,env(safe-area-inset-top))] pb-3">
        <IconButton label="Back to contents" onClick={goCover}>
          <ArrowLeft />
        </IconButton>
        <p className="type-eyebrow flex-1 truncate text-center">
          {doc.origin.familyName.trim() ? `The ${doc.origin.familyName.trim()} Family` : 'Your Family'}
        </p>
        <span className="w-10" aria-hidden="true" />
      </header>

      <div ref={scroller} className="scroll-quiet relative min-h-0 flex-1 overflow-y-auto">
        <div className="px-7 pt-8 pb-24">
          {/* ---------------------------------------------------------- */}
          <Section
            id="portrait"
            eyebrow="Session one"
            title="Family Portrait"
            blurb="A portrait needs three things: where the subject came from, how they carry themselves, and what they are looking at."
          >
            <Part title="Origin" note="Where your family began.">
              {doc.completed.origin ? (
                <>
                  <Preamble />
                  <Revisit label="Tell it again" onClick={() => openActivity('origin')} />
                </>
              ) : (
                <Begin
                  blurb="Four angles — who, where, when, and why. One of you asks, the other answers out loud, and then it goes on the page."
                  label="Start the Origin activity"
                  onClick={() => openActivity('origin')}
                />
              )}
            </Part>

            <Part title="Praxis" note="What your family does, over and over." locked={!doc.completed.practices}>
              {doc.completed.praxis ? (
                <>
                  <p className="prose-editorial">{doc.praxisStatement}</p>
                  <Revisit label="Rewrite it" onClick={() => openActivity('praxis')} />
                </>
              ) : (
                <Begin
                  blurb="Your practices are decided. Now name the pattern underneath them."
                  label="Write your praxis"
                  onClick={() => openActivity('praxis')}
                />
              )}
            </Part>

            <Part title="Telos" note="The end your family is aiming at." locked={!doc.completed.constitution}>
              <p className="prose-editorial">{doc.telosSummary}</p>
              <TopThree />
              <Revisit label="Sort the values again" onClick={() => openActivity('values')} />
            </Part>
          </Section>

          {/* ---------------------------------------------------------- */}
          <Section
            id="practices"
            eyebrow="Session two"
            title="Family Practices"
            blurb="Everything a family hands over is a trade. These are the trades you looked at squarely, and what you decided about each one."
            locked={!unlocked('practices')}
            lockedNote="Finish the Origin activity first."
          >
            {doc.practices.length ? (
              <>
                <PracticeCards />
                {!doc.completed.practices && (
                  <div className="mt-6">
                    <Begin
                      blurb="Some of these are still waiting on a decision."
                      label="Keep going"
                      onClick={() => openActivity('practices')}
                    />
                  </div>
                )}
              </>
            ) : (
              <Begin
                blurb="Brainstorm everything you would automate. Then everyone picks one, and the assistant shows you the rest of the bargain."
                label="Start the Practices activity"
                onClick={() => openActivity('practices')}
              />
            )}
          </Section>

          {/* ---------------------------------------------------------- */}
          <Section
            id="constitution"
            eyebrow="Session three"
            title="Family Constitution"
            blurb="Self-direction is only one of the things worth protecting. Here is where your family says which ones it would protect when protecting them costs something."
            locked={!unlocked('constitution')}
            lockedNote="Finish the Family Practices activity first."
          >
            {doc.valueRanking.length ? (
              <>
                <TopThree full />
                <Revisit label="Sort them again" onClick={() => openActivity('values')} />
              </>
            ) : (
              <Begin
                blurb="Two values at a time. Choose the one that matters more, and keep choosing until they are all in order."
                label="Sort your values"
                onClick={() => openActivity('values')}
              />
            )}
          </Section>

          {/* ---------------------------------------------------------- */}
          <Section
            id="covenant"
            eyebrow="Take it home"
            title="The Finished Document"
            blurb="Every part of it, in one piece, in your own words."
            locked={!unlocked('covenant')}
            lockedNote="Finish all three sessions first."
          >
            <FinishedDocument />
          </Section>
        </div>
      </div>

      <SectionScrubber sections={sections} scrollRef={scroller} onJump={(id) => jump(id)} />
    </div>
  )
}

/* ==========================================================================
   Pieces of the page
   ========================================================================== */

function Section({
  id,
  eyebrow,
  title,
  blurb,
  children,
  locked,
  lockedNote,
}: {
  id: SectionId
  eyebrow: string
  title: string
  blurb: string
  children: ReactNode
  locked?: boolean
  lockedNote?: string
}) {
  const Mark = SECTION_MARKS[id]
  return (
    <section data-section={id} className="scroll-mt-4 pt-14 first:pt-0">
      <div className="mb-3 flex items-center gap-2.5">
        <Mark size={22} />
        <p className="type-eyebrow">{eyebrow}</p>
      </div>
      <h1 className="type-h1">{title}</h1>
      <RuleWithTick className="my-5" />
      <p className="type-caption mb-8 max-w-[36ch]">{blurb}</p>

      {locked ? (
        <div className="surface flex items-start gap-3 px-5 py-5 opacity-70">
          <span className="mt-[3px] text-[var(--color-muted)]">
            <Lock size={15} />
          </span>
          <p className="type-caption">{lockedNote}</p>
        </div>
      ) : (
        children
      )}
    </section>
  )
}

/** A sub-part of a section. Greyed rather than hidden when it is not its turn. */
function Part({
  title,
  note,
  children,
  locked,
}: {
  title: string
  note: string
  children: ReactNode
  locked?: boolean
}) {
  return (
    <div
      className="border-t border-[var(--color-rule)] py-7 first:border-t-0 first:pt-0"
      style={locked ? { opacity: 0.42 } : undefined}
      aria-disabled={locked}
    >
      <div className="mb-3 flex items-center gap-2">
        <h2 className="type-h2">{title}</h2>
        {locked && (
          <span className="text-[var(--color-muted)]">
            <Lock size={13} />
          </span>
        )}
      </div>
      <p className="type-caption mb-5">{note}</p>
      {locked ? (
        <p className="type-caption italic">Not yet. This one is written later.</p>
      ) : (
        children
      )}
    </div>
  )
}

function Begin({ blurb, label, onClick }: { blurb: string; label: string; onClick: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <p className="type-caption mb-5 max-w-[34ch]">{blurb}</p>
      <button type="button" className="btn btn-primary w-full" onClick={onClick}>
        {label}
        <ArrowRight />
      </button>
    </motion.div>
  )
}

function Revisit({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="type-caption print-hide mt-5 underline decoration-[var(--color-rule-strong)] underline-offset-4 transition-colors hover:text-[var(--color-ink)]"
    >
      {label}
    </button>
  )
}

function TopThree({ full }: { full?: boolean }) {
  const { doc } = useStore()
  const ids = full ? doc.valueRanking : doc.valueRanking.slice(0, 3)
  if (!ids.length) return null

  return (
    <ol className="mt-6 flex flex-col gap-1.5">
      {ids.map((id, i) => {
        const v = valueById(id)
        if (!v) return null
        const top = i < 3
        return (
          <li
            key={id}
            className="flex items-start gap-3 px-4 py-3"
            style={{
              background: top ? 'var(--color-ochre-wash)' : 'transparent',
              border: `1px solid ${top ? 'color-mix(in srgb, var(--color-ochre) 38%, transparent)' : 'var(--color-rule)'}`,
              borderRadius: 'var(--radius-card)',
            }}
          >
            <span
              className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: top ? 'var(--color-ochre)' : 'var(--color-rule-strong)' }}
            />
            <span className="type-h3 leading-snug">{v.title}</span>
          </li>
        )
      })}
    </ol>
  )
}
