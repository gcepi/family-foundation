import { useEffect, useRef, type ReactNode } from 'react'
import { useStore } from '~/app/store'
import { PracticeCards } from '~/document/PracticeCards'
import { Preamble } from '~/document/Preamble'
import { OriginSection } from '~/document/sections/OriginSection'
import { PraxisSection } from '~/document/sections/PraxisSection'
import { ValuesSection } from '~/document/sections/ValuesSection'
import { FinishedDocument } from '~/document/FinishedDocument'
import { ArrowLeft, ArrowRight, IconButton } from '~/components/Bits'
import { SECTION_MARKS } from '~/illustrations/marks'
import { valueById } from '~/data/values'
import type { SectionId } from '~/lib/types'

/**
 * The foundation page.
 *
 * One continuous document that the family drafts by working down it. The
 * activities happen here, in place — nothing opens an activity and hands
 * back a result, because the point is that they watch their own page fill in.
 *
 * The two exceptions take over the screen as cards: sorting the values and
 * weighing the practices, both of which need the family looking at one thing
 * and nothing else.
 *
 * Sections they have not reached collapse to a greyed heading. There is
 * enough left to see that something is coming and nothing to scroll into.
 */
export function Document() {
  const { doc, nav, clearJump, goCover, unlocked, openActivity } = useStore()
  const scroller = useRef<HTMLDivElement>(null)

  const jump = (id: SectionId, behavior: ScrollBehavior = 'smooth') => {
    const el = scroller.current
    const node = el?.querySelector<HTMLElement>(`[data-section="${id}"]`)
    if (el && node) el.scrollTo({ top: node.offsetTop - 8, behavior })
  }

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
          {doc.origin.familyName.trim()
            ? `The ${doc.origin.familyName.trim()} Family`
            : 'Your Family'}
        </p>
        <span className="w-10" aria-hidden="true" />
      </header>

      <div ref={scroller} className="scroll-quiet relative min-h-0 flex-1 overflow-y-auto">
        <div className="px-7 pt-8 pb-28">
          <Section
            id="portrait"
            eyebrow="Session one"
            title="Family Portrait"
            blurb="Where the family came from, how it carries itself, and what it is looking at."
            locked={!unlocked('portrait')}
          >
            <Part title="Origin" note="Where your family began.">
              <OriginSection />
            </Part>

            <Part
              title="Praxis"
              note="What your family does, over and over."
              locked={!doc.completed.practices}
            >
              <PraxisSection />
            </Part>

            <Part
              title="Telos"
              note="The end your family is aiming at."
              locked={!doc.completed.constitution}
            >
              <p className="prose-editorial">{doc.telosSummary}</p>
              <TopThree />
            </Part>
          </Section>

          <Section
            id="practices"
            eyebrow="Session two"
            title="Family Practices"
            blurb="Everything a family hands over is a trade. These are the trades you looked at, and what you decided about each one."
            locked={!unlocked('practices')}
          >
            {doc.practices.length && doc.completed.practices ? (
              <PracticeCards />
            ) : (
              <div>
                <p className="type-caption mb-5 max-w-[34ch]">
                  Brainstorm everything you would automate. Then everyone picks one, and the
                  assistant shows you the rest of the bargain.
                </p>
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={() => openActivity('practices')}
                >
                  {doc.practices.length ? 'Continue' : 'Start'}
                  <ArrowRight />
                </button>
              </div>
            )}
          </Section>

          <Section
            id="constitution"
            eyebrow="Session three"
            title="Family Constitution"
            blurb="Which values your family would protect when protecting them costs something."
            locked={!unlocked('constitution')}
          >
            <ValuesSection />
          </Section>

          <Section
            id="covenant"
            eyebrow="Take it home"
            title="The Finished Document"
            blurb="Every part of it, in one piece, in your own words."
            locked={!unlocked('covenant')}
          >
            <FinishedDocument />
          </Section>
        </div>
      </div>
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
}: {
  id: SectionId
  eyebrow: string
  title: string
  blurb: string
  children: ReactNode
  locked?: boolean
}) {
  const Mark = SECTION_MARKS[id]

  /* Collapsed: the heading alone, faded. Enough to know it is coming, and
     nothing underneath it to scroll into. */
  if (locked) {
    return (
      <section data-section={id} className="pt-14" aria-hidden="true">
        <div className="pointer-events-none select-none opacity-[0.26]">
          <div className="mb-3 flex items-center gap-2.5">
            <Mark size={22} />
            <p className="type-eyebrow">{eyebrow}</p>
          </div>
          <h2 className="type-h1">{title}</h2>
        </div>
      </section>
    )
  }

  return (
    <section data-section={id} className="scroll-mt-4 pt-14 first:pt-0">
      <div className="mb-3 flex items-center gap-2.5">
        <Mark size={22} />
        <p className="type-eyebrow">{eyebrow}</p>
      </div>
      <h2 className="type-h1">{title}</h2>
      <hr className="hairline my-5" />
      <p className="type-caption mb-8 max-w-[36ch]">{blurb}</p>
      {children}
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
      style={locked ? { opacity: 0.3 } : undefined}
      aria-disabled={locked}
    >
      <h3 className="type-h2 mb-3">{title}</h3>
      <p className="type-caption mb-5">{note}</p>
      {!locked && children}
    </div>
  )
}

function TopThree() {
  const { doc } = useStore()
  const ids = doc.valueRanking.slice(0, 3)
  if (!ids.length) return null

  return (
    <ol className="mt-6 flex flex-col gap-1.5">
      {ids.map((id) => {
        const v = valueById(id)
        if (!v) return null
        return (
          <li
            key={id}
            className="px-4 py-3"
            style={{
              background: 'var(--color-ochre-wash)',
              border: '1px solid color-mix(in srgb, var(--color-ochre) 38%, transparent)',
              borderRadius: 'var(--radius-card)',
            }}
          >
            <span className="type-h3 leading-snug">{v.title}</span>
          </li>
        )
      })}
    </ol>
  )
}

export { Preamble }
