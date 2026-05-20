import { useState, useEffect } from 'react'

interface Props {
  onDone: () => void
  accentColor: string
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').padEnd(6, '0')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

const OPACITIES = [0.06, 0.12, 0.22, 0.38, 0.58, 0.78, 1.0]

function randLevel() {
  return Math.floor(Math.random() * OPACITIES.length)
}

function buildMonthCells(year: number, month: number): (boolean | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow = new Date(year, month, 1).getDay()
  const numCols = Math.ceil((startDow + daysInMonth) / 7)
  const cells: (boolean | null)[] = []
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < 7; row++) {
      const dayNum = col * 7 + row - startDow + 1
      cells.push(dayNum >= 1 && dayNum <= daysInMonth ? true : null)
    }
  }
  return cells
}

export default function SplashScreen({ onDone, accentColor }: Props) {
  const now = new Date()
  const cells = buildMonthCells(now.getFullYear(), now.getMonth())

  const [levels, setLevels] = useState<number[]>(() =>
    cells.map((c) => (c ? randLevel() : 0))
  )
  const [exiting, setExiting] = useState(false)

  // Start fade-out after 2s
  useEffect(() => {
    const t = setTimeout(() => setExiting(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // Call onDone after fade-out completes
  useEffect(() => {
    if (!exiting) return
    const t = setTimeout(onDone, 450)
    return () => clearTimeout(t)
  }, [exiting, onDone])

  // Flicker: update ~35% of cells each tick
  useEffect(() => {
    const interval = setInterval(() => {
      setLevels((prev) =>
        prev.map((l, i) => (cells[i] && Math.random() > 0.65 ? randLevel() : l))
      )
    }, 120)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [r, g, b] = hexToRgb(accentColor)
  const CELL = 18
  const GAP = 5

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '28px',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.45s ease',
        zIndex: 1000,
      }}
    >
      {/* Month grid — column-major via grid-auto-flow: column */}
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridTemplateRows: `repeat(7, ${CELL}px)`,
          gridAutoColumns: `${CELL}px`,
          gap: `${GAP}px`,
        }}
      >
        {cells.map((cell, i) => (
          <div
            key={i}
            style={{
              width: CELL,
              height: CELL,
              borderRadius: '4px',
              backgroundColor: cell
                ? `rgba(${r}, ${g}, ${b}, ${OPACITIES[levels[i]]})`
                : 'transparent',
            }}
          />
        ))}
      </div>

      {/* App name */}
      <p
        style={{
          margin: 0,
          color: accentColor,
          fontSize: '30px',
          fontWeight: 600,
          fontFamily: '"DM Mono", monospace',
          letterSpacing: '-0.02em',
        }}
      >
        HabitGrid
      </p>
    </div>
  )
}
