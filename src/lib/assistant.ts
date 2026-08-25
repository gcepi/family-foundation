import type { Bargain, Participant, Practice, Refusal } from '~/lib/types'
import { valueById } from '~/data/values'

/* ==========================================================================
   The assistant.
   ------------------------------------------------------------------------
   Nothing here calls a model. Every function below is a stub that returns
   the shape the real call will return, composed from what the family
   actually typed so the prototype reads like the finished thing.

   Each stub carries the prompt it will eventually send. Keeping the prompt
   beside the stub is what holds the responses consistent once this is wired
   up — the shape of the answer is specified here, not improvised later.
   ========================================================================== */

/** Every reply the assistant gives about a trade runs through this frame. */
export const INNOVATION_BARGAIN_FRAME = `Andy Crouch's innovation bargain has four parts. Two are advertised, two are not:

  Now you can …               the new ability
  You'll no longer have to …  the burden lifted
  You're no longer able to …  the ability quietly given up
  Now you'll have to …        the new obligation taken on

A family names the first two for themselves. The assistant's only job is to
name the last two, honestly and without scolding.`

export const PROMPT_BARGAIN = `You complete an innovation bargain for a family.

The family has named something they want to automate and the burden it lifts.
Return the two consequences they did not name:
  1. noLongerAble — a real human capacity the burden was quietly producing.
  2. nowHaveTo — a real obligation the automation creates in its place.

Rules:
- Second person, addressed to the family.
- One clause each, under fourteen words, no trailing period.
- Concrete and specific. Never abstract nouns like "connection" or "presence".
- Do not moralize, do not warn, do not recommend. Name the trade and stop.
- Never imply the family chose wrongly. Both halves must be plainly true.`

export const PROMPT_REFUSAL = `A family has turned down an innovation bargain.
Draft the inverse in their voice, first person plural, four short clauses:
  willNot / willStillHaveTo / soStillAble / andAble
Keep every clause under twelve words. Plain, unsentimental, no period.
This is a draft the family will edit. Leave room for them to disagree with it.`

export const PROMPT_PRAXIS = `Read everything a family kept and everything they refused.
Name the pattern underneath the choices in two or three sentences.
Reflect, do not advise. Use their own words where you can. Never flatter.
End by handing the sentence back to them, unfinished.`

export const PROMPT_TELOS = `Given a family's values in the order they ranked them,
write three or four sentences describing the kind of family they are becoming.
Lead with their top three. Present tense, warm but unsentimental.
No lists, no headings. This is a paragraph they will edit and sign.`

/* --------------------------------------------------------------------------
   Trade library
   --------------------------------------------------------------------------
   Stand-in responses, keyed by what families actually say in the room.
   The generic fallback is written to hold up against anything unmatched.
   -------------------------------------------------------------------------- */

type Trade = {
  keys: string[]
  noLongerAble: string
  nowHaveTo: string
  alsoKeeps: string
}

