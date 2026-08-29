import { InlineEdit } from '~/components/InlineEdit'
import { decap } from '~/lib/assistant'
import type { Practice } from '~/lib/types'

/**
 * The four parts of the bargain.
 *
 * Accepting and refusing are the same trade read in opposite directions, so
 * they get the same four rows and the same formatting. Only the labels turn
 * around. Nothing here says "accepted" or "refused" — the decision is
 * carried by the mark on the card, not by a word in the text.
 *
 * The first two rows are the family's own words. The last two came from the
 * assistant, so they are marked in blue and are editable in place.
 */
export function BargainRows({
  practice,
  onEdit,
}: {
  practice: Practice
  /** Omit to render read-only, as in the finished document. */
  onEdit?: (patch: Partial<Practice>) => void
}) {
  const kept = practice.decision !== 'refused'
  const b = practice.bargain

  return (
    <div className="flex flex-col gap-5">
      <Row label={kept ? 'Now we can' : 'We will not'} text={`automate ${decap(practice.thing)}`} />

      <Row
        label={kept ? "So we'll no longer have to" : 'So we will still have to'}
        text={decap(practice.relief)}
        onChange={onEdit && ((v) => onEdit({ relief: v }))}
      />

      <Row
        label={kept ? 'We will no longer be able to' : 'We will still be able to'}
        text={b?.noLongerAble ?? ''}
        assistant
        onChange={
          onEdit && b
            ? (v) => onEdit({ bargain: { ...b, noLongerAble: v } })
            : undefined
        }
      />

      <Row
        label={kept ? 'Now we will have to' : 'So we still can'}
        text={(kept ? b?.nowHaveTo : b?.alsoKeeps) ?? ''}
        assistant
        onChange={
          onEdit && b
            ? (v) => onEdit({ bargain: { ...b, [kept ? 'nowHaveTo' : 'alsoKeeps']: v } })
            : undefined
        }
      />
    </div>
  )
}

function Row({
  label,
  text,
  assistant,
  onChange,
}: {
  label: string
  text: string
  assistant?: boolean
  onChange?: (v: string) => void
}) {
  return (
    <div>
      <span className="block">
        <span
          className="type-eyebrow block"
          style={assistant ? { color: 'var(--color-blue-ink)' } : undefined}
        >
          {label}
        </span>
        <span className="prose-editorial !text-[1.02rem] block">
          {onChange ? <InlineEdit value={text} onChange={onChange} label={label} /> : text}
        </span>
      </span>
    </div>
  )
}
