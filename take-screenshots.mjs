import { chromium } from 'playwright'

const VIEWPORT = { width: 390, height: 844 }
const BASE = 'http://localhost:5174'

const SEED = `
  const store = JSON.parse(localStorage.getItem('habitgrid-storage') || '{}')
  const state = store.state || {}
  state.accentColor = '#39d353'
  state.userName = 'Aruna'
  state.habits = [
    { id: 'h1', name: 'No sugar', createdAt: '2024-01-01T00:00:00.000Z', active: true },
    { id: 'h2', name: 'Gym', createdAt: '2024-01-01T00:00:00.000Z', active: true },
    { id: 'h3', name: 'Read', createdAt: '2024-01-01T00:00:00.000Z', active: true },
  ]
  const logs = {}
  const today = new Date()
  for (let i = 0; i < 180; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth()+1).padStart(2,'0')
    const dd = String(d.getDate()).padStart(2,'0')
    const dateStr = yyyy + '-' + mm + '-' + dd
    const done = {}
    if (Math.random() > 0.25) done['h1'] = true
    if (Math.random() > 0.35) done['h2'] = true
    if (Math.random() > 0.4)  done['h3'] = true
    if (Object.values(done).some(Boolean)) logs[dateStr] = done
  }
  state.logs = logs
  state.streak = { current: 5, longest: 22 }
  store.state = state
  localStorage.setItem('habitgrid-storage', JSON.stringify(store))
`

async function shot(page, name) {
  await page.screenshot({ path: `screenshots/${name}.png`, clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height } })
  console.log(`  ✓ ${name}.png`)
}

async function freshGrid(page) {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await page.evaluate(SEED)
  await page.reload()
  await page.waitForTimeout(2800) // splash
}

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 })
  const page = await ctx.newPage()

  // ── Splash ─────────────────────────────────────────────────────────────────
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await page.evaluate(SEED)
  await page.reload()
  await page.waitForTimeout(350)
  await shot(page, '1-splash')

  // ── Main grid ──────────────────────────────────────────────────────────────
  await page.waitForTimeout(2600)
  await shot(page, '2-main-grid')

  // ── Add habit modal ────────────────────────────────────────────────────────
  await page.locator('button[aria-label="Add habit"]').click()
  await page.waitForTimeout(250)
  await shot(page, '3-add-habit')

  // ── Consolidated view ──────────────────────────────────────────────────────
  await freshGrid(page)
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('View combined'))?.click()
  })
  await page.waitForTimeout(400)
  await shot(page, '4-consolidated')

  // ── Settings ───────────────────────────────────────────────────────────────
  await freshGrid(page)
  await page.locator('button[aria-label="Menu"]').click()
  await page.waitForTimeout(200)
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Settings')?.click()
  })
  await page.waitForTimeout(300)
  await shot(page, '5-settings')

  // ── Profile ────────────────────────────────────────────────────────────────
  await freshGrid(page)
  await page.locator('button[aria-label="Menu"]').click()
  await page.waitForTimeout(200)
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Profile')?.click()
  })
  await page.waitForTimeout(300)
  await shot(page, '6-profile')

  await browser.close()
  console.log('\nAll screenshots saved to screenshots/')
})()