const TRADES: Trade[] = [
  {
    keys: ['laundry', 'washing', 'folding', 'clothes'],
    noLongerAble: 'notice what your kids are wearing, and what they have outgrown',
    nowHaveTo: 'trust something else to know what is delicate, and fix it when it is wrong',
    alsoKeeps: 'keep the ten quiet minutes folding gives you',
  },
  {
    keys: ['homework', 'studying', 'study', 'school work', 'schoolwork'],
    noLongerAble: 'find out what your kid does not understand yet',
    nowHaveTo: 'decide, every night, what still counts as their own work',
    alsoKeeps: 'keep hearing them think out loud at the kitchen table',
  },
  {
    keys: ['cooking', 'cook', 'dinner', 'meals', 'meal prep'],
    noLongerAble: 'stand in a kitchen together while dinner slowly comes together',
    nowHaveTo: 'find something else to put in that hour, or lose the hour',
    alsoKeeps: 'keep the part of the day when everyone drifts toward the same room',
  },
  {
    keys: ['grocery', 'groceries', 'shopping', 'errands'],
    noLongerAble: 'change your mind in the aisle when something looks good',
    nowHaveTo: 'keep a list accurate enough for a stranger to shop from',
    alsoKeeps: 'keep the running sense of what your family is actually eating',
  },
  {
    keys: ['cleaning', 'clean', 'tidying', 'vacuum', 'chores'],
    noLongerAble: 'see your own home the way a guest sees it, room by room',
    nowHaveTo: 'keep the floor clear enough for the machine to work',
    alsoKeeps: 'keep the shared labor that makes a house feel like everyone lives here',
  },
  {
    keys: ['dishes', 'washing up'],
    noLongerAble: 'let the small nightly reset close out a meal',
    nowHaveTo: 'load it the way the machine expects, every single time',
    alsoKeeps: 'keep the last ten minutes of the evening that nobody scheduled',
  },
  {
    keys: ['commute', 'commuting', 'driving', 'drive', 'carpool', 'car'],
    noLongerAble: 'know the way there without being told',
    nowHaveTo: 'keep it charged, updated, insured, and paid for',
    alsoKeeps: 'keep the conversations that only happen in a car',
  },
  {
    keys: ['email', 'emailing', 'inbox'],
    noLongerAble: 'hear how you actually sound to the people you write to',
    nowHaveTo: 'read what was sent in your name before someone else does',
    alsoKeeps: 'keep writing like yourself, badly and unmistakably',
  },
  {
    keys: ['text', 'texting', 'messages', 'messaging'],
    noLongerAble: 'sit with a hard message before you answer it',
    nowHaveTo: 'wonder whether your friend wrote back, or something did',
    alsoKeeps: 'keep meaning every word you send',
  },
  {
    keys: ['phone call', 'phone calls', 'calls', 'calling'],
    noLongerAble: "hear someone's voice change when the news is bad",
    nowHaveTo: 'read a summary and hope it caught the part that mattered',
    alsoKeeps: 'keep being the one who picks up',
  },
  {
    keys: ['budget', 'budgeting', 'finances', 'money', 'bills'],
    noLongerAble: 'feel the weight of what things cost while you are spending',
    nowHaveTo: 'hand a complete picture of your money to something that keeps it',
    alsoKeeps: 'keep knowing, without checking, roughly where you stand',
  },
  {
    keys: ['calendar', 'scheduling', 'schedule', 'planning', 'plan'],
    noLongerAble: "carry your family's week around in your head",
    nowHaveTo: 'enter every commitment, or it does not exist',
    alsoKeeps: 'keep noticing an overloaded week before it starts',
  },
  {
    keys: ['meal planning', 'menu'],
    noLongerAble: 'eat what you are actually hungry for',
    nowHaveTo: "explain your family's tastes to something that cannot taste",
    alsoKeeps: 'keep the Thursday nights that turn into cereal, and are fine',
  },
  {
    keys: ['reading', 'read', 'books', 'book'],
    noLongerAble: 'be changed by a book instead of informed about one',
    nowHaveTo: "take something else's word for what it said",
    alsoKeeps: 'keep the slow pages that do not summarize well',
  },
  {
    keys: ['writing', 'write', 'essays', 'essay', 'journal'],
    noLongerAble: 'find out what you think by writing it down',
    nowHaveTo: 'read it back and work out whether you agree with it',
    alsoKeeps: 'keep the sentence you would not have found any other way',
  },
  {
    keys: ['bedtime', 'reading to', 'tucking', 'stories', 'story'],
    noLongerAble: 'be the voice your kid falls asleep to',
    nowHaveTo: 'decide which nights are still worth doing yourself',
    alsoKeeps: 'keep the last question they ask before they fall asleep',
  },
  {
    keys: ['practice', 'piano', 'music', 'instrument', 'sports', 'training'],
    noLongerAble: 'get better at it the slow way, which is the only way',
    nowHaveTo: 'find another place to learn what repetition teaches',
    alsoKeeps: 'keep the difficulty that is doing the actual work',
  },
  {
    keys: ['deciding', 'decisions', 'decide', 'choosing', 'advice'],
    noLongerAble: 'practice judgment on small things before the large ones arrive',
    nowHaveTo: 'work out how much of the answer was yours',
    alsoKeeps: 'keep the right to be wrong on your own terms',
  },
  {
    keys: ['yard', 'lawn', 'garden', 'mowing', 'weeding'],
    noLongerAble: 'watch a season turn over from inside the work of it',
    nowHaveTo: 'maintain the thing that maintains the yard',
    alsoKeeps: 'keep the reason to be outside on a Saturday morning',
  },
  {
    keys: ['work', 'job', 'admin', 'paperwork', 'reports'],
    noLongerAble: 'know your own work well enough to spot when it is off',
    nowHaveTo: 'check it closely enough to sign your name to it',
    alsoKeeps: 'keep the competence that only comes from doing the boring parts',
  },
]

const GENERIC: Omit<Trade, 'keys'> = {
  noLongerAble: 'get better at it by doing it, which is how anyone got good at it',
  nowHaveTo: 'check the result closely enough to know when it is wrong',
  alsoKeeps: 'keep the judgment that only comes from having done it yourself',
}

