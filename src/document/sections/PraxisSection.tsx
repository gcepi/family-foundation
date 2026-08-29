import { useStore } from '~/app/store'
import { InlineEdit } from '~/components/InlineEdit'

/**
 * Praxis, as a paragraph the family owns.
 *
 * Nothing is asked here. The text arrives from the Consider this under
 * Family Practices, where the family pressed "Apply to Praxis" — a one-time
 * paste, not a live mirror, so editing it afterwards is editing their words
 * rather than overriding the machine's.
 */
export function PraxisSection({ onRevisit }: { onRevisit: () => void }) {
  const { doc, dispatch } = useStore()
  const written = doc.praxisStatement.trim().length > 0

  return (
    <div>
      {written ? (
        <>
          <p className="prose-editorial">
            <InlineEdit
              value={doc.praxisStatement}
              onChange={(v) => dispatch({ type: 'setPraxis', text: v })}
              label="Your praxis"
            />
          </p>
          {/* Only offered once there is something here to compare against. */}
          <button
            type="button"
            onClick={onRevisit}
            className="type-caption mt-5 underline decoration-[var(--color-rule-strong)] underline-offset-4 transition-colors hover:text-[var(--color-ink)]"
          >
            Revisit Family Practices
          </button>
        </>
      ) : null}
    </div>
  )
}
