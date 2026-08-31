import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const SP = '/private/tmp/claude-501/-Users-ariellunenfeld-zebra-viq-wizard/0ccaf47f-7650-49ea-bd90-5cdee4267746/scratchpad'
const SCREENS = '/Users/ariellunenfeld/zebra-viq-wizard/wizard-spec-files/screens'
const MODE = process.env.MODE || 'diff'   // 'diff' | 'ref' | 'stack'
const OUT = path.join(SP, MODE === 'diff' ? 'diffs' : MODE === 'ref' ? 'refs' : 'stacks')
fs.mkdirSync(OUT, { recursive: true })

const refs = Object.fromEntries(
  fs.readdirSync(SCREENS).filter(f => f.endsWith('.png') && !f.includes('_zoom'))
    .map(f => [f.split('_')[0], f])
)

// The reference PNGs are Figma screenshots: the 1920x1080 frame occupies
// x 20..1431, y 11..806 (1411x795) of a 1456x832 image.
const RECTS = JSON.parse(fs.readFileSync(path.join(SP, 'rects.json'), 'utf8'))
const cssFor = (id, natW) => {
  const r = RECTS[id]
  const sx = 1920 / r.w, sy = 1080 / r.h
  return `position:absolute;width:${(natW*sx).toFixed(2)}px;height:auto;left:${(-r.x*sx).toFixed(2)}px;top:${(-r.y*sy).toFixed(2)}px;transform-origin:top left;transform:scaleY(${(sy/sx).toFixed(5)})`
}

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })

for (const id of process.argv.slice(2)) {
  const ref = refs[id]
  const shot = path.join(SP, 'shots', `${id}.png`)
  if (!ref) { console.log('no ref', id); continue }
  const a = fs.readFileSync(path.join(SCREENS, ref)).toString('base64')
  const refImg = `<img src="data:image/png;base64,${a}" style="${cssFor(id, 1456)}">`
  let html
  if (MODE === 'ref') {
    html = `<body style="margin:0"><div style="position:relative;width:1920px;height:1080px;overflow:hidden">${refImg}</div></body>`
  } else {
    const b = fs.readFileSync(shot).toString('base64')
    const built = `<img src="data:image/png;base64,${b}" style="position:absolute;left:0;top:0;width:1920px;height:1080px`
    html = MODE === 'diff'
      ? `<body style="margin:0;background:#000"><div style="position:relative;width:1920px;height:1080px;overflow:hidden;background:#000">${refImg}${built};mix-blend-mode:difference"></div></body>`
      : `<body style="margin:0;background:#222;font:12px monospace;color:#fff">
         <div style="position:relative;width:1920px;height:1080px;overflow:hidden">${refImg}</div>
         <div style="height:2px;background:#f0f"></div>
         <div style="position:relative;width:1920px;height:1080px">${built}"></div></body>`
  }
  await page.setContent(html)
  await page.waitForTimeout(150)
  await page.screenshot({ path: path.join(OUT, `${id}.png`), fullPage: MODE === 'stack' })
  process.stdout.write(id + ' ')
}
console.log('done')
await browser.close()
