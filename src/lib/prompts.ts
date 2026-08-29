/* ==========================================================================
   PROMPTS
   --------------------------------------------------------------------------
   The instructions the assistant will be given, one per generated field.

   These are the DEFAULTS. They can be edited inside the app itself —
   Contents page → "AI prompts" — and edits are saved with the family's
   document, so a tuned prompt survives a reload and travels with the
   prototype. This file is only the starting text.

   Read `PROMPTS_ARE_NOT_LIVE_YET` before assuming an edit changes anything.
   ========================================================================== */

/**
 * The honest caveat, shown at the top of the in-app editor.
 *
 * Nothing here is sent anywhere yet. Today's generated text comes from a
 * hand-written library in `assistant.ts`, matched on keywords — which is
 * why the output reads flat: it was never generated, only selected. Editing
 * a prompt records the wording that will be used once a model is wired up;
 * it does not change what the app produces right now.
 */
export const PROMPTS_ARE_NOT_LIVE_YET =
  'These prompts are not connected to a model yet, so editing one will not change ' +
  'the text this prototype produces. Today that text comes from a fixed library of ' +
  'written answers, which is why it reads flat. What you write here is saved and will ' +
  'be the wording used the day the assistant is switched on.'

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
    text: `You complete an innovation bargain for a family.

A family member — {standing} — wants to automate {thing}, so they will no
longer have to {relief}.

Return three clauses:
  1. noLongerAble — a real human capacity that burden was quietly producing.
  2. nowHaveTo    — a real obligation the automation creates in its place.
  3. alsoKeeps    — a second good they keep if they refuse the trade instead.

Rules:
- First person plural, in the family's voice. The clause completes a sentence
  that already begins "We will no longer be able to …".
- One clause each, under fourteen words, no trailing period, no leading "we".
- Concrete and specific. Never abstract nouns like "connection" or "presence".
- Do not moralize, do not warn, do not recommend. Name the trade and stop.
- Never imply the family chose wrongly. Every clause must be plainly true.

IMPORTANT — write from the standing given above. A child automating homework
loses their own understanding of the material; an adult automating homework
loses sight of what their child does not yet grasp. Do not assume a parent is
speaking, and never attribute children to someone who may not have any.`,
  },
  {
    id: 'practicesReflection',
    label: 'Consider this — Family Practices',
    where: 'Under the practice cards, after the activity',
    placeholders: ['{kept}', '{refused}', '{familyName}'],
    text: `Read everything a family kept ({kept}) and everything they refused
({refused}).

Name the pattern underneath the choices in two or three sentences. Reflect, do
not advise. Use their own words where you can. Never flatter. End by handing
the sentence back to them, unfinished.

Do not assume the family contains children, or parents, or any particular
shape. Say "the family" and the names given, nothing more.`,
  },
  {
    id: 'valuesReflection',
    label: 'Consider this — Family Values',
    where: 'Under the sorted values, and seeds the Telos',
    placeholders: ['{topThree}', '{ranking}', '{familyName}'],
    text: `Given a family's values in the order they ranked them ({ranking}),
write three or four sentences describing the kind of family they are becoming.

Lead with their top three ({topThree}). Speak to the direction they are
heading rather than summarising the list. Present tense, warm but
unsentimental. No lists, no headings. This is a paragraph they will edit and
sign as their Telos.`,
  },
]

export const defaultPromptText = (id: PromptId): string =>
  DEFAULT_PROMPTS.find((p) => p.id === id)?.text ?? ''
