import type { Bargain, Participant, Practice, Standing } from '~/lib/types'
import { valueById } from '~/data/values'

/* ==========================================================================
   The assistant.
   --------------------------------------------------------------------------
   Nothing here calls a model. Every exported compose* function is a stub
   that returns the shape the real call will return, built from what the
   family actually typed so the prototype reads like the finished thing.

   The wording of the instructions lives in `src/lib/prompts.ts`, not here.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Trade library
   --------------------------------------------------------------------------
   Stand-in answers, keyed by what families actually say in the room.

   Every trade is written twice where the perspective matters. A child who
   automates homework gives up their own grasp of the material; an adult who
   automates it gives up sight of what the child has not grasped. Writing one
   version and applying it to everyone is how the app ends up telling a
   sixteen-year-old what they are losing about "their kids".
   -------------------------------------------------------------------------- */

type Voice = {
  /** Completes "We will no longer be able to …" */
  noLongerAble: string
  /** Completes "Now we will have to …" */
  nowHaveTo: string
  /** Completes "So we still can …" when the trade is refused. */
  alsoKeeps: string
}

type Trade = {
  keys: string[]
  /** Spoken by an adult in the room. */
  adult: Voice
  /** Spoken by a child. Falls back to `neutral`, then `adult`. */
  kid?: Voice
  /**
   * Used when nobody is attached to the practice — a card the family added
   * by hand. Only needed where the adult voice presumes something about the
   * household, such as that it contains children.
   */
  neutral?: Voice
}

