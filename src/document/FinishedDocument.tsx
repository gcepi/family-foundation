import { useStore } from '~/app/store'
import { useStub } from '~/components/Stub'
import { Preamble } from '~/document/Preamble'
import { valueById } from '~/data/values'
import { decap, toOurVoice } from '~/lib/assistant'
import { downloadMarkdown } from '~/lib/export'
import { SealMark } from '~/illustrations'

const today = () =>
  new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

/**
 * The whole thing, assembled.
 *
 * Nothing new is written here — every line came from somewhere the family
 * already filled in. It exists so there is something to take home, and so
 * the last screen of the last session is the family's own words rather than
 * a completion badge.
 */
export function FinishedDocument() {
  const { doc } = useStore()
  const stub = useStub()

  const kept = doc.practices.filter((p) => p.decision === 'kept')
  const refused = doc.practices.filter((p) => p.decision === 'refused')
  const top = doc.valueRanking.slice(0, 3).map((id) => valueById(id)?.title).filter(Boolean)

  return (
    <div>
      <article className="surface-raised px-6 py-8">
        <header className="mb-7 text-center">
          <span className="mb-3 inline-block">
            <SealMark size={30} />
          </span>
          <h2 className="type-h2">
            The Constitution of the{' '}
            {doc.origin.familyName.trim() || 'ㅤ'} Family
          </h2>
        </header>

        <hr className="hairline mb-7" />

        <Clause label="Preamble">
          <Preamble />
        </Clause>

        {kept.length > 0 && (
          <Clause label="What we will hand over">
            <ul className="flex flex-col gap-3">
              {kept.map((p) => (
                <li key={p.id} className="prose-editorial !text-[1rem]">
                  We will hand over{' '}
                  <em className="not-italic underline decoration-[var(--color-ochre)] decoration-2 underline-offset-4">
                    {decap(p.thing)}
                  </em>
                  , so we will no longer have to {decap(p.relief).replace(/\.$/, '')} — knowing we
                  will no longer {toOurVoice(p.bargain?.noLongerAble ?? '')}, and will now have to{' '}
                  {toOurVoice(p.bargain?.nowHaveTo ?? '')}.
                </li>
              ))}
            </ul>
          </Clause>
        )}

        {refused.length > 0 && (
          <Clause label="What we will not hand over">
            <ul className="flex flex-col gap-3">
              {refused.map((p) => (
                <li key={p.id} className="prose-editorial !text-[1rem]">
                  We will not {p.refusal?.willNot}, and will still have to{' '}
                  {p.refusal?.willStillHaveTo}, so we will still be able to{' '}
                  {p.refusal?.soStillAble}, and be able to {p.refusal?.andAble}.
                </li>
              ))}
            </ul>
          </Clause>
        )}

        {doc.praxisStatement && (
          <Clause label="Our praxis">
            <p className="prose-editorial">{doc.praxisStatement}</p>
          </Clause>
        )}

        {doc.telosSummary && (
          <Clause label="Our telos">
            <p className="prose-editorial">{doc.telosSummary}</p>
            {top.length === 3 && (
              <p className="type-caption mt-4">
                In order: {top.join(' · ')}
              </p>
            )}
          </Clause>
        )}

        <hr className="hairline mt-8 mb-6" />

        <footer>
          <p className="type-eyebrow mb-4">Agreed to by</p>
          <div className="flex flex-col gap-4">
            {doc.participants.map((p) => (
              <div key={p.id}>
                <div className="h-6 border-b border-[var(--color-rule-strong)]" />
                <p className="type-caption mt-1.5">{p.name}</p>
              </div>
            ))}
          </div>
          <p className="type-caption mt-6">{today()}</p>
        </footer>
      </article>

      <div className="print-hide mt-6 flex flex-col gap-2.5">
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
          Email to the family
        </button>
      </div>
    </div>
  )
}

function Clause({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-7 last:mb-0">
      <p className="type-eyebrow mb-2.5">{label}</p>
      {children}
    </section>
  )
}
