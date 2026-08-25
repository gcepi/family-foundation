/**
 * Folds a built site into one portable .html file.
 *
 * Fonts are already data: URIs by the time this runs (SINGLE=1 sets an
 * effectively unlimited inline threshold), so all that is left is to pull the
 * stylesheet and the module script into the page.
 */
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist-single')
let html = readFileSync(join(dist, 'index.html'), 'utf8')

html = html.replace(/<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_, href) => {
  const css = readFileSync(join(dist, href.replace(/^\.?\//, '')), 'utf8')
  return `<style>\n${css}\n</style>`
})

html = html.replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, src) => {
  const js = readFileSync(join(dist, src.replace(/^\.?\//, '')), 'utf8')
  return `<script type="module">\n${js}\n</script>`
})

const out = join(root, 'family-foundation.html')
writeFileSync(out, html)
rmSync(join(dist, 'assets'), { recursive: true, force: true })

const mb = (Buffer.byteLength(html) / 1024 / 1024).toFixed(2)
console.log(`family-foundation.html — ${mb} MB`)
