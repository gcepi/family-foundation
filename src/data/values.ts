import type { ValueCard } from '~/lib/types'

/**
 * The values index, rewritten for a family to read out loud.
 *
 * The academic label for each value is deliberately absent — a family
 * sorting these should be weighing the thing itself, not a vocabulary word.
 * Blurbs are one short phrase, not a list of synonyms: these are compared
 * two at a time on a narrow screen, and a family reading them aloud needs
 * something they can finish in one breath.
 */
export const VALUES: ValueCard[] = [
  {
    id: 'own-minds',
    title: 'Thinking for ourselves',
    blurb: 'Making up our own minds.',
  },
  {
    id: 'new-things',
    title: 'Trying new things',
    blurb: 'Adventure, and the nerve to take it on.',
  },
  {
    id: 'enjoying-life',
    title: 'Enjoying life',
    blurb: 'Delight in an ordinary day.',
  },
  {
    id: 'getting-good',
    title: 'Getting good at things',
    blurb: 'Skill worth putting our name on.',
  },
  {
    id: 'a-say',
    title: 'Having a say in what happens to us',
    blurb: 'A hand on the wheel of our own life.',
  },
  {
    id: 'safe-and-steady',
    title: 'Feeling safe and steady',
    blurb: 'A home that holds when things shake.',
  },
  {
    id: 'not-letting-down',
    title: 'Not letting people down',
    blurb: 'Keeping our word.',
  },
  {
    id: 'what-we-were-handed',
    title: 'Keeping what we were handed',
    blurb: 'The customs passed down to us.',
  },
  {
    id: 'our-people',
    title: 'Taking care of our people',
    blurb: 'Showing up for the ones closest to us.',
  },
  {
    id: 'everyone',
    title: 'Looking out for everyone, not just us',
    blurb: 'Care that reaches past our own door.',
  },
]

export const valueById = (id: string) => VALUES.find((v) => v.id === id)
