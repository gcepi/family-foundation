import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '~/app/store'
import { AssistantReveal } from '~/components/Assistant'
import { InlineEdit } from '~/components/InlineEdit'
import { ArrowRight } from '~/components/Bits'
import { composePraxisReflection, think } from '~/lib/assistant'

const assemble = (p: {
  handOver: string
  soThat: string
  notHandOver: string
  because: string
}) =>
  `Our family will hand over ${p.handOver.trim()} so that we can ${p.soThat.trim()}. ` +
  `We will not hand over ${p.notHandOver.trim()}, because ${p.because.trim()}.`

/**
 * Praxis, written into the document.
 *
 * Four short questions rather than one paragraph with blanks in it. A blank
 * inside a textarea asks a family to hold the whole sentence in their head
 * while they fill one part of it; four questions ask one thing at a time and
 * assemble the sentence for them.
 */
export function PraxisSection() {
  const { doc, dispatch } = useStore()
  const parts = doc.praxisParts
  const [pending, setPending] = useState(!doc.praxisReflection)
  const [reflection, setReflection] = useState(doc.praxisReflection)

  useEffect(() => {
    if (!pending) return
    let live = true
    think(
      () => composePraxisReflection(doc.practices, doc.participants, doc.origin.familyName),
      2000,
    ).then((text) => {
      if (!live) return
      setReflection(text)
      dispatch({ type: 'setPraxis', reflection: text })
      setPending(false)
    })
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const patch = (p: Partial<typeof parts>) => dispatch({ type: 'patchPraxisParts', patch: p })
  const ready =
    parts.handOver.trim() && parts.soThat.trim() && parts.notHandOver.trim() && parts.because.trim()

  /* Finished: the statement stands on its own and is edited in place. */
  if (doc.completed.praxis) {
    return (
      <p className="prose-editorial">
        <InlineEdit
          value={doc.praxisStatement}
          onChange={(v) => dispatch({ type: 'setPraxis', statement: v })}
          label="Your praxis"
        />
      </p>
    )
  }

  return (
    <div>
      <AssistantReveal
        pending={pending}
        text={reflection}
        eyebrow="What the assistant noticed"
        thinkingLabel="Reading back what you kept and refused"
      />

      {!pending && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-9"
        >
          <Ask
            label="What will your family hand over?"
            value={parts.handOver}
            onChange={(v) => patch({ handOver: v })}
            placeholder="the errands"
          />
          <Ask
            label="So that you can what?"
            value={parts.soThat}
            onChange={(v) => patch({ soThat: v })}
            placeholder="spend the time on each other"
          />
          <Ask
            label="What will your family not hand over?"
            value={parts.notHandOver}
            onChange={(v) => patch({ notHandOver: v })}
            placeholder="the thinking"
          />
          <Ask
            label="Because why?"
            value={parts.because}
            onChange={(v) => patch({ because: v })}
            placeholder="that is the part that makes us who we are"
            last
          />

          {ready ? (
            <div className="mt-8">
              <p className="type-eyebrow mb-3">Your praxis</p>
              <p className="prose-editorial">{assemble(parts)}</p>
              <button
                type="button"
                className="btn btn-primary mt-7 w-full"
                onClick={() => {
                  dispatch({ type: 'setPraxis', statement: assemble(parts) })
                  dispatch({ type: 'completePraxis' })
                }}
              >
                Save
                <ArrowRight />
              </button>
            </div>
          ) : (
            <p className="type-caption mt-8">Answer all four to see the sentence.</p>
          )}
        </motion.div>
      )}
    </div>
  )
}

function Ask({
  label,
  value,
  onChange,
  placeholder,
  last,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  last?: boolean
}) {
  return (
    <div className={last ? '' : 'mb-7'}>
      <label className="type-h3 mb-2 block">{label}</label>
      <input
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  )
}
