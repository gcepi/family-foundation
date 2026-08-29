import type { ReactNode } from 'react'
import { Lock } from '~/components/Bits'

/**
 * A section's description, set as a dictionary entry.
 *
 * The term is the thing being defined, so it leads: syllable-dotted and
 * bold, then the definition in italics, then what it means for this family
 * in plain text. The unlock condition, when there is one, carries the same
 * lock that sits beside the heading — the reader connects the mark on the
 * section to the reason given underneath it.
 */
export function Definition({
  term,
  sense,
  children,
  unlock,
}: {
  /** Syllable-dotted, e.g. "prax·is". */
  term: string
  /** The dictionary sense, set in italics. */
  sense: string
  children: ReactNode
  /** Shown only while the section is still locked. */
  unlock?: string
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Same face and same size as the description below it — only the
          headword carries weight, and the dash is just punctuation. */}
      <p className="type-caption text-[var(--color-ink)]">
        <strong className="font-semibold">{term}</strong> —{' '}
        <em className="text-[var(--color-muted)]">{sense}</em>
      </p>

      <p className="type-caption">{children}</p>

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