const TRADES: Trade[] = [
  {
    keys: ['laundry', 'washing', 'folding', 'clothes'],
    adult: {
      noLongerAble: 'notice what everyone is wearing, and what they have outgrown',
      nowHaveTo: 'trust something else to know what is delicate, and fix it when it is wrong',
      alsoKeeps: 'keep the ten quiet minutes folding gives us',
    },
    kid: {
      noLongerAble: 'know where our own clothes are without asking',
      nowHaveTo: 'live with whatever it decides is clean',
      alsoKeeps: 'keep doing one thing in this house that is ours to finish',
    },
  },
  {
    keys: ['homework', 'studying', 'study', 'school work', 'schoolwork'],
    adult: {
      noLongerAble: 'find out what our kids do not understand yet',
      nowHaveTo: 'decide, every night, what still counts as their own work',
      alsoKeeps: 'keep hearing them think out loud at the kitchen table',
    },
    kid: {
      noLongerAble: 'find out what we actually understand and what we only recognize',
      nowHaveTo: 'sit an exam on something we never really learned',
      alsoKeeps: 'keep the part where it finally clicks',
    },
    neutral: {
      noLongerAble: 'find out what is actually understood and what is only recognized',
      nowHaveTo: 'decide, every night, what still counts as our own work',
      alsoKeeps: 'keep the part where it finally clicks',
    },
  },
  {
    keys: ['cooking', 'cook', 'dinner', 'meals', 'meal prep'],
    adult: {
      noLongerAble: 'stand in a kitchen together while dinner slowly comes together',
      nowHaveTo: 'find something else to put in that hour, or lose the hour',
      alsoKeeps: 'keep the part of the day when everyone drifts toward the same room',
    },
    kid: {
      noLongerAble: 'learn to feed ourselves before we live somewhere else',
      nowHaveTo: 'eat whatever it decides we like',
      alsoKeeps: 'keep the one skill nobody can take back off us',
    },
  },
  {
    keys: ['grocery', 'groceries', 'shopping', 'errands'],
    adult: {
      noLongerAble: 'change our minds in the aisle when something looks good',
      nowHaveTo: 'keep a list accurate enough for a stranger to shop from',
      alsoKeeps: 'keep the running sense of what this family is actually eating',
    },
  },
  {
    keys: ['cleaning', 'clean', 'tidying', 'vacuum', 'chores', 'room'],
    adult: {
      noLongerAble: 'see our own home the way a guest sees it, room by room',
      nowHaveTo: 'keep the floor clear enough for the machine to work',
      alsoKeeps: 'keep the shared labor that makes a house feel like everyone lives here',
    },
    kid: {
      noLongerAble: 'have one space that answers to us and nobody else',
      nowHaveTo: 'keep it tidy enough for something else to tidy it',
      alsoKeeps: 'keep the right to leave it how we like it',
    },
  },
  {
    keys: ['dishes', 'washing up'],
    adult: {
      noLongerAble: 'let the small nightly reset close out a meal',
      nowHaveTo: 'load it the way the machine expects, every single time',
      alsoKeeps: 'keep the last ten minutes of the evening that nobody scheduled',
    },
  },
  {
    keys: ['commute', 'commuting', 'driving', 'drive', 'carpool', 'car', 'school run'],
    adult: {
      noLongerAble: 'know the way there without being told',
      nowHaveTo: 'keep it charged, updated, insured, and paid for',
      alsoKeeps: 'keep the conversations that only happen in a car',
    },
    kid: {
      noLongerAble: 'learn our own way around the place we live',
      nowHaveTo: 'depend on it working every morning',
      alsoKeeps: 'keep the twenty minutes nobody can interrupt',
    },
  },
  {
    keys: ['email', 'emailing', 'inbox'],
    adult: {
      noLongerAble: 'hear how we actually sound to the people we write to',
      nowHaveTo: 'read what was sent in our name before someone else does',
      alsoKeeps: 'keep writing like ourselves, badly and unmistakably',
    },
  },
  {
    keys: ['text', 'texting', 'messages', 'messaging'],
    adult: {
      noLongerAble: 'sit with a hard message before we answer it',
      nowHaveTo: 'wonder whether a friend wrote back, or something did',
      alsoKeeps: 'keep meaning every word we send',
    },
  },
  {
    keys: ['phone call', 'phone calls', 'calls', 'calling'],
    adult: {
      noLongerAble: "hear someone's voice change when the news is bad",
      nowHaveTo: 'read a summary and hope it caught the part that mattered',
      alsoKeeps: 'keep being the ones who pick up',
    },
  },
  {
    keys: ['budget', 'budgeting', 'finances', 'money', 'bills'],
    adult: {
      noLongerAble: 'feel the weight of what things cost while we are spending',
      nowHaveTo: 'hand a complete picture of our money to something that keeps it',
      alsoKeeps: 'keep knowing, without checking, roughly where we stand',
    },
    kid: {
      noLongerAble: 'learn what things cost before we have to pay for them',
      nowHaveTo: 'take its word for what we can afford',
      alsoKeeps: 'keep the habit of counting before we spend',
    },
  },
  {
    keys: ['calendar', 'scheduling', 'schedule', 'planning', 'plan'],
    adult: {
      noLongerAble: "carry this family's week around in our heads",
      nowHaveTo: 'enter every commitment, or it does not exist',
      alsoKeeps: 'keep noticing an overloaded week before it starts',
    },
  },
  {
    keys: ['meal planning', 'menu'],
    adult: {
      noLongerAble: 'eat what we are actually hungry for',
      nowHaveTo: "explain this family's tastes to something that cannot taste",
      alsoKeeps: 'keep the Thursday nights that turn into cereal, and are fine',
    },
  },
  {
    keys: ['reading', 'read', 'books', 'book'],
    adult: {
      noLongerAble: 'be changed by a book instead of informed about one',
      nowHaveTo: "take something else's word for what it said",
      alsoKeeps: 'keep the slow pages that do not summarize well',
    },
    kid: {
      noLongerAble: 'find the book that turns out to be about us',
      nowHaveTo: 'discuss something we did not read',
      alsoKeeps: 'keep reading things nobody assigned',
    },
  },
  {
    keys: ['writing', 'write', 'essays', 'essay', 'journal'],
    adult: {
      noLongerAble: 'find out what we think by writing it down',
      nowHaveTo: 'read it back and work out whether we agree with it',
      alsoKeeps: 'keep the sentence we would not have found any other way',
    },
    kid: {
      noLongerAble: 'work out what we think while we are trying to say it',
      nowHaveTo: 'defend an argument we did not build',
      alsoKeeps: 'keep the first draft that was badly ours',
    },
  },
  {
    keys: ['bedtime', 'reading to', 'tucking', 'stories', 'story'],
    adult: {
      noLongerAble: 'be the voice someone falls asleep to',
      nowHaveTo: 'decide which nights are still worth doing ourselves',
      alsoKeeps: 'keep the last question asked before sleep',
    },
  },
  {
    keys: ['practice', 'piano', 'music', 'instrument', 'sports', 'training'],
    adult: {
      noLongerAble: 'get better at it the slow way, which is the only way',
      nowHaveTo: 'find another place to learn what repetition teaches',
      alsoKeeps: 'keep the difficulty that is doing the actual work',
    },
    kid: {
      noLongerAble: 'get good enough at it to enjoy it',
      nowHaveTo: 'perform something we cannot actually play',
      alsoKeeps: 'keep the week it stopped being hard',
    },
  },
  {
    keys: ['deciding', 'decisions', 'decide', 'choosing', 'advice'],
    adult: {
      noLongerAble: 'practice judgment on small things before the large ones arrive',
      nowHaveTo: 'work out how much of the answer was ours',
      alsoKeeps: 'keep the right to be wrong on our own terms',
    },
  },
  {
    keys: ['yard', 'lawn', 'garden', 'mowing', 'weeding'],
    adult: {
      noLongerAble: 'watch a season turn over from inside the work of it',
      nowHaveTo: 'maintain the thing that maintains the yard',
      alsoKeeps: 'keep the reason to be outside on a Saturday morning',
    },
  },
  {
    keys: ['work', 'job', 'admin', 'paperwork', 'reports'],
    adult: {
      noLongerAble: 'know our own work well enough to spot when it is off',
      nowHaveTo: 'check it closely enough to sign our names to it',
      alsoKeeps: 'keep the competence that only comes from doing the boring parts',
    },
  },
]