const matchTrade = (thing: string): Omit<Trade, 'keys'> => {
  const t = thing.toLowerCase().trim()
  if (!t) return GENERIC
  // Longest key wins, so "meal planning" beats "planning".
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
  return best ?? GENERIC
}

/* --------------------------------------------------------------------------
   Stubs
   -------------------------------------------------------------------------- */

/** TODO(api): replace with a model call using PROMPT_BARGAIN. */
export function composeBargain(practice: Practice): Bargain {
  const trade = matchTrade(practice.thing)
  return { noLongerAble: trade.noLongerAble, nowHaveTo: trade.nowHaveTo }
}

/**
 * The bargain is addressed to the family ("your kid"); the refusal is spoken
 * by them ("our kid"). Reusing a clause across the two means turning it
 * around first, or the sentence talks about the family in its own voice.
 */
export const toOurVoice = (s: string): string =>
  s
    .replace(/\byourselves\b/g, 'ourselves')
    .replace(/\byours\b/g, 'ours')
    .replace(/\byour\b/g, 'our')
    .replace(/\byou are\b/g, 'we are')
    .replace(/\byou'?re\b/g, 'we are')
    .replace(/\byou\b/g, 'we')

/** TODO(api): replace with a model call using PROMPT_REFUSAL. */
export function composeRefusal(practice: Practice): Refusal {
  const trade = matchTrade(practice.thing)
  const thing = decap(practice.thing) || 'this'
  const relief = decap(practice.relief)
  return {
    willNot: `hand over ${thing}`,
    willStillHaveTo: toOurVoice(relief) || 'do it the long way',
    soStillAble: toOurVoice(trade.noLongerAble),
    andAble: toOurVoice(trade.alsoKeeps),
  }
}

const list = (items: string[]): string => {
  const clean = items.filter(Boolean)
  if (clean.length === 0) return ''
  if (clean.length === 1) return clean[0]
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`
  return `${clean.slice(0, -1).join(', ')}, and ${clean[clean.length - 1]}`
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

const lower = (s: string) => decap(s)

/** TODO(api): replace with a model call using PROMPT_PRAXIS. */
export function composePraxisReflection(
  practices: Practice[],
  participants: Participant[],
  familyName: string,
): string {
  const kept = practices.filter((p) => p.decision === 'kept')
  const refused = practices.filter((p) => p.decision === 'refused')
  const family = familyName.trim() ? `The ${familyName.trim()} family` : 'Your family'
  const keptNames = list(kept.map((p) => lower(p.thing)))
  const refusedNames = list(refused.map((p) => lower(p.thing)))

  if (kept.length && !refused.length) {
    return `${family} took every bargain on the table — ${keptNames}. That is a real answer, not a failure of nerve: you looked at what each one costs and decided the cost was worth paying. What you have not yet said is where the line would be. Somewhere past ${keptNames.split(',')[0] || 'these'} there is a trade you would refuse, and naming it now is easier than naming it later.`
  }

  if (!kept.length && refused.length) {
    return `${family} turned down all of it — ${refusedNames}. Underneath every refusal was the same instinct: the doing was the point, and handing off the doing would have cost you the thing you were actually after. That instinct is worth writing down before it gets tested by something more convenient than what was on this list.`
  }

  if (!kept.length && !refused.length) {
    return `${family} has not weighed any trades yet. Once you do, what you kept and what you refused will show up here.`
  }

  const refusedRoles = refused
    .map((p) => participants.find((x) => x.id === p.participantId))
    .filter(Boolean) as Participant[]
  const kidsRefused = refusedRoles.filter((p) => p.standing === 'kid').length

  const opener = `${family} said yes to ${keptNames}, and no to ${refusedNames}.`
  const middle =
    `The trades you took were the ones where the work was on the way to something else — ` +
    `nobody in this family is trying to protect ${lower(kept[0].thing)} for its own sake. ` +
    `The ones you refused were the ones where the doing was the point.`
  const closer = kidsRefused
    ? `Worth noticing: some of the refusals came from the youngest people in the room. Say what you are protecting, in your own words.`
    : `That line — between work you would hand over and work you would not — is your family's practice. Say it in your own words.`

  return `${opener} ${middle} ${closer}`
}

/** TODO(api): replace with a model call using PROMPT_TELOS. */
export function composeTelos(ranking: string[], familyName: string): string {
  const top = ranking.slice(0, 3).map((id) => valueById(id)).filter(Boolean)
  if (top.length < 3) return ''
  const family = familyName.trim() ? `The ${familyName.trim()} family` : 'This family'
  const [a, b, c] = top.map((v) => lower(v!.title))

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
