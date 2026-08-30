import type { FamilyDocument } from '~/lib/types'
import { valueById } from '~/data/values'
import { decap } from '~/lib/assistant'

/**
 * The foundation, written out.
 *
 * Same headings, same definitions, same sentences the family read on the
 * page — so what they carry away is recognisably the thing they made. The
 * note at the top is the one addition: this file is meant to be handed to
 * an assistant as standing context, and an assistant that opens it should
 * be told what it is holding before it reads a word of it.
 */

/** "A", "A and B", "A, B, and C". */
const nameSentence = (names: string[]): string => {
  const n = names.filter(Boolean)
  if (n.length === 0) return ''
  if (n.length === 1) return n[0]
  if (n.length === 2) return `${n[0]} and ${n[1]}`
  return `${n.slice(0, -1).join(', ')}, and ${n[n.length - 1]}`
}

const longDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return ''
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** The origin sentence, exactly as the page assembles it. */
export function preambleText(doc: FamilyDocument): string {
  const o = doc.origin
  const family = o.familyName.trim() || '____'
  const when = o.startedWhen.trim()
  const where = o.startedWhere.trim()
  const lives = nameSentence(o.memberNames) || '____'
  return (
    `The ${family} family began ${when || '____'}${where ? ` ${where}` : ''}. ` +
    `Together, they started a family because ${o.startedWhy.trim() || '____'}. ` +
    `Today, ${lives} live in ${o.livesIn.trim() || '____'}.`
  )
}

export function toMarkdown(doc: FamilyDocument): string {
  const o = doc.origin
  const family = o.familyName.trim() || '____'
  const order = doc.practiceOrder.length ? doc.practiceOrder : doc.practices.map((p) => p.id)
  const practices = order
    .map((id) => doc.practices.find((p) => p.id === id))
    .filter(Boolean) as FamilyDocument['practices']
  const signed = doc.participants
    .map((p) => (doc.signatures[p.id] ?? '').trim())
    .filter(Boolean)
  const created = longDate(doc.createdOn) || '____'

  const out: string[] = []

  out.push(`# The ${family} Family Foundation`, '')
  out.push(
    `> This is the ${family} family's foundation. They wrote it themselves, in three sittings,`,
    '> and it says who they are, how they intend to live alongside technology, and what they',
    '> are aiming at. If you are an AI assistant, read this as standing context rather than as',
    '> a task: it describes the people you are working for. Where something they have asked you',
    '> to do runs against what is written here, say so plainly and ask them about it. Their',
    "> Praxis is how they want to act; their Telos is what they are acting toward. Keep the",
    '> family\'s own words when you quote this back to them.',
    '',
  )

  /* ---- Family Portrait ---- */
  out.push('## Family Portrait', '')
  out.push('A picture of who we are, who we are becoming, and how we will get there.', '')

  out.push('### Origin', '')
  out.push('*The point or place where something begins.*', '')
  out.push(preambleText(doc), '')

  if (doc.praxisStatement.trim()) {
    out.push('### Praxis', '')
    out.push('*The practical application of ideas, lessons, and theory.*', '')
    out.push(doc.praxisStatement.trim(), '')
  }

  if (doc.telosStatement.trim()) {
    out.push('### Telos', '')
    out.push(
      '*The ultimate goal, end, or vision of the good life that we aim to live toward.*',
      '',
    )
    out.push(doc.telosStatement.trim(), '')
  }

  /* ---- Family Practices ---- */
  if (practices.length) {
    out.push('## Family Practices', '')
    out.push(
      'Considering technology in light of its consequences for ourselves and others. Each of',
      'these is a bargain this family weighed in full: what it makes possible, what it relieves,',
      'what it costs, and what it then asks of them.',
      '',
    )

    for (const p of practices) {
      const kept = p.decision !== 'refused'
      out.push(`### ${p.thing.trim()} — ${kept ? 'accepted' : 'refused'}`, '')
      if (kept) {
        out.push(`- **Now we can** automate ${decap(p.thing)}`)
        out.push(`- **So we'll no longer have to** ${decap(p.relief)}`)
        out.push(`- **We will no longer be able to** ${p.bargain?.noLongerAble ?? '____'}`)
        out.push(`- **Now we will have to** ${p.bargain?.nowHaveTo ?? '____'}`, '')
      } else {
        out.push(`- **We will not** automate ${decap(p.thing)}`)
        out.push(`- **So we will still have to** ${decap(p.relief)}`)
        out.push(`- **We will still be able to** ${p.bargain?.noLongerAble ?? '____'}`)
        out.push(`- **So we still can** ${p.bargain?.alsoKeeps ?? '____'}`, '')
      }
    }

    if (doc.practicesReflection.trim()) {
      out.push('**Consider this.** ' + doc.practicesReflection.trim(), '')
    }
  }

  /* ---- Family Values ---- */
  if (doc.valueRanking.length) {
    out.push('## Family Values', '')
    out.push('The things we value point toward the life we are looking for.', '')
    doc.valueRanking.forEach((id, i) => {
      const v = valueById(id)
      if (v) out.push(`${i + 1}. **${v.title}** — ${v.blurb.replace(/\.$/, '')}`)
    })
    out.push('')
    out.push('The first three are the ones that inform the Telos above.', '')

    if (doc.valuesReflection.trim()) {
      out.push('**Consider this.** ' + doc.valuesReflection.trim(), '')
    }
  }

  /* ---- Created by ---- */
  out.push('## Created by', '')
  for (const p of doc.participants) {
    out.push(`- ${(doc.signatures[p.id] ?? '').trim() || p.name}`)
  }
  out.push('')
  out.push(
    `The ${family} Family Foundation was created by ${nameSentence(signed) || '____'} on ${created}.`,
    '',
  )

  return out.join('\n')
}