const GENERIC: Voice = {
  noLongerAble: 'get better at it by doing it, which is how anyone got good at it',
  nowHaveTo: 'check the result closely enough to know when it is wrong',
  alsoKeeps: 'keep the judgment that only comes from having done it ourselves',
}

/**
 * Longest key wins, so "meal planning" beats "planning". Falls back to the
 * adult voice when a trade has no kid variant, which is deliberate: those
 * entries are written to read sensibly for anyone.
 */
const matchTrade = (thing: string, standing?: Standing): Voice => {
  const t = thing.toLowerCase().trim()
  if (!t) return GENERIC
  let best: Trade | null = null
  let bestLen = 0
  for (const trade of TRADES) {
    for (const key of trade.keys) {
      if (t.includes(key) && key.length > bestLen) {
        best = trade
        bestLen = key.length
      }
    }
  }
  if (!best) return GENERIC
  if (standing === 'kid') return best.kid ?? best.neutral ?? best.adult
  if (standing === 'grownup') return best.adult
  /* Nobody attached: never assume the household has children in it. */
  return best.neutral ?? best.adult
}

/* --------------------------------------------------------------------------
   Stubs
   -------------------------------------------------------------------------- */

/** TODO(api): replace with a model call using PROMPT_BARGAIN. */
export function composeBargain(practice: Practice, standing?: Standing): Bargain {
  return matchTrade(practice.thing, standing)
}

/**
 * Drop the leading capital only.
 *
 * Families type "Homework" and "Every Saturday morning"; these clauses get
 * spliced mid-sentence, so the first letter has to come down — but a blanket
 * toLowerCase would take Saturday, Cleveland and Mom down with it.
 */
export const decap = (s: string): string => {
  const t = s.trim()
  return t ? t.charAt(0).toLowerCase() + t.slice(1) : t
}

const list = (items: string[]): string => {
  const clean = items.filter(Boolean)
  if (clean.length === 0) return ''
  if (clean.length === 1) return clean[0]
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`
  return `${clean.slice(0, -1).join(', ')}, and ${clean[clean.length - 1]}`
}

/** TODO(api): replace with a model call using PROMPT_PRACTICES_REFLECTION. */
export function composePracticesReflection(
  practices: Practice[],
  _participants: Participant[],
  familyName: string,
): string {
  const kept = practices.filter((p) => p.decision === 'kept')
  const refused = practices.filter((p) => p.decision === 'refused')
  const family = familyName.trim() ? `The ${familyName.trim()} family` : 'This family'
  const keptNames = list(kept.map((p) => decap(p.thing)))
  const refusedNames = list(refused.map((p) => decap(p.thing)))

  if (!kept.length && !refused.length) {
    return `${family} has not weighed any trades yet. Once you do, what you kept and what you refused will show up here.`
  }

  if (kept.length && !refused.length) {
    return `${family} took every bargain on the table — ${keptNames}. That is a real answer, not a failure of nerve: you looked at what each one costs and decided the cost was worth paying. What you have not yet said is where the line would be. Somewhere past these there is a trade you would refuse, and naming it now is easier than naming it later.`
  }

  if (!kept.length && refused.length) {
    return `${family} turned down all of it — ${refusedNames}. Underneath every refusal was the same instinct: the doing was the point, and handing off the doing would have cost you the thing you were actually after. That instinct is worth writing down before it gets tested by something more convenient than what was on this list.`
  }

  return (
    `${family} said yes to ${keptNames}, and no to ${refusedNames}. ` +
    `The trades you took were the ones where the work was on the way to something else — ` +
    `nobody here is trying to protect ${decap(kept[0].thing)} for its own sake. ` +
    `The ones you refused were the ones where the doing was the point. ` +
    `That line — between work you would hand over and work you would not — is your practice. Say it in your own words.`
  )
}

/** TODO(api): replace with a model call using PROMPT_VALUES_REFLECTION. */
export function composeValuesReflection(ranking: string[], familyName: string): string {
  const top = ranking.slice(0, 3).map((id) => valueById(id)).filter(Boolean)
  if (top.length < 3) return ''
  const family = familyName.trim() ? `The ${familyName.trim()} family` : 'This family'
  const [a, b, c] = top.map((v) => decap(v!.title))

  return (
    `${family} is becoming a family that puts ${a} first. ` +
    `Not as a rule posted on the refrigerator, but as the thing you reach for when a choice is genuinely hard. ` +
    `Close behind it sit ${b} and ${c} — and the order matters, because it tells you what gives way when two of them pull against each other. ` +
    `This is the aim. Not who you are on a good week, but who you intend to be when it costs something.`
  )
}

/* --------------------------------------------------------------------------
   Latency
   --------------------------------------------------------------------------
   Real calls take a moment. Instant stub answers read as canned, so the
   prototype waits — long enough to feel like work, short enough for a room
   full of families to sit through.
   -------------------------------------------------------------------------- */

export const think = <T,>(produce: () => T, ms = 1600): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(produce()), ms))
