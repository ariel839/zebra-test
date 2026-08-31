// zoom.mjs <id> <x> <y> <w> <h> [scale] — ref vs app crop, stacked, magnified.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
const SP = '/private/tmp/claude-501/-Users-ariellunenfeld-zebra-viq-wizard/0ccaf47f-7650-49ea-bd90-5cdee4267746/scratchpad'
const SCREENS = '/Users/ariellunenfeld/zebra-viq-wizard/wizard-spec-files/screens'
const RECTS = JSON.parse(fs.readFileSync(path.join(SP, 'rects.json'), 'utf8'))
const refs = Object.fromEntries(fs.readdirSync(SCREENS)
  .filter(f => f.endsWith('.png') && !f.includes('_zoom')).map(f => [f.split('_')[0], f]))
const [id, X, Y, W, H, SC] = process.argv.slice(2)
const x = +X, y = +Y, w = +W, h = +H, sc = +(SC || 2)
const a = fs.readFileSync(path.join(SCREENS, refs[id])).toString('base64')
const b = fs.readFileSync(path.join(SP, 'shots', `${id}.png`)).toString('base64')
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Math.ceil(w*sc), height: Math.ceil(h*sc*2) + 40 } })
const r = RECTS[id]
await page.setContent(`<body style="margin:0;background:#333;font:11px monospace;color:#fff">
<canvas id="c" width="${w*sc}" height="${h*sc*2+34}"></canvas>
<img id="a" src="data:image/png;base64,${a}" style="display:none">
<img id="b" src="data:image/png;base64,${b}" style="display:none">`)
await page.waitForFunction(() => document.getElementById('a').complete && document.getElementById('b').complete)
await page.evaluate(({ r, x, y, w, h, sc }) => {
  const ctx = document.getElementById('c').getContext('2d')
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = '#333'; ctx.fillRect(0, 0, w*sc, h*sc*2+34)
  // reference: map design px -> screenshot px through the frame rect
  const sx = r.w / 1920, sy = r.h / 1080
  ctx.drawImage(document.getElementById('a'), r.x + x*sx, r.y + y*sy, w*sx, h*sy, 0, 17, w*sc, h*sc)
  ctx.drawImage(document.getElementById('b'), x, y, w, h, 0, h*sc + 34, w*sc, h*sc)
  ctx.fillStyle = '#fff'; ctx.font = '12px monospace'
  ctx.fillText('FIGMA', 4, 12)
  ctx.fillText('BUILT', 4, h*sc + 30)
}, { r, x, y, w, h, sc })
await page.locator('#c').screenshot({ path: path.join(SP, 'zoom.png') })
console.log('zoom.png', w, 'x', h, '@', sc + 'x')
await browser.close()
