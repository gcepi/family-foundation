import type { Block } from '~/lib/sheet'

/**
 * A small PDF writer.
 *
 * Enough of the format to set this one document well and nothing more: the
 * fourteen fonts every reader already has, one text state, straight rules.
 * No library, because the alternative was three hundred kilobytes of one to
 * lay out four page types.
 *
 * The brand faces cannot come along — embedding a variable woff2 is a
 * different project — so the saved file is set in Times and Helvetica, which
 * keep the same serif-and-small-caps relationship the page has.
 */

const PAGE_W = 612
const PAGE_H = 792
const MARGIN = 64
const COL = PAGE_W - MARGIN * 2

const INK: RGB = [0.145, 0.137, 0.129]
const MUTED: RGB = [0.467, 0.451, 0.424]
const RULE: RGB = [0.804, 0.784, 0.741]

type RGB = [number, number, number]
type Face = 'serif' | 'serifBold' | 'serifItalic' | 'sans'

const FONT_KEY: Record<Face, string> = {
  serif: 'F1',
  serifBold: 'F2',
  serifItalic: 'F3',
  sans: 'F4',
}

const BASE_FONT: Record<Face, string> = {
  serif: 'Times-Roman',
  serifBold: 'Times-Bold',
  serifItalic: 'Times-Italic',
  sans: 'Helvetica',
}

const CSS_FONT: Record<Face, string> = {
  serif: '"Times New Roman", Times, serif',
  serifBold: 'bold "Times New Roman", Times, serif',
  serifItalic: 'italic "Times New Roman", Times, serif',
  sans: 'Helvetica, Arial, sans-serif',
}

/* -------------------------------------------------------------------------- */

/** Widths come from the browser, which has the same faces the reader will. */
let ctx: CanvasRenderingContext2D | null = null
function measure(text: string, face: Face, size: number, tracking = 0): number {
  if (!ctx) ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return text.length * size * 0.5
  ctx.font = `${size}px ${CSS_FONT[face]}`
  return ctx.measureText(text).width + tracking * text.length
}

function wrap(text: string, face: Face, size: number, width: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (measure(next, face, size) <= width || !line) line = next
    else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

/* -------------------------------------------------------------------------- */

/** WinAnsi, so the punctuation the app actually uses survives the trip. */
const WIN_ANSI: Record<string, number> = {
  '—': 0x97,
  '–': 0x96,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '…': 0x85,
  '•': 0x95,
}

function pdfString(text: string): string {
  let out = ''
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 63
    let byte = code
    if (code > 255) byte = WIN_ANSI[ch] ?? 63
    const c = String.fromCharCode(byte)
    if (c === '(' || c === ')' || c === '\\') out += `\\${c}`
    else out += c
  }
  return out
}

/* -------------------------------------------------------------------------- */

type Op = string

class Sheet {
  pages: Op[][] = []
  private ops: Op[] = []
  private y = PAGE_H - MARGIN

  constructor() {
    this.pages.push(this.ops)
  }

  private room(height: number) {
    if (this.y - height >= MARGIN) return
    this.ops = []
    this.pages.push(this.ops)
    this.y = PAGE_H - MARGIN
  }

  gap(h: number) {
    this.room(h)
    this.y -= h
  }

  rule() {
    this.room(14)
    this.y -= 8
    const [r, g, b] = RULE
    this.ops.push(`${r} ${g} ${b} RG 0.8 w ${MARGIN} ${this.y} m ${PAGE_W - MARGIN} ${this.y} l S`)
    this.y -= 6
  }

