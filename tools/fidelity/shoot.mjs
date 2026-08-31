import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.BASE || 'http://localhost:5173'
const OUT = process.env.OUT || '/private/tmp/claude-501/-Users-ariellunenfeld-zebra-viq-wizard/0ccaf47f-7650-49ea-bd90-5cdee4267746/scratchpad/shots'
const ids = process.argv.slice(2)
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
const errors = {}
page.on('console', (m) => {
  if (m.type() === 'error') (errors[page.url()] ??= []).push(m.text())
})
page.on('pageerror', (e) => (errors[page.url()] ??= []).push('pageerror: ' + e.message))

for (const id of ids) {
  await page.goto(`${BASE}/flow/${id}`, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: '.z-999{display:none !important}' })
  await page.waitForTimeout(id === 'B09' ? 700 : 350)
  const canvas = await page.$('#root > div > div')
  await canvas.screenshot({ path: path.join(OUT, `${id}.png`) })
  process.stdout.write(`${id} `)
}
console.log('\nconsole errors:', JSON.stringify(errors, null, 2))
await browser.close()
