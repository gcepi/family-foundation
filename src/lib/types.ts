export type Standing = 'grownup' | 'kid'

export type Participant = {
  id: string
  name: string
  standing: Standing
}

export type Origin = {
  familyName: string
  /** Q — Who is in our family? */
  memberNames: string[]
  /** Q — Where does our family live? */
  livesIn: string
  /** Q — When did our family start? */
  startedWhen: string
  /** Q — Where did our family start? */
  startedWhere: string
  /** Q — Why did our family start? */
  startedWhy: string
}

export type Decision = 'pending' | 'kept' | 'refused'

/**
 * The three clauses the assistant supplies. The family writes the first two
 * halves of the bargain themselves (the thing, and the burden it lifts);
 * these are the parts nobody advertises.
 *
 * One shape serves both outcomes. Accepting and refusing are the same
 * bargain read in opposite directions, so they get the same four rows and
 * the same formatting — only the labels change.
 */
export type Bargain = {
  /** "We will no longer be able to …" — kept. */
  noLongerAble: string
  /** "Now we will have to …" — kept. */
  nowHaveTo: string
  /** "So we still can …" — refused. */
  alsoKeeps: string
}

export type Practice = {
  id: string
  /** Empty when the family added it by hand rather than in the round. */
  participantId: string
  /** The thing to automate. Becomes the card title. */
  thing: string
  /** "So I'll no longer have to…" */
  relief: string
  bargain: Bargain | null
  decision: Decision
}

export type ValueCard = {
  id: string
  title: string
  blurb: string
}

export type SectionId = 'portrait' | 'practices' | 'values' | 'signatures'

/** Sections and subsections that open and close. */
export type PanelId = 'portrait' | 'practices' | 'values' | 'origin' | 'praxis' | 'telos'

export type FamilyDocument = {
  participants: Participant[]
  /** A photo the family takes on the spot, as a data URI. */
  photo: string | null
  origin: Origin
  practices: Practice[]
  /** Order of the practice cards after the family rearranges them. */
  practiceOrder: string[]
  /**
   * How far into the Origin questions the family has got. Kept here rather
   * than in the component so leaving the activity and coming back lands
   * them where they were.
   */
  originStep: number
  /**
   * Consider this under Family Practices — what the assistant noticed
   * across the kept and refused bargains. Editable by the family.
   */
  practicesReflection: string
  /**
   * Consider this under Family Values — the ranking read back. Editable,
   * and regenerated on request after the family reorders the list.
   */
  valuesReflection: string
  /**
   * Praxis and Telos are free paragraphs. Each is seeded once from the
   * Consider this above it and is independently editable after that —
   * a paste-in, not a live mirror.
   */
  praxisStatement: string
  telosStatement: string
  /** Value ids, most important first. */
  valueRanking: string[]
  /**
   * Prompt text the family (or facilitator) has edited in the app, keyed by
   * prompt id. Absent keys fall back to the defaults in `lib/prompts.ts`.
   */
  prompts: Record<string, string>
  /** What each participant typed on their signature line, keyed by id. */
  signatures: Record<string, string>
  /** The date the family put on the finished foundation, as yyyy-mm-dd. */
  createdOn: string
  /** Panels the family has opened. Everything starts closed. */
  expanded: PanelId[]
  completed: {
    setup: boolean
    origin: boolean
    practices: boolean
    values: boolean
  }
}

export const emptyDocument = (): FamilyDocument => ({
  participants: [],
  photo: null,
  origin: {
    familyName: '',
    memberNames: [],
    livesIn: '',
    startedWhen: '',
    startedWhere: '',
    startedWhy: '',
  },
  practices: [],
  practiceOrder: [],
  originStep: 0,
  practicesReflection: '',
  valuesReflection: '',
  praxisStatement: '',
  telosStatement: '',
  valueRanking: [],
  prompts: {},
  signatures: {},
  createdOn: new Date().toISOString().slice(0, 10),
  expanded: [],
  completed: {
    setup: false,
    origin: false,
    practices: false,
    values: false,
  },
})
