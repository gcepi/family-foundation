/* ==========================================================================
   PROMPTS
   --------------------------------------------------------------------------
   The instructions the assistant is given, one per generated field.

   These are the DEFAULTS. They can be edited inside the app itself —
   Contents page → "AI prompts" — and edits are saved with the family's
   document, so a tuned prompt survives a reload and travels with the
   prototype. This file is only the starting text.

   Placeholders in {braces} are filled in at call time. Everything else is
   sent to the model exactly as written.
   ========================================================================== */

/**
 * Where the generated text comes from, in plain words, shown at the top of
 * the in-app editor.
 *
 * With a key entered, these prompts are sent to Claude and the answer is
 * what the family reads. Without one — and inside the claude.ai artifact
 * viewer, which cannot reach the API at all — the app falls back to a
 * hand-written library in `assistant.ts`, matched on keywords. That is why
 * the fallback text reads flat: it was never generated, only selected.
 */
export const PROMPTS_NEED_A_KEY =
  'Enter an Anthropic API key below and these prompts go to Claude for real — edit one and ' +
  'the next thing the app writes will follow it. Without a key the app falls back to a fixed ' +
  'library of written answers, which is why that text reads flat.'

export const PROMPTS_NOT_IN_ARTIFACT =
  'This copy is running inside the claude.ai artifact viewer, which blocks requests to outside ' +
  'services. Live generation cannot run here no matter what key is entered. Run the app locally ' +
  'or deploy it to a web address to see these prompts working.'

export type PromptId = 'bargain' | 'practicesReflection' | 'valuesReflection'

export type PromptSpec = {
  id: PromptId
  /** What the family sees generated from it. */
  label: string
  where: string
  /** Names the app fills in at call time. */
  placeholders: string[]
  text: string
}

export const DEFAULT_PROMPTS: PromptSpec[] = [
  {
    id: 'bargain',
    label: 'The bargain',
    where: 'The two blue lines on every practice card',
    placeholders: ['{thing}', '{relief}', '{standing}'],
    text: `You complete a philosophical innovation bargain for a family seeking to engage with technology in a thoughtful way.
The innovation bargain has 4 parts, the first two variables are provided by the user (something made possible and a burden that is relieved), and the second two variables will be surfaced by you (something that is sacrificed and its ensuing consequence).

This family's bargain:
- Now we can: {thing}
- We'll no longer have to: {relief}
- The person speaking is: {standing}

Consider these examples before you answer:
**Writing**
- Now you can: Transmit information across space and time.
- You'll no longer have to: Orally transmit and remember all knowledge.
- You'll no longer be able to: Orally transmit and remember hardly anything.
- Now you'll have to: Write things down to remember them.
**The highway**
- Now you can: travel much more efficiently and quickly.
- You'll no longer have to: slowly wade through difficult terrain.
- You'll no longer be able to: wander and explore on foot.
- Now you'll have to: purchase and maintain an automobile.

Notice how these are easy to grasp and understand but also how they come from First Principles (a foundational truth or basic assumption that cannot be deduced or broken down any further).
Return three clauses:
  1. noLongerAble
  2. nowHaveTo
  3. alsoKeeps (if the user decides to reject the bargain, this is a second good they keep instead)

Rules:
- First person plural, in the family's voice. The clause completes a sentence that already begins "We will no longer be able to …".
- One clause each, under fourteen words, no trailing period, no leading "we".
- Concrete and specific. Never abstract nouns like "connection" or "presence".
- Do not moralize, do not warn, do not recommend. Name the trade and stop.
- Never imply the family chose wrongly. Every clause must be plainly true.

IMPORTANT — write from the standing given above. A child automating homework loses their own understanding of the material; an adult automating homework loses sight of what their child does not yet grasp. Do not assume a parent is speaking, and never attribute children to someone who may not have any.

Reply with a JSON object and nothing else, in this exact shape:
{"noLongerAble": "…", "nowHaveTo": "…", "alsoKeeps": "…"}`,
  },
  {
    id: 'practicesReflection',
    label: 'Consider this — Family Practices',
    where: 'Under the practice cards, and the seed for the Praxis statement',
    placeholders: ['{kept}', '{refused}', '{family}'],
    text: `You are helping a family create a Praxis statement as part of an AI philosophy course.
A Praxis is The practical application of ideas, lessons, and theory.
The family Praxis includes commitments, habits, and behaviors that shape us over time.
The family just completed an activity that examines the consequences of technology that they take for granted.
What we choose to embrace on a small scale can help inform the Praxis that we want our family to live by.

The family is {family}.

Read everything a family kept ({kept}) and everything they refused ({refused}).
Name the pattern underneath the choices in two or three sentences. Reflect, do not advise. Use their own words where you can. Never flatter. End by handing the Praxis sentence back to them, unfinished.
Do not assume the family contains children, or parents, or any particular shape. Say "the family" and the names given, nothing more.

Reply with the paragraph itself and nothing else. No heading, no preamble, no quotation marks.`,
  },
  {
    id: 'valuesReflection',
    label: 'Consider this — Family Values',
    where: 'Under the ranked values, and the seed for the Telos statement',
    placeholders: ['{ranking}', '{topThree}', '{family}'],
    text: `You are helping a family create a Telos statement as part of an AI philosophy course.
A Telos is the ultimate goal, end, or vision of the good life that we aim to live toward.
Our family Telos is informed by our deepest desires and affections.
The family just completed an activity that put two values in front of them at a time and asked which mattered more.
The things we value point toward the life we are looking for.

The family is {family}.

Read the order they arrived at ({ranking}), and above all the three they put first ({topThree}).
Name the pattern underneath the order in two or three sentences. Reflect, do not advise. Use their own words where you can. Never flatter. End by handing the Telos sentence back to them, unfinished.
Do not assume the family contains children, or parents, or any particular shape. Say "the family" and the names given, nothing more.

Reply with the paragraph itself and nothing else. No heading, no preamble, no quotation marks.`,
  },
]

export const defaultPromptText = (id: PromptId): string =>
  DEFAULT_PROMPTS.find((p) => p.id === id)?.text ?? ''

/** Fills {placeholders} without touching JSON braces in the prompt body. */
export function fill(text: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (out, [key, value]) => out.split(`{${key}}`).join(value),
    text,
  )
}
