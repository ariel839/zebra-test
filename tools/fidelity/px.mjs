// px.mjs <image> <ref|app> [--rows a,b] [--cols a,b] [--bbox x0,y0,x1,y1;...] [--thr N]
import { chromium } from 'playwright'
import fs from 'node:fs'
const [img, kind] = process.argv.slice(2, 4)
const arg = (n, dflt) => { const i = process.argv.indexOf('--' + n); return i === -1 ? dflt : process.argv[i + 1] }
const thr = Number(arg('thr', 246))
const b64 = fs.readFileSync(img).toString('base64')
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
await page.setContent(`<img id="i" src="data:image/png;base64,${b64}">`)
await page.waitForFunction(() => document.getElementById('i').complete)
const out = await page.evaluate(({ kind, rows, cols, bbox, thr }) => {
  const el = document.getElementById('i')
  const W = el.naturalWidth, H = el.naturalHeight
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d'); ctx.drawImage(el, 0, 0)
  const d = ctx.getImageData(0, 0, W, H).data
  // Figma screenshots: the 1920x1080 frame lives at (20,11) size 1411x795.
  const F = kind === 'ref' ? { X: 20, Y: 11, W: 1411 } : { X: 0, Y: 0, W: 1920 }
  const S = 1920 / F.W
  const ex = (X) => Math.round(F.X + X / S), ey = (Y) => Math.round(F.Y + Y / S)
  const lum = (X, Y) => { const i = (ey(Y)*W+ex(X))*4; return 0.299*d[i]+0.587*d[i+1]+0.114*d[i+2] }
  const hex = (X, Y) => { const i = (ey(Y)*W+ex(X))*4; return '#' + [d[i],d[i+1],d[i+2]].map(v=>v.toString(16).padStart(2,'0')).join('') }
  const res = {}
  for (const Y of (rows||'').split(',').filter(Boolean).map(Number)) {
    const segs = []; let s = -1
    for (let X = 0; X < 1920; X++) {
      const dark = lum(X, Y) < thr
      if (dark && s === -1) s = X; else if (!dark && s !== -1) { segs.push(`${s}-${X-1}`); s = -1 }
    }
    if (s !== -1) segs.push(`${s}-1919`)
    res['row ' + Y] = segs.join(' ')
  }
  for (const X of (cols||'').split(',').filter(Boolean).map(Number)) {
    const segs = []; let s = -1
    for (let Y = 0; Y < 1080; Y++) {
      const dark = lum(X, Y) < thr
      if (dark && s === -1) s = Y; else if (!dark && s !== -1) { segs.push(`${s}-${Y-1}`); s = -1 }
    }
    if (s !== -1) segs.push(`${s}-1079`)
    res['col ' + X] = segs.join(' ')
  }
  for (const spec of (bbox||'').split(';').filter(Boolean)) {
    const [x0,y0,x1,y1] = spec.split(',').map(Number)
    let mnX=1e9,mnY=1e9,mxX=-1,mxY=-1
    for (let Y=y0;Y<=y1;Y++) for (let X=x0;X<=x1;X++) if (lum(X,Y) < thr) { if(X<mnX)mnX=X; if(X>mxX)mxX=X; if(Y<mnY)mnY=Y; if(Y>mxY)mxY=Y }
    res['bbox ' + spec] = mxX<0 ? 'empty' : `x${mnX}..${mxX} w${mxX-mnX+1} | y${mnY}..${mxY} h${mxY-mnY+1}`
  }
  return res
}, { kind, rows: arg('rows',''), cols: arg('cols',''), bbox: arg('bbox',''), thr })
for (const k in out) console.log(k, '=>', out[k])
await browser.close()
