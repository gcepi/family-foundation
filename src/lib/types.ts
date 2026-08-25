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

/** The two halves the family writes, and the two the assistant returns. */
export type Bargain = {
  noLongerAble: string
  nowHaveTo: string
}

/** Written when a family turns a bargain down. */
export type Refusal = {
  willNot: string
  willStillHaveTo: string
  soStillAble: string
  andAble: string
}

export type Practice = {
  id: string
  participantId: string
  /** The thing they want to automate. Becomes the card title. */
  thing: string
  /** "So you'll no longer have to…" */
  relief: string
  bargain: Bargain | null
  decision: Decision
  refusal: Refusal | null
}

export type ValueCard = {
  id: string
  title: string
  blurb: string
}

export type SectionId = 'portrait' | 'practices' | 'constitution' | 'covenant'

export type FamilyDocument = {
  participants: Participant[]
  origin: Origin
  practices: Practice[]
  /** Order of the practice cards after the family rearranges them. */
  practiceOrder: string[]
  /** What the assistant noticed across the kept and refused bargains. */
  praxisReflection: string
  /** What the family writes back. */
  praxisStatement: string
  /** Value ids, most important first. */
  valueRanking: string[]
  telosSummary: string
  completed: {
    setup: boolean
    origin: boolean
    practices: boolean
    praxis: boolean
    constitution: boolean
  }
}

export const emptyDocument = (): FamilyDocument => ({
  participants: [],
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
  praxisReflection: '',
  praxisStatement: '',
  valueRanking: [],
  telosSummary: '',
  completed: {
    setup: false,
    origin: false,
    practices: false,
    praxis: false,
    constitution: false,
  },
})