  /** One run of text, wrapped, at an indent. Returns nothing; advances y. */
  text(
    body: string,
    face: Face,
    size: number,
    color: RGB,
    opts: { leading?: number; indent?: number; tracking?: number; upper?: boolean } = {},
  ) {
    const leading = opts.leading ?? size * 1.42
    const indent = opts.indent ?? 0
    const tracking = opts.tracking ?? 0
    const value = opts.upper ? body.toUpperCase() : body
    const lines = wrap(value, face, size, COL - indent)
    const [r, g, b] = color
    for (const line of lines) {
      this.room(leading)
      this.y -= leading
      this.ops.push(
        `${r} ${g} ${b} rg BT /${FONT_KEY[face]} ${size} Tf ${tracking} Tc ` +
          `1 0 0 1 ${MARGIN + indent} ${this.y} Tm (${pdfString(line)}) Tj ET`,
      )
    }
  }
}

/* -------------------------------------------------------------------------- */

function draw(blocks: Block[]): Op[][] {
  const s = new Sheet()

  for (const block of blocks) {
    switch (block.kind) {
      case 'title':
        s.gap(6)
        s.text(block.text, 'serifBold', 26, INK, { leading: 31 })
        s.gap(4)
        break
      case 'rule':
        s.gap(12)
        s.rule()
        s.gap(6)
        break
      case 'h2':
        s.gap(14)
        s.text(block.text, 'serifBold', 17, INK, { leading: 21 })
        s.gap(3)
        break
      case 'h3':
        s.gap(12)
        s.text(block.text, 'serifBold', 12, INK, { leading: 15 })
        s.gap(2)
        break
      case 'define':
        s.text(block.text, 'serifItalic', 10.5, MUTED, { leading: 14 })
        s.gap(3)
        break
      case 'body':
        s.text(block.text, 'serif', 11.5, INK, { leading: 16 })
        s.gap(6)
        break
      case 'row':
        s.gap(4)
        s.text(block.label, 'sans', 7, MUTED, { leading: 10, tracking: 0.7, upper: true })
        s.text(block.text, 'serif', 11.5, INK, { leading: 15, indent: 0 })
        break
      case 'item':
        s.text(`${block.index}.  ${block.title}`, 'serifBold', 11, block.index <= 3 ? INK : MUTED, {
          leading: 14,
        })
        s.text(block.text, 'serif', 10, MUTED, { leading: 13, indent: 18 })
        s.gap(4)
        break
    }
  }

  return s.pages
}

/* -------------------------------------------------------------------------- */

export function buildPdf(blocks: Block[]): Blob {
  const pages = draw(blocks)
  const objects: string[] = []
  const add = (body: string) => {
    objects.push(body)
    return objects.length /* 1-based object number */
  }

  /* 1 catalog, 2 pages tree — reserved so children can point back at them. */
  objects.push('', '')

  const fontIds: Record<Face, number> = {
    serif: 0,
    serifBold: 0,
    serifItalic: 0,
    sans: 0,
  }
  for (const face of Object.keys(BASE_FONT) as Face[]) {
    fontIds[face] = add(
      `<< /Type /Font /Subtype /Type1 /BaseFont /${BASE_FONT[face]} /Encoding /WinAnsiEncoding >>`,
    )
  }

  const resources =
    '<< /Font << ' +
    (Object.keys(FONT_KEY) as Face[])
      .map((face) => `/${FONT_KEY[face]} ${fontIds[face]} 0 R`)
      .join(' ') +
    ' >> >>'

  const pageIds: number[] = []
  for (const ops of pages) {
    const stream = ops.join('\n')
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
    pageIds.push(
      add(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
          `/Resources ${resources} /Contents ${contentId} 0 R >>`,
      ),
    )
  }

  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[1] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] ` +
    `/Count ${pageIds.length} >>`

  let out = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((body, i) => {
    offsets.push(out.length)
    out += `${i + 1} 0 obj\n${body}\nendobj\n`
  })

  const xref = out.length
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets) out += `${String(offset).padStart(10, '0')} 00000 n \n`
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`

  const bytes = Uint8Array.from(out, (c) => c.charCodeAt(0) & 0xff)
  return new Blob([bytes], { type: 'application/pdf' })
}
