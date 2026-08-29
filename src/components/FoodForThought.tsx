import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Thinking } from '~/components/Assistant'
import { InlineEdit } from '~/components/InlineEdit'

/**
 * What the assistant noticed, offered rather than asserted.
 *
 * Marked as not-the-family's-words by the blue rule and the label, but
 * editable all the same — a family that disagrees with the reading should
 * be able to correct it where they are reading it, not somewhere else.
 */
export function FoodForThought({
  pending,
  text,
  onChange,
  thinkingLabel,
  actions,
}: {
  pending: boolean
  text: string
  onChange: (v: string) => void
  thinkingLabel?: string
  actions?: ReactNode
}) {
  if (pending) {
    return (
      <div className="relative pl-4">
        <Rule />
        <p className="type-eyebrow mb-2" style={{ color: 'var(--color-blue-ink)' }}>
          Consider this
        </p>
        <Thinking label={thinkingLabel} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative pl-4"
    >
      <Rule />
      <p className="type-eyebrow mb-2" style={{ color: 'var(--color-blue-ink)' }}>
        Consider this
      </p>
      <p className="prose-editorial">
        <InlineEdit value={text} onChange={onChange} label="Consider this" />
      </p>
      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </motion.div>
  )
}

function Rule() {
  return (
    <span
      aria-hidden="true"
      className="absolute top-1 bottom-1 left-0 w-[2px] rounded-full bg-[var(--color-blue-ink)] opacity-30"
    />
  )
}