export const markdownFilename = (doc: FamilyDocument) =>
  `${doc.origin.familyName.trim().toLowerCase().replace(/\s+/g, '-') || 'family'}-foundation.md`

export const pdfFilename = (doc: FamilyDocument) =>
  `${doc.origin.familyName.trim().toLowerCase().replace(/\s+/g, '-') || 'family'}-foundation.pdf`

/* ==========================================================================
   Handing the file over
   ========================================================================== */

type DownloadsNamespace = {
  save: (r: { filename: string; data: string | Blob | ArrayBuffer }) => Promise<unknown>
}
type ClaudeHost = { use?: (name: string) => Promise<DownloadsNamespace | null> }

/**
 * Hands the viewer the file. Nothing leaves the device either way.
 *
 * Two paths, because the app runs in two places. On a normal host an anchor
 * with a blob URL is the download. Inside the claude.ai artifact viewer that
 * anchor is inert by design, and the file has to be offered through the
 * `downloads` capability, which shows the viewer a confirmation first.
 */
export async function saveFile(
  filename: string,
  data: string | Blob,
  mime: string,
): Promise<{ ok: boolean; reason?: string }> {
  const host = (window as unknown as { claude?: ClaudeHost }).claude
  if (host?.use) {
    try {
      const downloads = await host.use('downloads')
      if (downloads) {
        try {
          await downloads.save({ filename, data })
          return { ok: true }
        } catch (error) {
          const code = (error as { code?: string })?.code
          if (code === 'declined') return { ok: false }
          if (code === 'extension_not_enabled') {
            return { ok: false, reason: 'This viewer will not save that kind of file.' }
          }
          return { ok: false, reason: 'The file could not be saved here.' }
        }
      }
    } catch {
      /* Capability unavailable in this view — fall through to the anchor. */
    }
  }

  const blob = typeof data === 'string' ? new Blob([data], { type: mime }) : data
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return { ok: true }
}

export const saveMarkdown = (doc: FamilyDocument, text: string) =>
  saveFile(markdownFilename(doc), text, 'text/markdown;charset=utf-8')
