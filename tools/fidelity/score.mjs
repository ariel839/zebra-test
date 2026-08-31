// score.mjs <id...> — per-screen mismatch score + worst grid cells.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
const SP = '/private/tmp/claude-501/-Users-ariellunenfeld-zebra-viq-wizard/0ccaf47f-7650-49ea-bd90-5cdee4267746/scratchpad'
const SCREENS = '/Users/ariellunenfeld/zebra-viq-wizard/wizard-spec-files/screens'
const refs = Object.fromEntries(fs.readdirSync(SCREENS)
  .filter(f => f.endsWith('.png') && !f.includes('_zoom')).map(f => [f.split('_')[0], f]))
// Regions of a reference screenshot that are Figma chrome, not design: live
// collaborator cursor pins baked into the capture. Ignored when scoring.
const MASKS = {
  B07: [[1690, 890, 150, 130]],
  B08: [[130, 20, 90, 80]],
}
const RECTS = JSON.parse(fs.readFileSync(path.join(SP, 'rects.json'), 'utf8'))
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 400, height: 300 } })
const rows = []
for (const id of process.argv.slice(2)) {
  const a = fs.readFileSync(path.join(SCREENS, refs[id])).toString('base64')
  const b = fs.readFileSync(path.join(SP, 'shots', `${id}.png`)).toString('base64')
  await page.setContent(`<canvas id="c" width="1920" height="1080"></canvas>
    <img id="a" src="data:image/png;base64,${a}"><img id="b" src="data:image/png;base64,${b}">`)
  await page.waitForFunction(() => document.getElementById('a').complete && document.getElementById('b').complete)
  const r = await page.evaluate(({ rect, masks }) => {
    const ctx = document.getElementById('c').getContext('2d')
    const grab = (el, crop) => {
      ctx.clearRect(0, 0, 1920, 1080)
      if (crop) ctx.drawImage(el, rect.x, rect.y, rect.w, rect.h, 0, 0, 1920, 1080)
      else ctx.drawImage(el, 0, 0, 1920, 1080)
      return ctx.getImageData(0, 0, 1920, 1080).data
    }
    const A = grab(document.getElementById('a'), true)
    const B = grab(document.getElementById('b'), false)
    const GX = 16, GY = 12, cw = 1920 / GX, ch = 1080 / GY
    const cells = Array.from({ length: GX * GY }, () => 0)
    let total = 0
    const masked = (x, y) => masks.some(([mx, my, mw, mh]) => x >= mx && x < mx + mw && y >= my && y < my + mh)
    for (let y = 0; y < 1080; y += 2) for (let x = 0; x < 1920; x += 2) {
      if (masked(x, y)) continue
      const i = (y * 1920 + x) * 4
      const dv = (Math.abs(A[i]-B[i]) + Math.abs(A[i+1]-B[i+1]) + Math.abs(A[i+2]-B[i+2])) / 3
      total += dv
      cells[Math.floor(y / ch) * GX + Math.floor(x / cw)] += dv
    }
    const n = (1920 / 2) * (1080 / 2)
    const per = (cw / 2) * (ch / 2)
    const worst = cells.map((v, i) => ({ v: v / per, x: Math.round((i % GX) * cw), y: Math.round(Math.floor(i / GX) * ch) }))
      .sort((p, q) => q.v - p.v).slice(0, 6)
    return { score: total / n, worst }
  }, { rect: RECTS[id], masks: MASKS[id] || [] })
  rows.push(`${id.padEnd(4)} score ${r.score.toFixed(2).padStart(6)}   worst: ` +
    r.worst.map(w => `(${w.x},${w.y})=${w.v.toFixed(0)}`).join(' '))
}
console.log(rows.join('\n'))
await browser.close()
