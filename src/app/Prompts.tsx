import { useState } from 'react'
import { useStore } from '~/app/store'
import { Screen } from '~/app/Shell'
import { ArrowLeft, IconButton } from '~/components/Bits'
import {
  DEFAULT_MODEL,
  MODELS,
  generate,
  getKey,
  getModel,
  inArtifactViewer,
  setKey,
  setModel,
} from '~/lib/anthropic'
import {
  DEFAULT_PROMPTS,
  PROMPTS_NEED_A_KEY,
  PROMPTS_NOT_IN_ARTIFACT,
  defaultPromptText,
} from '~/lib/prompts'

/**
 * The prompts, editable in the app.
 *
 * Keeping them in a source file meant they could only be changed by whoever
 * had the repository open, which is nobody during a session. They live here
 * instead: one screen, one box per generated field, saved with the document.
 *
 * With a key entered these are live — edit one and the next thing the app
 * writes follows it. The banner says which of the two is true right now,
 * because tuning a prompt that cannot take effect is worse than not tuning
 * one at all.
 */
export function Prompts() {
  const { doc, dispatch, goCover } = useStore()

  const blocked = inArtifactViewer()
  const [key, setKeyState] = useState(getKey)
  const [model, setModelState] = useState(getModel)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const live = !blocked && key.trim().length > 0

  const test = async () => {
    setTesting(true)
    setResult(null)
    const reply = await generate('Reply with the single word: ready')
    setResult('text' in reply ? `Connected. The model replied "${reply.text}".` : reply.reason)
    setTesting(false)
  }

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
            background: live ? 'var(--color-affirm-wash)' : 'var(--color-blue-wash)',
            border: `1px solid color-mix(in srgb, ${
              live ? 'var(--color-affirm)' : 'var(--color-blue-ink)'
            } 30%, transparent)`,
            borderRadius: 'var(--radius-card)',
          }}
        >
          <p
            className="type-eyebrow mb-1.5"
            style={{ color: live ? 'var(--color-affirm)' : 'var(--color-blue-ink)' }}
          >
            {live ? 'Live' : blocked ? 'Cannot run here' : 'Not connected'}
          </p>
          <p className="type-caption text-[var(--color-ink)]">
            {blocked ? PROMPTS_NOT_IN_ARTIFACT : PROMPTS_NEED_A_KEY}
          </p>
        </div>

        {/* The key is the only thing standing between these prompts and the
            model. It stays in this browser and is sent to Anthropic and
            nowhere else — fine on a facilitator's own machine, wrong for a
            page the public can open. */}
        {!blocked && (
          <div className="mt-8">
            <label className="type-eyebrow mb-2 block" htmlFor="anthropic-key">
              Anthropic API key
            </label>
            <input
              id="anthropic-key"
              type="password"
              className="field font-mono !text-[0.8rem]"
              value={key}
              placeholder="sk-ant-…"
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => {
                setKeyState(e.target.value)
                setKey(e.target.value)
                setResult(null)
              }}
            />
            <p className="type-caption mt-2 text-[0.75rem]">
              Kept in this browser only. Anyone who can open this page's developer tools can
              read it, so use a key you are willing to rotate.
            </p>

            <label className="type-eyebrow mt-6 mb-2 block" htmlFor="anthropic-model">
              Model
            </label>
            <select
              id="anthropic-model"
              className="field"
              value={model}
              onChange={(e) => {
                setModelState(e.target.value)
                setModel(e.target.value)
              }}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                  {m.id === DEFAULT_MODEL ? ' — default' : ''}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn btn-ghost mt-5 w-full !py-2.5 !text-[0.85rem]"
              disabled={!key.trim() || testing}
              onClick={() => void test()}
            >
              {testing ? 'Checking…' : 'Test the connection'}
            </button>
            {result && <p className="type-caption mt-3">{result}</p>}
          </div>
        )}

        <div className="mt-10 flex flex-col gap-9">
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
