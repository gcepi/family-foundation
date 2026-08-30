import Anthropic from '@anthropic-ai/sdk'

/**
 * The live assistant.
 *
 * The prompts in `prompts.ts` are only instructions until something sends
 * them somewhere. This is the somewhere: a key the facilitator pastes in,
 * kept in this browser and sent to api.anthropic.com and nowhere else.
 *
 * Two places this cannot run, and both are handled by falling back to the
 * written library rather than failing in front of a family:
 *
 *   - No key entered.
 *   - Inside the claude.ai artifact viewer, whose content policy blocks
 *     every request to an outside host. `window.claude` exists only inside
 *     that viewer, which is how we know.
 */

const KEY = 'family-foundation.anthropic-key'
const MODEL = 'family-foundation.anthropic-model'

export const MODELS = [
  { id: 'claude-opus-5', label: 'Claude Opus 5' },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
] as const

export const DEFAULT_MODEL = 'claude-opus-5'

const read = (name: string): string => {
  try {
    return localStorage.getItem(name) ?? ''
  } catch {
    return ''
  }
}

const write = (name: string, value: string) => {
  try {
    if (value) localStorage.setItem(name, value)
    else localStorage.removeItem(name)
  } catch {
    /* Private mode. The session still works, it just will not remember. */
  }
}

export const getKey = () => read(KEY)
export const setKey = (value: string) => write(KEY, value.trim())
export const getModel = () => read(MODEL) || DEFAULT_MODEL
export const setModel = (value: string) => write(MODEL, value)

/**
 * True inside the claude.ai artifact viewer.
 *
 * The viewer puts `window.claude` on the page before any of our code runs;
 * the same page opened anywhere else has no such object. Nothing is called
 * on it — its presence is the whole signal.
 */
export const inArtifactViewer = (): boolean =>
  typeof window !== 'undefined' && 'claude' in window

/** Whether a live call has any chance of succeeding from here. */
export const canGenerate = (): boolean => !inArtifactViewer() && getKey().length > 0

let client: Anthropic | null = null
let clientKey = ''

function clientFor(key: string): Anthropic {
  if (!client || clientKey !== key) {
    /* The key belongs to whoever is running the session and never leaves
       this browser except to Anthropic. Fine for a facilitator's own
       machine; a public deployment must move this behind a server. */
    client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true })
    clientKey = key
  }
  return client
}

/** The reason a live call could not be made, in words a person can act on. */
export type GenerateFailure = { reason: string }

/**
 * One completion. Resolves to the model's text, or to a failure a caller
 * can quietly fall back from.
 */
export async function generate(
  prompt: string,
): Promise<{ text: string } | GenerateFailure> {
  if (inArtifactViewer()) {
    return { reason: 'The artifact viewer blocks outside requests.' }
  }
  const key = getKey()
  if (!key) return { reason: 'No API key entered.' }

  try {
    const response = await clientFor(key).messages.create({
      model: getModel(),
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    if (response.stop_reason === 'refusal') {
      return { reason: 'The model declined to answer that prompt.' }
    }

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim()

    return text ? { text } : { reason: 'The model returned nothing.' }
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { reason: 'That API key was not accepted.' }
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { reason: 'Rate limited. Wait a moment and try again.' }
    }
    if (error instanceof Anthropic.APIError) {
      return { reason: `The API returned ${error.status}.` }
    }
    return { reason: 'Could not reach the API from this browser.' }
  }
}

/** Pulls the first JSON object out of a reply that may be wrapped in prose. */
export function firstJsonObject(text: string): Record<string, unknown> | null {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    const parsed: unknown = JSON.parse(text.slice(start, end + 1))
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}
