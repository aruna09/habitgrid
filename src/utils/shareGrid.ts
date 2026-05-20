import { Logs, Habit, formatDate, getConsolidatedDayColor } from '../store'

type Period = 'current' | number

interface MonthBlock {
  label: string
  year: number
  month: number
  columns: ({ date: string; isFuture: boolean } | null)[][]
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function buildBlock(year: number, month: number): MonthBlock {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow = new Date(year, month, 1).getDay()
  const numCols = Math.ceil((startDow + daysInMonth) / 7)
  const columns: ({ date: string; isFuture: boolean } | null)[][] = []
  for (let col = 0; col < numCols; col++) {
    const column: ({ date: string; isFuture: boolean } | null)[] = []
    for (let row = 0; row < 7; row++) {
      const dayNum = col * 7 + row - startDow + 1
      if (dayNum < 1 || dayNum > daysInMonth) {
        column.push(null)
      } else {
        const d = new Date(year, month, dayNum)
        column.push({ date: formatDate(d), isFuture: d > new Date() })
      }
    }
    columns.push(column)
  }
  return { label: MONTH_NAMES[month], year, month, columns }
}

function buildBlocks(period: Period): MonthBlock[] {
  const today = new Date()
  const blocks: MonthBlock[] = []
  if (period === 'current') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      blocks.push(buildBlock(d.getFullYear(), d.getMonth()))
    }
  } else {
    for (let m = 0; m < 12; m++) {
      blocks.push(buildBlock(period as number, m))
    }
  }
  return blocks
}

export async function shareConsolidatedGrid(
  logs: Logs,
  habits: Habit[],
  accentColor: string,
  period: Period,
  userName: string
): Promise<void> {
  const blocks = buildBlocks(period)

  // Layout constants (logical pixels — scaled ×2 for retina)
  const CELL = 12
  const GAP = 3
  const MONTH_GAP = 7
  const PAD = 20
  const DAY_LABEL_W = 26
  const MONTH_LABEL_H = 16
  const GRID_ROW_H = CELL + GAP
  const GRID_H = 7 * GRID_ROW_H - GAP
  const STATS_H = 52
  const HEADER_H = 44

  // Compute canvas width
  let gridW = 0
  for (const block of blocks) {
    gridW += block.columns.length * (CELL + GAP) - GAP + MONTH_GAP
  }
  gridW -= MONTH_GAP

  const logicalW = PAD + DAY_LABEL_W + 4 + gridW + PAD
  const logicalH = HEADER_H + PAD + MONTH_LABEL_H + 4 + GRID_H + PAD + STATS_H + PAD

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(logicalW * dpr)
  canvas.height = Math.round(logicalH * dpr)
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  // Background
  ctx.fillStyle = '#0D1117'
  ctx.fillRect(0, 0, logicalW, logicalH)

  // Header bar
  ctx.fillStyle = '#161B22'
  ctx.fillRect(0, 0, logicalW, HEADER_H)

  // Header separator
  ctx.fillStyle = '#21262D'
  ctx.fillRect(0, HEADER_H, logicalW, 1)

  // App name in header
  await document.fonts.ready
  ctx.fillStyle = accentColor
  ctx.font = `600 16px "DM Mono", monospace`
  ctx.textBaseline = 'middle'
  ctx.fillText('HabitGrid', PAD, HEADER_H / 2)

  // Habit count in header (right side)
  const activeCount = habits.filter((h) => h.active).length
  ctx.fillStyle = '#8B949E'
  ctx.font = `400 12px "DM Mono", monospace`
  ctx.textAlign = 'right'
  ctx.fillText(
    `${activeCount} habit${activeCount !== 1 ? 's' : ''} · ${period === 'current' ? 'last 12 months' : String(period)}`,
    logicalW - PAD,
    HEADER_H / 2
  )
  ctx.textAlign = 'left'

  // Grid origin
  const ox = PAD + DAY_LABEL_W + 4
  const oy = HEADER_H + PAD + MONTH_LABEL_H + 4

  // Day labels (alternating)
  const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  ctx.fillStyle = '#8B949E'
  ctx.font = `400 8px "DM Mono", monospace`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'right'
  for (let row = 0; row < 7; row++) {
    if (row % 2 === 0) {
      ctx.fillText(DAY_ABBR[row], PAD + DAY_LABEL_W, oy + row * GRID_ROW_H + CELL / 2)
    }
  }

  // Month labels + cells
  let cx = ox
  for (const block of blocks) {
    const blockW = block.columns.length * (CELL + GAP) - GAP

    // Month label
    ctx.fillStyle = '#8B949E'
    ctx.font = `400 9px "DM Mono", monospace`
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.fillText(block.label, cx, HEADER_H + PAD)

    // Cells
    for (let ci = 0; ci < block.columns.length; ci++) {
      const col = block.columns[ci]
      for (let ri = 0; ri < 7; ri++) {
        const cell = col[ri]
        const x = cx + ci * (CELL + GAP)
        const y = oy + ri * GRID_ROW_H
        if (!cell) continue
        const color = cell.isFuture
          ? 'transparent'
          : getConsolidatedDayColor(logs, habits, cell.date, accentColor)
        if (color === 'transparent') continue
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(x, y, CELL, CELL, 2)
        ctx.fill()
      }
    }

    cx += blockW + MONTH_GAP
  }

  // Stats row
  const sy = HEADER_H + PAD + MONTH_LABEL_H + 4 + GRID_H + PAD
  ctx.fillStyle = '#21262D'
  ctx.fillRect(0, sy, logicalW, 1)

  const activeDays = Object.keys(logs).filter((date) =>
    habits.filter((h) => h.active).some((h) => logs[date]?.[h.id])
  ).length

  // Streak — count consecutive days ending today with any habit done
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 400; i++) {
    const ds = formatDate(d)
    const done = habits.filter((h) => h.active).some((h) => logs[ds]?.[h.id])
    if (done) { streak++ } else if (i > 0) { break }
    d.setDate(d.getDate() - 1)
  }

  const stats = [
    { label: 'Active days', value: String(activeDays) },
    { label: 'Current streak', value: String(streak) },
  ]
  const statW = logicalW / stats.length
  for (let i = 0; i < stats.length; i++) {
    const sx = i * statW + PAD
    ctx.fillStyle = '#8B949E'
    ctx.font = `400 9px "DM Mono", monospace`
    ctx.textBaseline = 'top'
    ctx.fillText(stats[i].label, sx, sy + 12)
    ctx.fillStyle = accentColor
    ctx.font = `600 18px "DM Mono", monospace`
    ctx.fillText(stats[i].value, sx, sy + 24)
  }

  // Share
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  )
  if (!blob) return

  const file = new File([blob], 'habitgrid.png', { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: `${userName || 'My'} HabitGrid` })
  } else {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'habitgrid.png'
    a.click()
    URL.revokeObjectURL(url)
  }
}
