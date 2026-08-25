import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Close, IconButton } from '~/components/Bits'

/**
 * A near-fullscreen card.
 *
 * Inset from every edge with four rounded corners, so it reads as a card
 * laid on top of the document rather than a new screen that replaced it.
 * It scales in rather than sliding: a slide implies you went somewhere, and
 * you did not — the document is still underneath, and you come back to it.
 */
export function Popup({
  title,
  onClose,
  children,
  footer,
  progress,
  onBack,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  progress?: ReactNode
  onBack?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-[rgba(37,35,33,0.28)] p-3 md:rounded-[34px]"
      onClick={onClose}
      role="dialog"
      aria-label={title}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ type: 'spring', stiffness: 520, damping: 40, mass: 0.7 }}
        onClick={(e) => e.stopPropagation()}
        className="paper-grain relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-[var(--color-rule-strong)] bg-[var(--color-paper)] shadow-[0_24px_60px_-24px_rgba(37,35,33,0.55)]"
      >
        <header className="relative z-1 flex shrink-0 items-center gap-3 border-b border-[var(--color-rule)] px-4 py-3">
          {onBack ? (
            <IconButton label="Back" onClick={onBack}>
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M11 3.5 L5 9 L11 14.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>
          ) : (
            <span className="w-10" />
          )}
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="type-eyebrow truncate">{title}</span>
            {progress}
          </div>
          <IconButton label="Close" onClick={onClose}>
            <Close />
          </IconButton>
        </header>

        <div className="scroll-quiet relative z-1 min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {footer && (
          <div className="relative z-1 shrink-0 border-t border-[var(--color-rule)] px-5 py-3.5">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
