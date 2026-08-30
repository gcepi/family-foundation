import { composeBargain, composePracticesReflection, composeValuesReflection, decap, think } from '~/lib/assistant'
import { canGenerate, firstJsonObject, generate } from '~/lib/anthropic'
import { defaultPromptText, fill, type PromptId } from '~/lib/prompts'
import { valueById } from '~/data/values'
import type { Bargain, Participant, Practice, Standing } from '~/lib/types'

/**
 * The seam between the written library and the live model.
 *
 * Every generated field goes through here. With a key entered and a
 * reachable API, the family's own prompt is sent and the answer is what
 * they read. Otherwise the hand-written fallback answers instead — silently,
 * because a family mid-activity should not be shown a network error.
 */

type Prompts = Record<string, string>

const promptFor = (prompts: Prompts, id: PromptId) =>
  (prompts[id] ?? '').trim() || defaultPromptText(id)

/** "A", "A and B", "A, B, and C". */
const list = (items: string[]): string => {
  const n = items.filter(Boolean)
  if (!n.length) return 'nothing'
  if (n.length === 1) return n[0]
  if (n.length === 2) return `${n[0]} and ${n[1]}`
  return `${n.slice(0, -1).join(', ')}, and ${n[n.length - 1]}`
}

const standingWords = (standing?: Standing) =>
  standing === 'kid' ? 'a child in the family' : standing === 'grownup' ? 'an adult in the family' : 'someone in the family, whose age is not known'

const familyWords = (familyName: string) =>
  familyName.trim() ? `the ${familyName.trim()} family` : 'this family'

/** One clause, tidied the way the prompt asks for but does not guarantee. */
const clause = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\.$/, '').replace(/^we\s+/i, '')
}

/* -------------------------------------------------------------------------- */

export async function bargainFor(
  practice: Practice,
  standing: Standing | undefined,
  prompts: Prompts,
): Promise<Bargain> {
  const fallback = () => composeBargain(practice, standing)
  if (!canGenerate()) return fallback()

  const result = await generate(
    fill(promptFor(prompts, 'bargain'), {
      thing: decap(practice.thing),
      relief: decap(practice.relief),
      standing: standingWords(standing),
    }),
  )
  if (!('text' in result)) return fallback()

  const parsed = firstJsonObject(result.text)
  if (!parsed) return fallback()

  const bargain: Bargain = {
    noLongerAble: clause(parsed.noLongerAble),
    nowHaveTo: clause(parsed.nowHaveTo),
    alsoKeeps: clause(parsed.alsoKeeps),
  }
  /* A half-filled bargain is worse than a written one: the card has four
     rows and every one of them has to say something. */
  if (!bargain.noLongerAble || !bargain.nowHaveTo || !bargain.alsoKeeps) return fallback()
  return bargain
}

export async function practicesReflectionFor(
  practices: Practice[],
  participants: Participant[],
  familyName: string,
  prompts: Prompts,
): Promise<string> {
  const fallback = () =>
    think(() => composePracticesReflection(practices, participants, familyName), 2000)
  if (!canGenerate()) return fallback()

  const result = await generate(
    fill(promptFor(prompts, 'practicesReflection'), {
      kept: list(practices.filter((p) => p.decision === 'kept').map((p) => decap(p.thing))),
      refused: list(practices.filter((p) => p.decision === 'refused').map((p) => decap(p.thing))),
      family: familyWords(familyName),
    }),
  )
  return 'text' in result ? result.text : fallback()
}

export async function valuesReflectionFor(
  ranking: string[],
  familyName: string,
  prompts: Prompts,
): Promise<string> {
  const fallback = () => think(() => composeValuesReflection(ranking, familyName), 2000)
  if (!canGenerate()) return fallback()

  const titles = ranking.map((id) => valueById(id)?.title).filter(Boolean) as string[]
  const result = await generate(
    fill(promptFor(prompts, 'valuesReflection'), {
      ranking: titles.map((t, i) => `${i + 1}. ${t}`).join('; '),
      topThree: list(titles.slice(0, 3).map(decap)),
      family: familyWords(familyName),
    }),
  )
  return 'text' in result ? result.text : fallback()
}
