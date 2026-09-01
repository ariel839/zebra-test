/**
 * Responsive sweep.
 *
 * Loads every built flow screen at a ladder of viewport widths and asserts the
 * two things that actually break when a fixed-width design is made fluid:
 *
 *   1. Nothing overflows horizontally. `scrollWidth > clientWidth` anywhere in
 *      the document is the single most common responsive bug and the one that
 *      is hardest to catch by eye, because the offending element is usually
 *      off-screen. Checked on the document AND on the canvas root.
 *   2. The structural breakpoints fire on the correct side. The nav rail must
 *      be a static column at >= 1024 and a translated-off drawer below it; the
 *      form's two field slots must be side by side at >= 768 and stacked below;
 *      the review layouts must be side by side at >= 1024 and stacked below.
 *
 * It also asserts the design-width contract: at exactly 1920 every fluid
 * `--viq-*` token must resolve to the constant it replaced, which is what
 * makes "the Figma frames are untouched" a measured claim rather than an
 * assertion. `tools/fidelity` covers the pixels; this covers the tokens.
 *
 * Like `tools/fidelity`, this imports `playwright` without it being a project
 * dependency and drives the locally installed Chrome (`channel: 'chrome'`) —
 * the repo bans new runtime deps, and this is a dev aid, not shipped code.
 *
 * Usage:  npm run dev   (must be on http://localhost:5173)
 *         node tools/responsive/sweep.mjs [--shots]
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5173'
const SHOTS = process.argv.includes('--shots')
const OUT = path.join(process.cwd(), 'tools/responsive/shots')

const WIDTHS = [375, 414, 768, 1024, 1280, 1440, 1920, 2560]

/** Must equal `CANVAS_MIN_WIDTH` in `src/components/wizard/ScaleToFit.tsx`. */
const CANVAS_MIN_WIDTH = 1024

/** One representative screen per layout family, not all 33. */
const SCREENS = [
  ['A1', 'overview'],
  ['B01', 'form empty'],
  ['B06', 'tree open'],
  ['B07', 'form filled + chips'],
  ['C4', 'country filter panel'],
  ['D1', 'tooltip'],
  ['E1', 'review boxed'],
  ['E2', 'edit mode'],
  ['F2', 'existing-dashboards modal'],
  ['R2', 'review dividers'],
  ['R3', 'review logo-left'],
]

/**
 * Token ceilings: what each fluid token must equal at the design *frame* —
 * 1920x1080. The width-ramped tokens cap on `vw` and the vertical-rhythm ones
 * on `vh`, so this has to be checked at the full frame size, which is also
 * exactly where `tools/fidelity` captures. Every value below is the constant
 * the token replaced, taken from the frames.
 */
const DESIGN_TOKENS = {
  '--viq-gutter': '56px',
  '--viq-block': '32px',
  '--viq-gap-field': '32px',
  '--viq-gap-review': '176px',
  '--viq-footer-h': '98px',
  '--viq-title-h': '88px',
  '--viq-row-gap': '31px',
  '--viq-form-pt': '39px',
  '--viq-review-row-pt': '28px',
  '--viq-review-row-pb': '15px',
  '--viq-review-value-h': '28px',
  '--viq-review-value-mt': '7px',
  '--viq-review-box-h': '76px',
  '--viq-review-box-gap': '24.5px',
}

const failures = []
const fail = (msg) => {
  failures.push(msg)
  console.log(`  FAIL  ${msg}`)
}

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
if (SHOTS) fs.mkdirSync(OUT, { recursive: true })

