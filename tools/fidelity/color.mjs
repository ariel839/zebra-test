import { chromium } from 'playwright'
import fs from 'node:fs'
const [img, kind, pts] = process.argv.slice(2)
const b64 = fs.readFileSync(img).toString('base64')
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
await page.setContent(`<img id="i" src="data:image/png;base64,${b64}">`)
await page.waitForFunction(() => document.getElementById('i').complete)
console.log(await page.evaluate(({ kind, pts }) => {
  const el = document.getElementById('i'); const W = el.naturalWidth, H = el.naturalHeight
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d'); ctx.drawImage(el, 0, 0)
  const d = ctx.getImageData(0, 0, W, H).data
  const F = kind === 'ref' ? { X: 20, Y: 11, W: 1411 } : { X: 0, Y: 0, W: 1920 }
  const S = 1920 / F.W
  return pts.split(';').map(p => {
    const [X, Y] = p.split(',').map(Number)
    const i = (Math.round(F.Y + Y/S) * W + Math.round(F.X + X/S)) * 4
    return `${p} -> #${[d[i],d[i+1],d[i+2]].map(v=>v.toString(16).padStart(2,'0')).join('')}`
  }).join('\n')
}, { kind, pts })); await browser.close()
