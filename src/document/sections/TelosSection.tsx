import { useStore } from '~/app/store'
import { InlineEdit } from '~/components/InlineEdit'

/**
 * Telos, as a paragraph the family owns.
 *
 * Prose only — the ranked list lives in Family Values, and repeating it here
 * would make this section a summary of that one rather than a statement in
 * its own right.
 */
export function TelosSection({ onRevisit }: { onRevisit: () => void }) {
  const { doc, dispatch } = useStore()
  const written = doc.telosStatement.trim().length > 0

  return (
    <div>
      {written ? (
        <>
          <p className="prose-editorial">
            <InlineEdit
              value={doc.telosStatement}
              onChange={(v) => dispatch({ type: 'setTelos', text: v })}
              label="Your telos"
            />
          </p>
          <button
            type="button"
            onClick={onRevisit}
            className="type-caption mt-5 underline decoration-[var(--color-rule-strong)] underline-offset-4 transition-colors hover:text-[var(--color-ink)]"
          >
            Revisit Family Values
          </button>
        </>
      ) : null}
    </div>
  )
}
