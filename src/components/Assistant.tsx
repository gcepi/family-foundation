import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Dial } from '~/illustrations'
import { StreamingText } from '~/components/StreamingText'

/** What the dial says while it turns. Replaced by real trace once wired up. */
const TRACES = [
  'Reading what you wrote',
  'Weighing the trade',
  'Looking for what it costs',
  'Putting it in plain words',
]

export function Thinking({ label }: { label?: string }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = window.setInterval(() => setStep((s) => (s + 1) % TRACES.length), 1200)
    return () => window.clearInterval(t)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <Dial />
      <div className="h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={label ?? step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28 }}
            className="type-caption"
          >
            {label ?? TRACES[step]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * A block of assistant output. Marked as not-the-family's-words by the rule
 * and the eyebrow, so nothing the machine wrote is ever mistaken for
 * something the family said.
 */
export function AssistantBlock({
  eyebrow = 'The assistant',
  children,
  action,
}: {
  eyebrow?: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="relative pl-4">
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-0 w-[2px] rounded-full bg-[var(--color-blue-ink)] opacity-30"
      />
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="type-eyebrow" style={{ color: 'var(--color-blue-ink)' }}>
          {eyebrow}
        </span>
        {action}
      </div>
      {children}
    </div>
  )
}

/** Thinking, then streaming, then settled. The whole assistant beat in one place. */
export function AssistantReveal({
  pending,
  text,
  eyebrow,
  action,
  className = 'prose-editorial',
  thinkingLabel,
}: {
  pending: boolean
  text: string
  eyebrow?: string
  action?: ReactNode
  className?: string
  thinkingLabel?: string
}) {
  return (
    <AnimatePresence mode="wait">
      {pending ? (
        <motion.div key="thinking" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <Thinking label={thinkingLabel} />
        </motion.div>
      ) : (
        <motion.div
          key="answer"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <AssistantBlock eyebrow={eyebrow} action={action}>
            <p className={className}>
              <StreamingText text={text} />
            </p>
          </AssistantBlock>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
