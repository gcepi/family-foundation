import type { ValueCard } from '~/lib/types'

/**
 * The values index, rewritten for a family to read out loud.
 *
 * The academic label for each value is deliberately absent — a family
 * sorting these should be weighing the thing itself, not a vocabulary word.
 * Every description is a complete sentence beginning "We value…", short
 * enough to take in at a glance while two cards are being compared.
 */
export const VALUES: ValueCard[] = [
  {
    id: 'enjoying-life',
    title: 'Enjoying life',
    blurb: 'We value moments that bring us happiness.',
  },
  {
    id: 'getting-good',
    title: 'Being good at things',
    blurb: 'We value success through demonstrated competence.',
  },
  {
    id: 'safe-and-steady',
    title: 'Feeling safe',
    blurb: 'We value the security of our information and privacy.',
  },
  {
    id: 'own-minds',
    title: 'Thinking for ourselves',
    blurb: 'We value critical thinking and decision making that is not influenced by others.',
  },
  {
    id: 'our-people',
    title: 'Taking care of people we know',
    blurb: 'We value the welfare of our friends, family, and close-knit community.',
  },
  {
    id: 'a-say',
    title: 'Having a say in what happens to us',
    blurb: 'We value our control over our circumstances and environments.',
  },
  {
    id: 'new-things',
    title: 'Trying new things',
    blurb: 'We value new and exciting experiences.',
  },
  {
    id: 'what-we-were-handed',
    title: 'The way things have been done',
    blurb: 'We value the lessons we have learned from the past.',
  },
  {
    id: 'not-letting-down',
    title: 'Not letting others down',
    blurb: "We value others' expectations and not feeling like a burden.",
  },
  {
    id: 'everyone',
    title: 'Caring for the world',
    blurb: 'We value the welfare of all people and nature.',
  },
]

export const valueById = (id: string) => VALUES.find((v) => v.id === id)
