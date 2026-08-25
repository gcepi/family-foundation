import type { ValueCard } from '~/lib/types'

/**
 * The values index, rewritten for a family to read out loud.
 *
 * The academic label for each value is deliberately absent — a family
 * sorting these should be weighing the thing itself, not a vocabulary word.
 * Blurbs are synonyms rather than examples, so nobody sorts a scenario they
 * happen to recognize instead of the value underneath it.
 */
export const VALUES: ValueCard[] = [
  {
    id: 'own-minds',
    title: 'Thinking for ourselves',
    blurb: 'Making up our own minds. Choosing, exploring, working it out on our own.',
  },
  {
    id: 'new-things',
    title: 'Trying new things',
    blurb: 'Adventure, surprise, a real challenge — and the nerve to take it on.',
  },
  {
    id: 'enjoying-life',
    title: 'Enjoying life',
    blurb: 'Delight, warmth, savoring the good parts of a day while they are here.',
  },
  {
    id: 'getting-good',
    title: 'Getting good at things',
    blurb: 'Skill, craft, practice. Work we would be glad to put our name on.',
  },
  {
    id: 'a-say',
    title: 'Having a say in what happens to us',
    blurb: 'Standing, influence, a hand on the wheel of our own life.',
  },
  {
    id: 'safe-and-steady',
    title: 'Feeling safe and steady',
    blurb: 'Calm, stability, a home that holds when everything else shakes.',
  },
  {
    id: 'not-letting-down',
    title: 'Not letting people down',
    blurb: 'Restraint, consideration, keeping our word to the people counting on us.',
  },
  {
    id: 'what-we-were-handed',
    title: 'Keeping what we were handed',
    blurb: 'Roots, inheritance, the customs and convictions passed down to us.',
  },
  {
    id: 'our-people',
    title: 'Taking care of our people',
    blurb: 'Loyalty, kindness, showing up for the ones closest to us.',
  },
  {
    id: 'everyone',
    title: 'Looking out for everyone, not just us',
    blurb: 'Fairness, and care for strangers and for the world we all share.',
  },
]

export const valueById = (id: string) => VALUES.find((v) => v.id === id)
