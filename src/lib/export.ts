import type { FamilyDocument } from '~/lib/types'
import { valueById } from '~/data/values'
import { decap } from '~/lib/assistant'

/**
 * The foundation, written out for a machine to read.
 *
 * This is not the PDF in plain text — it is the same facts, organized for
 * whatever assistant the family pastes it into. It opens by explaining
 * itself, because nothing else in the file will, and it closes wherever the
 * family's own activities stopped rather than padding out a section they
 * have not reached yet.
 */

/** "A", "A and B", "A, B, and C". */
const nameSentence = (names: string[]): string => {
  const n = names.filter(Boolean)
  if (n.length === 0) return ''
  if (n.length === 1) return n[0]
  if (n.length === 2) return `${n[0]} and ${n[1]}`
  return `${n.slice(0, -1).join(', ')}, and ${n[n.length - 1]}`
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
  const family = doc.origin.familyName.trim() || '____'
  const order = doc.practiceOrder.length ? doc.practiceOrder : doc.practices.map((p) => p.id)
  const practices = order
    .map((id) => doc.practices.find((p) => p.id === id))
    .filter(Boolean) as FamilyDocument['practices']

  const out: string[] = []

  /* ---- Overview — the only part written to the assistant, not the family ---- */
  out.push('# Overview', '')
  out.push(
    `This document outlines the philosophical foundation of the ${family} family when using ` +
      'technology like AI.',
    '',
  )
  out.push('The document includes three sections with the following purposes:', '')
  out.push(
    '1. **Family Portrait**: Describes who the family is, the type of people they are ' +
      'becoming, and how they will get there.',
  )
  out.push(
    '2. **Family Practices**: Supports the family Praxis by providing examples of ' +
      'technology they embrace, reject, and reasons why.',
  )
  out.push(
    '3. **Family Values**: Informs the family Telos by prioritizing their values when ' +
      'engaging with AI.',
    '',
  )
  out.push(
    'The purpose of this comprehensive document is to guide all AI when interacting with ' +
      'members of this family. This document seeks to provide sufficient data, context, and ' +
      'examples for the AI to know when to provide a straight answer and when to provide ' +
      'mental scaffolding for creative thinking, problem solving, and decision making.',
    '',
  )
  out.push(
    'Before all chat sessions, read this entire document and understand the type of family, ' +
      'who they are becoming, and how you can support the user as an instrument that amplifies ' +
      'their critical thinking, not a superpower or a magical device that replaces it.',
    '',
  )

  /* ---- Family Portrait ---- */
  out.push(`# ${family} Family Portrait`, '')
  out.push('A picture of who we are, who we are becoming, and how we will get there.', '')

  out.push('## Origin', '')
  out.push('*The point or place where something begins.*', '')
  out.push(preambleText(doc), '')

  if (doc.praxisStatement.trim()) {
    out.push('## Praxis', '')
    out.push('*The practical application of ideas, lessons, and theory.*', '')
    out.push(doc.praxisStatement.trim(), '')
  }

  if (doc.telosStatement.trim()) {
    out.push('## Telos', '')
    out.push(
      '*The ultimate goal, end, or vision of the good life that we aim to live toward.*',
      '',
    )
    out.push(doc.telosStatement.trim(), '')
  }

  /* ---- Family Practices ---- */
  if (practices.length) {
    out.push(`# ${family} Family Practices`, '')
    out.push(
      'Examples of technological innovation that we accept and reject after considering the ' +
        'consequences. These are examples of things we want to protect and accept and should ' +
        'be respected when similar situations arise in conversation.',
      '',
    )

    for (const p of practices) {
      const kept = p.decision !== 'refused'
      out.push(`## ${p.thing.trim()} — ${kept ? 'accepted' : 'refused'}`, '')
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
  }

  /* ---- Family Values ---- */
  if (doc.valueRanking.length) {
    out.push(`# ${family} Family Values`, '')
    out.push(
      'This is a prioritized list of values that we seek to uphold when engaging with ' +
        'technology like AI. These values represent the type of people that we want to ' +
        'become, and they should always be honored in spite of compromises.',
      '',
    )
    doc.valueRanking.forEach((id, i) => {
      const v = valueById(id)
      if (v) out.push(`${i + 1}. **${v.title}** — ${v.blurb.replace(/\.$/, '')}`)
    })
    out.push('')
  }

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