for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: 900 })
  console.log(`\n=== ${width}px ===`)

  for (const [id, label] of SCREENS) {
    await page.goto(`${BASE}/flow/${id}`, { waitUntil: 'networkidle' })
    // One rAF past networkidle: ScaleToFit's ResizeObserver and FilterPanel's
    // matchMedia both settle in a committed layout pass, not on load.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())))

    const report = await page.evaluate(() => {
      const root = document.querySelector('[data-canvas-root]')
      const overflowing = []
      for (const el of document.querySelectorAll('*')) {
        const style = getComputedStyle(el)
        // `overflow-x: visible` elements report their descendants' overflow in
        // scrollWidth but neither clip nor scroll it, so an absolutely
        // positioned child painting past them is not a bug — the canvas-level
        // check above is what catches that. Only `hidden` (content is lost)
        // and `auto`/`scroll` (an unintended scrollbar appears) matter here;
        // the data table's deliberate `overflow-x: auto` is exempted by name.
        const clips = style.overflowX === 'hidden'
        const scrolls = style.overflowX === 'auto' || style.overflowX === 'scroll'
        const deliberate = el.tagName === 'DIV' && el.querySelector(':scope > table')
        if ((clips || (scrolls && !deliberate)) && el.scrollWidth > el.clientWidth + 1) {
          overflowing.push(
            `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} ` +
              `(${el.scrollWidth} > ${el.clientWidth})`,
          )
        }
      }
      const nav = document.querySelector('nav')
      const navStyle = nav ? getComputedStyle(nav) : null
      return {
        docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        rootOverflow: root ? root.scrollWidth - root.clientWidth : null,
        transform: root ? getComputedStyle(root).transform : null,
        overflowing: overflowing.slice(0, 4),
        navPosition: navStyle?.position ?? null,
        navTransform: navStyle?.transform ?? null,
        // How far the page's own scroll region overflows. The shell is an app
        // shell — fixed strips, one scrolling middle — so this is not an
        // error, but at a normal laptop size it should be zero: a form that
        // needs scrolling on a 1440x780 window reads as cramped.
        vOverflow: (() => {
          const region = document.querySelector('.overflow-y-auto')
          return region ? region.scrollHeight - region.clientHeight : null
        })(),
      }
    })

    const tag = `${id} (${label})`
    if (report.docOverflow > 1) fail(`${width}px ${tag}: document overflows by ${report.docOverflow}px`)
    if (report.rootOverflow > 1) fail(`${width}px ${tag}: canvas overflows by ${report.rootOverflow}px`)
    if (report.overflowing.length) fail(`${width}px ${tag}: ${report.overflowing.join(' | ')}`)

    // Canvas mode from CANVAS_MIN_WIDTH (1024) up, responsive mode below it.
    // This is the check that pins desktop to the untouched original: every
    // width at or above 1024 must still be the 1920 design canvas, scaled.
    const isCanvas = report.transform && report.transform !== 'none'
    if (width >= CANVAS_MIN_WIDTH && !isCanvas)
      fail(`${width}px ${tag}: expected canvas mode, got no transform`)
    if (width < CANVAS_MIN_WIDTH && isCanvas)
      fail(`${width}px ${tag}: expected responsive mode, got ${report.transform}`)

    // Nav rail vs drawer.
    if (report.navPosition) {
      const wantStatic = width >= 1024
      const isStatic = report.navPosition === 'relative' || report.navPosition === 'static'
      if (wantStatic && !isStatic) fail(`${width}px ${tag}: nav should be a rail, is ${report.navPosition}`)
      if (!wantStatic && isStatic) fail(`${width}px ${tag}: nav should be a drawer, is ${report.navPosition}`)
    }

    if (report.vOverflow > 0) {
      console.log(`  note  ${tag}: scroll region overflows vertically by ${report.vOverflow}px`)
    }

    if (SHOTS) {
      await page.screenshot({ path: path.join(OUT, `${width}-${id}.png`), fullPage: false })
    }
    console.log(`  ok    ${tag}`)
  }

  // Two form field slots: side by side from 768 up, stacked below.
  //
  // Measured on the first field ROW's two direct children, not on the first
  // two `<input>`s in the document — those are Account Number (row 1) and a
  // radio (row 2), which are never on the same line, so that version of this
  // check reported "stacked" at every width including 1920.
  await page.goto(`${BASE}/flow/B07`, { waitUntil: 'networkidle' })
  const sideBySide = await page.evaluate(() => {
    const row = document.querySelector('[class*="--viq-row-gap"]')
    if (!row || row.children.length < 2) return null
    const a = row.children[0].getBoundingClientRect()
    const b = row.children[1].getBoundingClientRect()
    return Math.abs(a.top - b.top) < 4
  })
  if (sideBySide !== null) {
    const want = width >= 768
    if (sideBySide !== want) {
      fail(`${width}px form: field slots ${sideBySide ? 'side by side' : 'stacked'}, expected ${want ? 'side by side' : 'stacked'}`)
    } else {
      console.log(`  ok    form slots ${sideBySide ? 'side by side' : 'stacked'}`)
    }
  }

  // Review: logo card beside the rows in canvas mode, above/below them in
  // responsive mode. Compared on the review row container's two children.
  await page.goto(`${BASE}/flow/R2`, { waitUntil: 'networkidle' })
  const reviewBeside = await page.evaluate(() => {
    const row = document.querySelector('[class*="gap-review"], [class*="flex-col"][class*="overflow-y-auto"]')
    if (!row || row.children.length < 2) return null
    const a = row.children[0].getBoundingClientRect()
    const b = row.children[1].getBoundingClientRect()
    return b.left > a.right - 4
  })
  if (reviewBeside !== null) {
    const want = width >= CANVAS_MIN_WIDTH
    if (reviewBeside !== want) {
      fail(`${width}px review: logo ${reviewBeside ? 'beside' : 'stacked'}, expected ${want ? 'beside' : 'stacked'}`)
    } else {
      console.log(`  ok    review logo ${reviewBeside ? 'beside rows' : 'stacked under rows'}`)
    }
  }
}

// Design-width token contract.
console.log('\n=== token ceilings at 1920 ===')
await page.setViewportSize({ width: 1920, height: 1080 })
await page.goto(`${BASE}/flow/B01`, { waitUntil: 'networkidle' })
const resolved = await page.evaluate((names) => {
  const probe = document.createElement('div')
  document.body.appendChild(probe)
  const out = {}
  for (const name of names) {
    probe.style.width = `var(${name})`
    out[name] = getComputedStyle(probe).width
  }
  probe.remove()
  return out
}, Object.keys(DESIGN_TOKENS))

for (const [name, want] of Object.entries(DESIGN_TOKENS)) {
  const got = resolved[name]
  if (got !== want) fail(`token ${name} = ${got} at 1920, expected ${want}`)
  else console.log(`  ok    ${name} = ${got}`)
}

await browser.close()

console.log(
  failures.length === 0
    ? `\nPASS — ${WIDTHS.length} widths x ${SCREENS.length} screens, no overflow, all breakpoints and token ceilings correct.`
    : `\nFAIL — ${failures.length} problem(s):\n` + failures.map((f) => `  - ${f}`).join('\n'),
)
process.exit(failures.length === 0 ? 0 : 1)
