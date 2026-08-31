import type { FamilyDocument } from '~/lib/types'
import { valueById } from '~/data/values'
import { decap } from '~/lib/assistant'
import { preambleText } from '~/lib/export'

/**
 * The foundation as an ordered list of blocks, for a human to read.
 *
 * One description, two renderers: the preview the family looks at and the
 * PDF they save are built from this same list, so what they see really is
 * what they get. This is the app's own commentary, word for word — not the
 * shorter, AI-facing summary the Markdown export writes — because a person
 * holding a finished document deserves the fuller explanation the app gave
 * them while they were making it.
 */
export type Block =
  | { kind: 'photo'; src: string }
  | { kind: 'title'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'define'; text: string }
  | { kind: 'body'; text: string }
  | { kind: 'row'; label: string; text: string }
  | { kind: 'item'; index: number; title: string; text: string }
  | { kind: 'rule' }

const longDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return ''
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const nameSentence = (names: string[]): string => {
  const n = names.filter(Boolean)
  if (n.length === 0) return '____'
  if (n.length === 1) return n[0]
  if (n.length === 2) return `${n[0]} and ${n[1]}`
  return `${n.slice(0, -1).join(', ')}, and ${n[n.length - 1]}`
}

/** One piece of commentary, split into its paragraphs. */
function write(b: Block[], text: string) {
  for (const para of text.split(/\n\n+/)) b.push({ kind: 'body', text: para.trim() })
}

export function foundationBlocks(doc: FamilyDocument): Block[] {
  const family = doc.origin.familyName.trim() || '____'
  const order = doc.practiceOrder.length ? doc.practiceOrder : doc.practices.map((p) => p.id)
  const practices = order
    .map((id) => doc.practices.find((p) => p.id === id))
    .filter(Boolean) as FamilyDocument['practices']
  const signed = doc.participants.map((p) => (doc.signatures[p.id] ?? '').trim()).filter(Boolean)

  const b: Block[] = []

  /* Only when there is one. A grey placeholder here would be the kind of
     empty gesture a finished document should not make. */
  if (doc.photo) b.push({ kind: 'photo', src: doc.photo })

  b.push({ kind: 'title', text: `The ${family} Family Foundation` })
  b.push({ kind: 'rule' })

  b.push({ kind: 'h2', text: 'Family Portrait' })
  write(
    b,
    'This activity describes who we are and the type of people we are becoming.\n\n' +
      'The origin of our story, the direction we are headed, and how we get there help us ' +
      'navigate challenges, change, and even emerging technology like AI.\n\n' +
      'Complete all activities to complete your Family Portrait. You can edit this at any time.',
  )

  b.push({ kind: 'h3', text: 'Origin' })
  b.push({ kind: 'define', text: 'The point or place where something begins.' })
  write(
    b,
    'This activity prompts you to tell the story of when, where, and why your family began.\n\n' +
      'Our family Origin informs who we are today. Though it is not everything, knowing where ' +
      'we come from contributes to who we are becoming.',
  )
  b.push({ kind: 'body', text: preambleText(doc) })

  if (doc.praxisStatement.trim()) {
    b.push({ kind: 'h3', text: 'Praxis' })
    b.push({ kind: 'define', text: 'The practical application of ideas, lessons, and theory.' })
    b.push({
      kind: 'body',
      text: 'The family Praxis includes commitments, habits, and behaviors that shape us over time.',
    })
    b.push({ kind: 'body', text: doc.praxisStatement.trim() })
  }

  if (doc.telosStatement.trim()) {
    b.push({ kind: 'h3', text: 'Telos' })
    b.push({
      kind: 'define',
      text: 'The ultimate goal, end, or vision of the good life that we aim to live toward.',
    })
    b.push({
      kind: 'body',
      text: 'Our family Telos is informed by our deepest desires and affections.',
    })
    b.push({ kind: 'body', text: doc.telosStatement.trim() })
  }

  if (practices.length) {
    b.push({ kind: 'rule' })
    b.push({ kind: 'h2', text: 'Family Practices' })
    write(
      b,
      'This activity examines the consequences of technology that we take for granted.\n\n' +
        'What we choose to embrace on a small scale can help inform the Praxis that we want ' +
        'our family to live by.',
    )

    for (const p of practices) {
      const kept = p.decision !== 'refused'
      b.push({ kind: 'h3', text: `${p.thing.trim()} — ${kept ? 'accepted' : 'refused'}` })
      if (kept) {
        b.push({ kind: 'row', label: 'Now we can', text: `automate ${decap(p.thing)}` })
        b.push({ kind: 'row', label: "So we'll no longer have to", text: decap(p.relief) })
        b.push({ kind: 'row', label: 'We will no longer be able to', text: p.bargain?.noLongerAble ?? '____' })
        b.push({ kind: 'row', label: 'Now we will have to', text: p.bargain?.nowHaveTo ?? '____' })
      } else {
        b.push({ kind: 'row', label: 'We will not', text: `automate ${decap(p.thing)}` })
        b.push({ kind: 'row', label: 'So we will still have to', text: decap(p.relief) })
        b.push({ kind: 'row', label: 'We will still be able to', text: p.bargain?.noLongerAble ?? '____' })
        b.push({ kind: 'row', label: 'So we still can', text: p.bargain?.alsoKeeps ?? '____' })
      }
    }
  }

  if (doc.valueRanking.length) {
    b.push({ kind: 'rule' })
    b.push({ kind: 'h2', text: 'Family Values' })
    write(
      b,
      'This activity presents two values at a time and asks you to decide what matters more.\n\n' +
        'The things we value point toward a vision of the good life. Your top three values ' +
        'will inform your Telos statement.',
    )
    doc.valueRanking.forEach((id, i) => {
      const v = valueById(id)
      if (v) b.push({ kind: 'item', index: i + 1, title: v.title, text: v.blurb })
    })
  }

  b.push({ kind: 'rule' })
  b.push({ kind: 'h2', text: 'Created by' })
  b.push({
    kind: 'body',
    text: `The ${family} Family Foundation was created by ${nameSentence(signed)} on ${longDate(doc.createdOn) || '____'}.`,
  })

  return b
}
