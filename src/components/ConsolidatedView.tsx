import { useRef, useEffect, useState } from 'react'
import { useStore, getConsolidatedDayColor, formatDate, hexToRgb } from '../store'
import { shareConsolidatedGrid } from '../utils/shareGrid'

type Period = 'current' | number

interface Props {
  period: Period
  onBack: () => void
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type Cell = { date: string; isFuture: boolean } | null

function buildMonthBlock(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow = new Date(year, month, 1).getDay()
  const numCols = Math.ceil((startDow + daysInMonth) / 7)
  const columns: Cell[][] = []
  for (let col = 0; col < numCols; col++) {
    const column: Cell[] = []
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
  return { label: MONTH_NAMES[month], columns }
}

export default function ConsolidatedView({ period, onBack }: Props) {
  const { logs, habits, accentColor, userName } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState(false)

  const activeHabits = habits.filter((h) => h.active)
  const today = new Date()

  const blocks = []
  if (period === 'current') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      blocks.push(buildMonthBlock(d.getFullYear(), d.getMonth()))
    }
  } else {
    for (let m = 0; m < 12; m++) {
      blocks.push(buildMonthBlock(period as number, m))
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [period])

  // Stats — active days filtered to the displayed period
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - 365)
  const cutoffStr = formatDate(cutoff)

  const activeDays = Object.keys(logs).filter((date) => {
    const inPeriod = period === 'current' ? date >= cutoffStr : date.startsWith(String(period))
    return inPeriod && activeHabits.some((h) => logs[date]?.[h.id])
  }).length

  // Streak = consecutive days ending today where ≥1 habit was done (any habit counts)
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 400; i++) {
    const ds = formatDate(d)
    const done = activeHabits.some((h) => logs[ds]?.[h.id])
    if (done) { streak++ } else if (i > 0) { break }
    d.setDate(d.getDate() - 1)
  }

  async function handleShare() {
    setSharing(true)
    try {
      await shareConsolidatedGrid(logs, activeHabits, accentColor, period, userName)
    } finally {
      setSharing(false)
    }
  }

  // Legend shades
  const [r, g, b] = hexToRgb(accentColor)
  const legendShades = [
    `rgba(${r}, ${g}, ${b}, 0.12)`,
    `rgba(${r}, ${g}, ${b}, 0.35)`,
    `rgba(${r}, ${g}, ${b}, 0.58)`,
    `rgba(${r}, ${g}, ${b}, 0.78)`,
    accentColor,
  ]

  const CELL = 13
  const GAP = 3
  const MONTH_GAP = 5

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="flex items-center px-4 py-4 pt-safe-top border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm"
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <h1 className="text-base font-semibold mx-auto" style={{ color: 'var(--text-primary)' }}>
          Combined
        </h1>
        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: sharing ? 'default' : 'pointer',
            opacity: sharing ? 0.6 : 1,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M4 4l3-3 3 3M2 10v2a1 1 0 001 1h8a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {sharing ? 'Saving…' : 'Share'}
        </button>
      </header>

      <div className="flex-1 px-4 py-5 flex flex-col gap-5">
        {/* Stats */}
        <div className="flex gap-4">
          {[
            { label: 'Active days', value: activeDays },
            { label: 'Streak', value: streak },
            { label: 'Habits', value: activeHabits.length },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex-1 rounded-xl px-3 py-3 text-center"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
              <p className="text-xl font-semibold font-mono" style={{ color: 'var(--accent)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div
          className="rounded-xl px-4 pt-4 pb-3"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="inline-flex gap-0">
              {/* Day labels */}
              <div className="flex flex-col mr-2 flex-shrink-0" style={{ gap: `${GAP}px`, paddingTop: '20px' }}>
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-end"
                    style={{
                      height: `${CELL}px`,
                      fontSize: '9px',
                      color: 'var(--text-secondary)',
                      fontFamily: '"DM Mono", monospace',
                      minWidth: '22px',
                      opacity: i % 2 === 0 ? 1 : 0,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Month blocks */}
              <div className="flex items-start" style={{ gap: `${MONTH_GAP}px` }}>
                {blocks.map((block, bi) => (
                  <div key={bi} className="flex flex-col flex-shrink-0">
                    <div
                      style={{
                        height: '18px',
                        fontSize: '10px',
                        color: 'var(--text-secondary)',
                        fontFamily: '"DM Mono", monospace',
                        marginBottom: '2px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {block.label}
                    </div>
                    <div className="flex" style={{ gap: `${GAP}px` }}>
                      {block.columns.map((col, ci) => (
                        <div key={ci} className="flex flex-col" style={{ gap: `${GAP}px` }}>
                          {col.map((cell, ri) => {
                            if (!cell) {
                              return <div key={ri} style={{ width: CELL, height: CELL, flexShrink: 0 }} />
                            }
                            const color = cell.isFuture
                              ? 'transparent'
                              : getConsolidatedDayColor(logs, activeHabits, cell.date, accentColor)
                            return (
                              <div
                                key={ri}
                                title={cell.date}
                                style={{
                                  width: CELL,
                                  height: CELL,
                                  flexShrink: 0,
                                  backgroundColor: color,
                                  borderRadius: '3px',
                                }}
                              />
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: '"DM Mono", monospace' }}>
              Less
            </span>
            {legendShades.map((shade, i) => (
              <div
                key={i}
                style={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: shade, flexShrink: 0 }}
              />
            ))}
            <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: '"DM Mono", monospace' }}>
              More
            </span>
          </div>
        </div>

        {/* Habit breakdown */}
        <div className="pb-24">
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            HABITS IN THIS VIEW
          </p>
          <div className="flex flex-col gap-2">
            {activeHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div
                  style={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: accentColor, flexShrink: 0 }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{habit.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
