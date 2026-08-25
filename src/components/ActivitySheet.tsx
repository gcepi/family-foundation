import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Close, IconButton } from '~/components/Bits'

/**
 * An activity rises over the document rather than replacing it.
 *
 * The document is the thing being written; an activity is the family
 * gathered around one part of it. When the sheet settles back down, the
 * words are on the page — you never left the page to get them there.
 */
export function ActivitySheet({
  title,
  onClose,
  onBack,
  children,
  footer,
  progress,
}: {
  title: string
  onClose: () => void
  onBack?: () => void
  children: ReactNode
  footer?: ReactNode
  progress?: ReactNode
}) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 36, mass: 0.9 }}
      className="paper-grain absolute inset-0 z-30 flex flex-col bg-[var(--color-paper)] md:rounded-[34px]"
      role="dialog"
      aria-label={title}
    >
      <header className="relative z-1 flex shrink-0 items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        {onBack ? (
          <IconButton label="Back" onClick={onBack}>
            <ArrowLeft />
          </IconButton>
        ) : (
          <span className="w-10" />
        )}
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <span className="type-eyebrow truncate">{title}</span>
          {progress}
        </div>
        <IconButton label="Close activity" onClick={onClose}>
          <Close />
        </IconButton>
      </header>

      <div className="scroll-quiet relative z-1 min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>

      {footer && (
        <div className="relative z-1 shrink-0 border-t border-[var(--color-rule)] px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {footer}
        </div>
      )}
    </motion.div>
  )
}
