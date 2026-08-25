import type { FamilyDocument } from '~/lib/types'
import { valueById } from '~/data/values'
import { decap, toOurVoice } from '~/lib/assistant'

/**
 * The constitution as Markdown.
 *
 * Built from the same fields the page renders, so what downloads is what the
 * family read — not a summary of it.
 */
export function toMarkdown(doc: FamilyDocument): string {
  const o = doc.origin
  const family = o.familyName.trim() || '____'
  const kept = doc.practices.filter((p) => p.decision === 'kept')
  const refused = doc.practices.filter((p) => p.decision === 'refused')
  const top = doc.valueRanking.slice(0, 3).map((id) => valueById(id)?.title).filter(Boolean)

  const out: string[] = []
  out.push(`# The Constitution of the ${family} Family`, '')

  out.push('## Preamble', '')
  out.push(
    `The ${family} family began in ${o.startedWhere || '____'} when ${o.startedWhen || '____'}. ` +
      `Together, they started a family because ${o.startedWhy || '____'}. ` +
      `Today, ${o.memberNames.join(', ') || '____'} live in ${o.livesIn || '____'}.`,
    '',
  )

  if (kept.length) {
    out.push('## What we will hand over', '')
    for (const p of kept) {
      out.push(
        `- We will hand over **${decap(p.thing)}**, so we will no longer have to ` +
          `${decap(p.relief).replace(/\.$/, '')} — knowing we will no longer ` +
          `${toOurVoice(p.bargain?.noLongerAble ?? '')}, and will now have to ` +
          `${toOurVoice(p.bargain?.nowHaveTo ?? '')}.`,
      )
    }
    out.push('')
  }

  if (refused.length) {
    out.push('## What we will not hand over', '')
    for (const p of refused) {
      out.push(
        `- We will not ${p.refusal?.willNot}, and will still have to ${p.refusal?.willStillHaveTo}, ` +
          `so we will still be able to ${p.refusal?.soStillAble}, and be able to ${p.refusal?.andAble}.`,
      )
    }
    out.push('')
  }

  if (doc.praxisStatement) out.push('## Our praxis', '', doc.praxisStatement, '')

  if (doc.telosSummary) {
    out.push('## Our telos', '', doc.telosSummary, '')
    if (top.length === 3) out.push(`In order: ${top.join(' · ')}`, '')
  }

  if (doc.valueRanking.length) {
    out.push('## Our values, in order', '')
    doc.valueRanking.forEach((id) => {
      const v = valueById(id)
      if (v) out.push(`- ${v.title}`)
    })
    out.push('')
  }

  out.push('## Agreed to by', '')
  for (const p of doc.participants) out.push(`- ${p.name}`)
  out.push(
    '',
    new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
  )

  return out.join('\n')
}

/**
 * Hands the viewer the file. Nothing leaves the device either way.
 *
 * Two paths, because the app runs in two places. On a normal host an anchor
 * with a blob URL is the download. Inside the claude.ai artifact viewer that
 * anchor is inert by design, and the file has to be offered through the
 * `downloads` capability, which shows the viewer a confirmation first.
 */
type DownloadsNamespace = { save: (r: { filename: string; data: string }) => Promise<unknown> }
type ClaudeHost = { use?: (name: string) => Promise<DownloadsNamespace | null> }

export async function downloadMarkdown(doc: FamilyDocument) {
  const name = doc.origin.familyName.trim().toLowerCase().replace(/\s+/g, '-') || 'family'
  const filename = `${name}-constitution.md`
  const data = toMarkdown(doc)

  const host = (window as unknown as { claude?: ClaudeHost }).claude
  if (host?.use) {
    try {
      const downloads = await host.use('downloads')
      if (downloads) {
        /* The viewer may decline; that is an answer, not a failure to route
           around, so this path ends here either way. */
        await downloads.save({ filename, data }).catch(() => {})
        return
      }
    } catch {
      /* Capability unavailable in this view — fall through to the anchor. */
    }
  }

  const blob = new Blob([data], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
