import type { FamilyDocument } from '~/lib/types'
import { valueById } from '~/data/values'
import { decap } from '~/lib/assistant'
import { preambleText } from '~/lib/export'

/**
 * The foundation as an ordered list of blocks.
 *
 * One description, two renderers: the preview the family looks at and the
 * PDF they save are built from this same list, so what they see really is
 * what they get. Nothing here knows about CSS or about PDF operators.
 */
export type Block =
  | { kind: 'title'; text: string }
  | { kind: 'note'; text: string }
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

export function foundationBlocks(doc: FamilyDocument): Block[] {
  const family = doc.origin.familyName.trim() || '____'
  const order = doc.practiceOrder.length ? doc.practiceOrder : doc.practices.map((p) => p.id)
  const practices = order
    .map((id) => doc.practices.find((p) => p.id === id))
    .filter(Boolean) as FamilyDocument['practices']
  const signed = doc.participants.map((p) => (doc.signatures[p.id] ?? '').trim()).filter(Boolean)

  const b: Block[] = []
  b.push({ kind: 'title', text: `The ${family} Family Foundation` })
  b.push({ kind: 'rule' })

  b.push({ kind: 'h2', text: 'Family Portrait' })
  b.push({ kind: 'body', text: 'A picture of who we are, who we are becoming, and how we will get there.' })

  b.push({ kind: 'h3', text: 'Origin' })
  b.push({ kind: 'define', text: 'The point or place where something begins.' })
  b.push({ kind: 'body', text: preambleText(doc) })

  if (doc.praxisStatement.trim()) {
    b.push({ kind: 'h3', text: 'Praxis' })
    b.push({ kind: 'define', text: 'The practical application of ideas, lessons, and theory.' })
    b.push({ kind: 'body', text: doc.praxisStatement.trim() })
  }

  if (doc.telosStatement.trim()) {
    b.push({ kind: 'h3', text: 'Telos' })
    b.push({
      kind: 'define',
      text: 'The ultimate goal, end, or vision of the good life that we aim to live toward.',
    })
    b.push({ kind: 'body', text: doc.telosStatement.trim() })
  }

  if (practices.length) {
    b.push({ kind: 'rule' })
    b.push({ kind: 'h2', text: 'Family Practices' })
    b.push({
      kind: 'body',
      text: 'Considering technology in light of its consequences for ourselves and others.',
    })

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

    if (doc.practicesReflection.trim()) {
      b.push({ kind: 'h3', text: 'Consider this' })
      b.push({ kind: 'body', text: doc.practicesReflection.trim() })
    }
  }

  if (doc.valueRanking.length) {
    b.push({ kind: 'rule' })
    b.push({ kind: 'h2', text: 'Family Values' })
    b.push({ kind: 'body', text: 'The things we value point toward the life we are looking for.' })
    doc.valueRanking.forEach((id, i) => {
      const v = valueById(id)
      if (v) b.push({ kind: 'item', index: i + 1, title: v.title, text: v.blurb })
    })
    b.push({ kind: 'body', text: 'The first three are the ones that inform the Telos above.' })

    if (doc.valuesReflection.trim()) {
      b.push({ kind: 'h3', text: 'Consider this' })
      b.push({ kind: 'body', text: doc.valuesReflection.trim() })
    }
  }

  b.push({ kind: 'rule' })
  b.push({ kind: 'h2', text: 'Created by' })
  b.push({
    kind: 'body',
    text:
      `The ${family} Family Foundation was created by ${nameSentence(signed)} on ` +
      `${longDate(doc.createdOn) || '____'}.`,
  })

  return b
}
