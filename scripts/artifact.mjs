/**
 * Repackages the single-file build as an Artifact fragment.
 *
 * The Artifact host supplies the document skeleton, so the doctype, <html>,
 * <head> and <body> tags come off and the title, styles, mount point and
 * module script go out flat.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const html = readFileSync(join(root, 'family-foundation.html'), 'utf8')

const grab = (re) => (html.match(re) || [])[0] ?? ''
const title = grab(/<title>[\s\S]*?<\/title>/)
const styles = html.match(/<style>[\s\S]*?<\/style>/g)?.join('\n') ?? ''
const mount = grab(/<div id="root">[\s\S]*?<\/div>/) || '<div id="root"></div>'
const script = grab(/<script type="module">[\s\S]*?<\/script>/)

if (!title || !styles || !script) {
  console.error('missing a piece:', { title: !!title, styles: !!styles, script: !!script })
  process.exit(1)
}

const out = join(root, 'artifact.html')
writeFileSync(out, [title, styles, mount, script].join('\n'))
console.log(`artifact.html — ${(Buffer.byteLength(readFileSync(out)) / 1024 / 1024).toFixed(2)} MB`)
