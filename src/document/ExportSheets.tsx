import { useMemo, useRef, useState } from 'react'
import { useStore } from '~/app/store'
import { Popup } from '~/components/Popup'
import { markdownFilename, pdfFilename, saveFile, toMarkdown } from '~/lib/export'
import { foundationBlocks, type Block } from '~/lib/sheet'
import { buildPdf } from '~/lib/pdf'

/**
 * Two ways to take the document away, both of which show it first.
 *
 * A family that taps Download on a phone has no idea where the file went,
 * and no idea what "Markdown" is. So neither button downloads anything: they
 * open the thing itself, in a window, and the saving happens from there —
 * next to a Copy button, which is what most people wanted in the first place.
 */

/* ==========================================================================
   The text version
   ========================================================================== */

export function TextSheet({ onClose }: { onClose: () => void }) {
  const { doc } = useStore()
  const [text, setText] = useState(() => toMarkdown(doc))
  const [said, setSaid] = useState<string | null>(null)
  const box = useRef<HTMLTextAreaElement>(null)

  const say = (message: string) => {
    setSaid(message)
    window.setTimeout(() => setSaid(null), 2600)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      say('Copied.')
      return
    } catch {
      /* Clipboard permission is not always given inside a frame. */
    }
    const el = box.current
    if (!el) return say('Select the text and copy it by hand.')
    el.focus()
    el.select()
    const ok = document.execCommand('copy')
    say(ok ? 'Copied.' : 'Select the text and copy it by hand.')
  }

  const save = async () => {
    const result = await saveFile(markdownFilename(doc), text, 'text/markdown;charset=utf-8')
    if (result.reason) say(result.reason)
    else if (result.ok) say('Saved.')
  }

  return (
    <Popup
      title="Text version"
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-2">
          {said && <p className="type-caption text-center">{said}</p>}
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost flex-1" onClick={() => void copy()}>
              Copy text
            </button>
            <button type="button" className="btn btn-primary flex-1" onClick={() => void save()}>
              Save file
            </button>
          </div>
        </div>
      }
    >
      <div className="flex h-full flex-col">
        <p className="type-caption mb-3 shrink-0">
          Review your Foundation document below, make edits as needed, and apply it to any AI
          conversation by pasting it into your global instructions.
        </p>
        {/* A plain typewriter face on purpose. It is not the document, it is
            the text the document is made of, and it should not pretend
            otherwise. */}
        <textarea
          ref={box}
          value={text}
          spellCheck={false}
          aria-label="The text of your foundation"
          onChange={(e) => setText(e.target.value)}
          className="field-area min-h-[60vh] flex-1 font-mono !text-[0.76rem] !leading-[1.65]"
        />
      </div>
    </Popup>
  )
}

/* ==========================================================================
   The PDF version
   ========================================================================== */

export function PdfSheet({ onClose }: { onClose: () => void }) {
  const { doc } = useStore()
  const blocks = useMemo(() => foundationBlocks(doc), [doc])
  const [said, setSaid] = useState<string | null>(null)

  const say = (message: string) => {
    setSaid(message)
    window.setTimeout(() => setSaid(null), 2600)
  }

  const save = async () => {
    const pdf = await buildPdf(blocks)
    const result = await saveFile(pdfFilename(doc), pdf, 'application/pdf')
    if (result.reason) say(result.reason)
    else if (result.ok) say('Saved.')
  }

  return (
    <Popup
      title="PDF version"
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-2">
          {said && <p className="type-caption text-center">{said}</p>}
          <button type="button" className="btn btn-primary w-full" onClick={() => void save()}>
            Save PDF
          </button>
        </div>
      }
    >
      <div className="-mx-2">
        <p className="type-caption mx-2 mb-3">
          Review, save, and print your Foundation document below.
        </p>
        {/* One long sheet rather than paginated slices: the family is
            reading it here, not proofing a print run. The paper colour is
            the app's own — this is meant to look like it belongs here. */}
        <div
          className="px-6 py-8"
          style={{
            background: 'var(--color-paper)',
            border: '1px solid var(--color-rule)',
            borderRadius: 'var(--radius-card)',
            boxShadow: '0 14px 34px -22px rgba(37,35,33,0.45)',
          }}
        >
          {blocks.map((block, i) => (
            <Line key={i} block={block} />
          ))}
        </div>
      </div>
    </Popup>
  )
}

function Line({ block }: { block: Block }) {
  switch (block.kind) {
    case 'photo':
      return (
        <img
          src={block.src}
          alt="The family"
          className="mb-6 block max-h-[280px] w-full rounded-[var(--radius-card)] object-cover"
        />
      )
    case 'title':
      return <h1 className="type-h1 mb-1 !text-[1.6rem]">{block.text}</h1>
    case 'rule':
      return <hr className="hairline my-6" />
    case 'h2':
      return <h2 className="type-h2 mt-7 mb-1.5">{block.text}</h2>
    case 'h3':
      return <h3 className="type-h3 mt-5 mb-1">{block.text}</h3>
    case 'define':
      return (
        <p className="type-caption mb-2 italic">
          {block.text}
        </p>
      )
    case 'body':
      return <p className="prose-editorial mb-3 !text-[0.95rem]">{block.text}</p>
    case 'row':
      return (
        <div className="mb-2.5">
          <p className="type-eyebrow !text-[0.6rem]">{block.label}</p>
          <p className="prose-editorial !text-[0.95rem]">{block.text}</p>
        </div>
      )
    case 'item':
      return (
        <div className="mb-2 flex gap-2.5">
          <span className="type-caption w-4 shrink-0 text-right tabular-nums">{block.index}.</span>
          <span className="min-w-0">
            <span className={`type-h3 block !text-[0.92rem] ${block.index > 3 ? 'opacity-70' : ''}`}>
              {block.title}
            </span>
            <span className="type-caption block !text-[0.8rem]">{block.text}</span>
          </span>
        </div>
      )
  }
}
