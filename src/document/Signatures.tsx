import { useStore } from '~/app/store'
import { useStub } from '~/components/Stub'
import { Blank } from '~/components/Bits'
import { InlineEdit } from '~/components/InlineEdit'
import { downloadMarkdown } from '~/lib/export'

/** "A", "A and B", "A, B, and C" — as separate pieces, so each name can be edited. */
function joiners(count: number): string[] {
  if (count <= 1) return ['']
  if (count === 2) return ['', ' and ']
  return Array.from({ length: count }, (_, i) =>
    i === 0 ? '' : i === count - 1 ? ', and ' : ', ',
  )
}

/**
 * A yyyy-mm-dd date read as a date rather than an instant.
 *
 * `new Date('2026-08-29')` is midnight UTC, which is the day before in every
 * timezone west of Greenwich — a family in Texas would see the wrong date on
 * their own foundation.
 */
function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return ''
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * The epilogue.
 *
 * Not a section the family unlocks and visits — it appears at the foot of
 * the document once the three sessions are behind them, so the last thing
 * on the page is a place to sign rather than another thing to do.
 *
 * The sentence underneath is the same shape as the origin sentence at the
 * top: the family's own words in their own hand, set into a line that reads
 * out loud. Typing a name here and typing it in the field above are the same
 * act — there is one copy of it, not two.
 */
export function Signatures() {
  const { doc, dispatch } = useStore()
  const stub = useStub()

  const family = doc.origin.familyName.trim()
  const setSignature = (id: string) => (name: string) =>
    dispatch({ type: 'setSignature', id, name })

  /* Only the people who actually put their name down. An empty line is a
     person who has not signed, not a person to be named in the sentence. */
  const signed = doc.participants.filter((p) => (doc.signatures[p.id] ?? '').trim())
  const glue = joiners(signed.length)

  return (
    <section data-section="signatures" className="scroll-mt-4 pt-14">
      <p className="type-eyebrow mb-5">Created by</p>

      {/* Real fields, not a printed line. Each carries its own name as the
          placeholder, so an empty sheet still says who is meant to sign. */}
      <div className="flex flex-col gap-3">
        {doc.participants.map((p) => (
          <input
            key={p.id}
            className="field"
            value={doc.signatures[p.id] ?? ''}
            placeholder={p.name}
            aria-label={`Signature for ${p.name}`}
            autoComplete="off"
            onChange={(e) => setSignature(p.id)(e.target.value)}
          />
        ))}
      </div>

      <p className="type-eyebrow mt-8 mb-3">Created on</p>
      <input
        type="date"
        className="field"
        value={doc.createdOn}
        aria-label="Date created"
        onChange={(e) => dispatch({ type: 'setCreatedOn', date: e.target.value })}
      />

      <p className="prose-editorial mt-9 !text-[1.2rem] !leading-[1.75]">
        The <Blank value={family} width="6ch" /> Family Foundation was created by{' '}
        {signed.length ? (
          signed.map((p, i) => (
            <span key={p.id}>
              {glue[i]}
              <InlineEdit
                value={doc.signatures[p.id] ?? ''}
                onChange={setSignature(p.id)}
                label={`Name of ${p.name}`}
              />
            </span>
          ))
        ) : (
          <Blank width="8ch" />
        )}{' '}
        on <Blank value={longDate(doc.createdOn)} width="9ch" />.
      </p>

      <div className="print-hide mt-9 flex flex-col gap-2.5">
        <button type="button" className="btn btn-primary w-full" onClick={() => window.print()}>
          Download PDF
        </button>
        <button type="button" className="btn btn-ghost w-full" onClick={() => downloadMarkdown(doc)}>
          Download Markdown
        </button>
        <button
          type="button"
          className="btn btn-ghost w-full"
          onClick={() => stub('This will email the finished document to everyone who signed it.')}
        >
          Email to the Family
        </button>
      </div>
    </section>
  )
}
