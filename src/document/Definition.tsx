import type { ReactNode } from 'react'
import { Lock } from '~/components/Bits'

/**
 * A section's description, set as a dictionary entry.
 *
 * The heading directly above already names the word, so the entry leads
 * with the definition itself and nothing repeats. The unlock condition,
 * when there is one, carries the same lock that sits beside the heading —
 * the reader connects the mark on the section to the reason underneath it.
 */
export function Definition({
  sense,
  children,
  unlock,
}: {
  /** The dictionary sense, set in italics. */
  sense: string
  children: ReactNode
  /** Shown only while the section is still locked. */
  unlock?: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="type-caption">
        <em className="text-[var(--color-muted)]">{sense}</em>
      </p>

      <p className="type-caption whitespace-pre-line">{children}</p>

      {unlock && (
        <p className="type-caption flex items-start gap-1.5">
          <span className="mt-[3px] shrink-0 text-[var(--color-muted)]">
            <Lock size={12} />
          </span>
          <span>{unlock}</span>
        </p>
      )}
    </div>
  )
}
