// Detects each reference PNG's Figma frame rect (the 1920x1080 artboard inside
// the screenshot) once and caches it, so every comparison uses the exact crop.
import { chromium } from 'playwright'
import fs from 'node:fs'
const SCREENS = '/Users/ariellunenfeld/zebra-viq-wizard/wizard-spec-files/screens'
const files = fs.readdirSync(SCREENS).filter(f => f.endsWith('.png') && !f.includes('_zoom') && !f.startsWith('E4'))
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
const out = {}
for (const file of files) {
  const b64 = fs.readFileSync(`${SCREENS}/${file}`).toString('base64')
  await page.setContent(`<img id="i" src="data:image/png;base64,${b64}">`)
  await page.waitForFunction(() => document.getElementById('i').complete)
  const r = await page.evaluate(() => {
    const img = document.getElementById('i')
    const W = img.naturalWidth, H = img.naturalHeight
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0)
    const d = ctx.getImageData(0, 0, W, H).data
    const at = (x, y) => { const i = (y*W+x)*4; return [d[i], d[i+1], d[i+2]] }
    const isBlue = (x, y) => { const [r,g,b] = at(x,y); return b > 180 && b - r > 90 && g > 100 && g < 200 }
    const midY = Math.floor(H*0.5)
    let x0 = -1, x1 = -1
    for (let x = 0; x < W; x++) if (isBlue(x, midY)) { x0 = x; break }
    for (let x = W-1; x >= 0; x--) if (isBlue(x, midY)) { x1 = x; break }
    const probeX = x0 + 40
    let y0 = -1, y1 = -1
    for (let y = 0; y < H; y++) if (isBlue(probeX, y)) { y0 = y; break }
    for (let y = H-1; y >= 0; y--) if (isBlue(probeX, y)) { y1 = y; break }
    return { x: x0 + 1, y: y0 + 1, w: x1 - x0 - 1, h: y1 - y0 - 1 }
  })
  out[file.split('_')[0]] = r
}
fs.writeFileSync('rects.json', JSON.stringify(out, null, 1))
console.log(Object.keys(out).length, 'rects cached')
await browser.close()
