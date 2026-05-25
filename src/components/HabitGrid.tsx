import { useRef, useEffect } from 'react'
import { useStore, getHabitDayColor, formatDate } from '../store'

type Period = 'current' | number

interface Props {
  habitId: string
  period: Period
  accentColor: string
  onToggle?: (date: string) => void
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
        const dateStr = formatDate(d)
        column.push({ date: dateStr, isFuture: d > new Date() })
      }
    }
    columns.push(column)
  }
  return { label: MONTH_NAMES[month], columns }
}

export default function HabitGrid({ habitId, period, accentColor, onToggle }: Props) {
  const { logs } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = period === 'current' ? formatDate(yesterday) : null

  const blocks = []
  if (period === 'current') {
    for (let i = 12; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      blocks.push(buildMonthBlock(d.getFullYear(), d.getMonth()))
    }
  } else {
    for (let m = 0; m < 12; m++) {
      blocks.push(buildMonthBlock(period as number, m))
    }
  }

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
  }, [period])

  const CELL = 13
  const GAP = 3
  const MONTH_GAP = 5

  return (
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
                        : getHabitDayColor(logs, habitId, cell.date, accentColor)
                      const isYesterday = cell.date === yesterdayStr
                      return (
                        <div
                          key={ri}
                          title={isYesterday ? 'Tap to log yesterday' : cell.date}
                          onClick={isYesterday && onToggle ? () => onToggle(cell.date) : undefined}
                          style={{
                            width: CELL,
                            height: CELL,
                            flexShrink: 0,
                            backgroundColor: color,
                            borderRadius: '3px',
                            cursor: isYesterday && onToggle ? 'pointer' : 'default',
                            outline: isYesterday ? `1.5px solid var(--accent)` : 'none',
                            outlineOffset: '1px',
                            opacity: isYesterday ? 1 : undefined,
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
  )
}
