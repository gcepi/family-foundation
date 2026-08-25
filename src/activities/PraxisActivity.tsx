import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '~/app/store'
import { ActivitySheet } from '~/components/ActivitySheet'
import { AssistantReveal } from '~/components/Assistant'
import { RuleWithTick } from '~/illustrations'
import { composePraxisReflection, think } from '~/lib/assistant'

const STEM =
  'Our family will hand over ______ so that we can ______. We will not hand over ______, because ______.'

/**
 * Praxis — practice, or pattern.
 *
 * The assistant reads back what the family kept and refused; the family
 * writes the rule underneath it. The stem is a genuine fill-in-the-blank:
 * they type over the rules, and what is left is a sentence in their words.
 */
export function PraxisActivity() {
  const { doc, dispatch, closeActivity } = useStore()
  const [pending, setPending] = useState(!doc.praxisReflection)
  const [reflection, setReflection] = useState(doc.praxisReflection)
  const [statement, setStatement] = useState(doc.praxisStatement || STEM)

  useEffect(() => {
    if (!pending) return
    let live = true
    think(
      () => composePraxisReflection(doc.practices, doc.participants, doc.origin.familyName),
      2200,
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

  const untouched = statement.trim() === STEM || !statement.replace(/_/g, '').trim()

  const finish = () => {
    dispatch({ type: 'setPraxis', statement: statement.trim() })
    dispatch({ type: 'completePraxis' })
    closeActivity()
  }

  return (
    <ActivitySheet
      title="Family Portrait · Praxis"
      onClose={closeActivity}
      footer={
        <button type="button" className="btn btn-primary w-full" disabled={pending || untouched} onClick={finish}>
          Write it into the document
        </button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-4"
      >
        <h2 className="type-h1">Praxis</h2>
        <RuleWithTick className="my-5" />
        <p className="type-caption max-w-[34ch]">
          Practice, or pattern. Not what your family believes — what your family actually does,
          over and over, until it stops being a decision.
        </p>

        <div className="mt-8">
          <AssistantReveal
            pending={pending}
            text={reflection}
            eyebrow="What the assistant noticed"
            thinkingLabel="Reading back what you kept and refused"
          />
        </div>

        {!pending && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-10"
          >
            <p className="type-eyebrow mb-2">Now say it in your own words</p>
            <p className="type-caption mb-4 max-w-[32ch]">
              Type over the blanks. Change the sentence entirely if it is not yours.
            </p>
            <textarea
              className="field-area"
              rows={7}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              onFocus={(e) => {
                if (e.target.value === STEM) e.target.setSelectionRange(0, 0)
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </ActivitySheet>
  )
}
