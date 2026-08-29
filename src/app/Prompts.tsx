import { useStore } from '~/app/store'
import { Screen } from '~/app/Shell'
import { ArrowLeft, IconButton } from '~/components/Bits'
import { DEFAULT_PROMPTS, PROMPTS_ARE_NOT_LIVE_YET, defaultPromptText } from '~/lib/prompts'

/**
 * The prompts, editable in the app.
 *
 * Keeping them in a source file meant they could only be changed by whoever
 * had the repository open, which is nobody during a session. They live here
 * instead: one screen, one box per generated field, saved with the document.
 *
 * The warning at the top is not boilerplate. Nothing is wired to a model
 * yet, so an edit here changes the wording that will be used later, not the
 * text the prototype produces today — and saying otherwise would send
 * someone off tuning a prompt that cannot possibly take effect.
 */
export function Prompts() {
  const { doc, dispatch, goCover } = useStore()

  return (
    <Screen>
      <div className="relative z-1 px-7 pt-[max(1rem,env(safe-area-inset-top))] pb-10">
        <div className="mb-6 flex items-center">
          <IconButton label="Back to contents" onClick={goCover}>
            <ArrowLeft />
          </IconButton>
        </div>

        <h1 className="type-h1">AI prompts</h1>

        <div
          className="mt-5 px-4 py-3.5"
          style={{
            background: 'var(--color-blue-wash)',
            border: '1px solid color-mix(in srgb, var(--color-blue-ink) 30%, transparent)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <p className="type-eyebrow mb-1.5" style={{ color: 'var(--color-blue-ink)' }}>
            Not connected yet
          </p>
          <p className="type-caption text-[var(--color-ink)]">{PROMPTS_ARE_NOT_LIVE_YET}</p>
        </div>

        <div className="mt-9 flex flex-col gap-9">
          {DEFAULT_PROMPTS.map((spec) => {
            const value = doc.prompts[spec.id] ?? spec.text
            const edited = value !== spec.text
            return (
              <div key={spec.id}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <h2 className="type-h3">{spec.label}</h2>
                  {edited && (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({ type: 'setPrompt', id: spec.id, text: defaultPromptText(spec.id) })
                      }
                      className="type-caption shrink-0 underline decoration-[var(--color-rule-strong)] underline-offset-4"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <p className="type-caption mb-2">{spec.where}</p>

                <textarea
                  className="field-area font-mono !text-[0.78rem] !leading-[1.6]"
                  rows={14}
                  value={value}
                  spellCheck={false}
                  aria-label={`Prompt for ${spec.label}`}
                  onChange={(e) => dispatch({ type: 'setPrompt', id: spec.id, text: e.target.value })}
                />

                <p className="type-caption mt-2 text-[0.75rem]">
                  Filled in when it runs: {spec.placeholders.join(', ')}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </Screen>
  )
}
