import { useRef } from 'react'
import { useStore, Habit } from '../store'

interface Props {
  onBack: () => void
}

const PRESETS = [
  '#39d353', // green (default)
  '#58a6ff', // blue
  '#bc8cff', // purple
  '#f778ba', // pink
  '#ffa657', // orange
  '#ff7b72', // coral
  '#e3b341', // gold
  '#3dc9b0', // teal
]

export default function Settings({ onBack }: Props) {
  const { habits, accentColor, deleteHabit, reorderHabits, setAccentColor } = useStore()
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)

  const activeHabits = habits.filter((h) => h.active)
  const isCustom = !PRESETS.includes(accentColor)

  function handleDragStart(idx: number) { dragItem.current = idx }
  function handleDragEnter(idx: number) { dragOver.current = idx }
  function handleDragEnd() {
    if (dragItem.current === null || dragOver.current === null) return
    const reordered = [...habits]
    const [moved] = reordered.splice(dragItem.current, 1)
    reordered.splice(dragOver.current, 0, moved)
    reorderHabits(reordered)
    dragItem.current = null
    dragOver.current = null
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: 'var(--bg)' }}>
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
          Settings
        </h1>
        <div style={{ width: '52px' }} />
      </header>

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        {/* Appearance */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          APPEARANCE
        </p>
        <div
          className="rounded-xl px-4 py-4 mb-6"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Grid colour
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            {PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => setAccentColor(color)}
                aria-label={color}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: 'none',
                  cursor: 'pointer',
                  outline: accentColor === color ? `3px solid ${color}` : '3px solid transparent',
                  outlineOffset: '2px',
                  flexShrink: 0,
                }}
              />
            ))}
            {/* Custom colour picker */}
            <label style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
              />
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background:
                    'conic-gradient(hsl(0,100%,60%),hsl(45,100%,60%),hsl(90,100%,60%),hsl(135,100%,60%),hsl(180,100%,60%),hsl(225,100%,60%),hsl(270,100%,60%),hsl(315,100%,60%),hsl(360,100%,60%))',
                  outline: isCustom ? '3px solid white' : '3px solid transparent',
                  outlineOffset: '2px',
                }}
              />
            </label>
          </div>
        </div>

        {/* Habits */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          HABITS
        </p>

        {activeHabits.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>
            No habits yet. Use the + button to add one.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {habits.filter((h) => h.active).map((habit, idx) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onDelete={() => deleteHabit(habit.id)}
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        )}

        <p className="text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>
          {activeHabits.length}/10 habits
        </p>
      </div>
    </div>
  )
}

interface HabitRowProps {
  habit: Habit
  onDelete: () => void
  onDragStart: () => void
  onDragEnter: () => void
  onDragEnd: () => void
}

function HabitRow({ habit, onDelete, onDragStart, onDragEnter, onDragEnd }: HabitRowProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className="flex items-center gap-3 px-3 py-3 rounded-lg"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="cursor-grab" style={{ color: 'var(--border-muted)' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="4" y="4" width="3" height="3" rx="1" />
          <rect x="9" y="4" width="3" height="3" rx="1" />
          <rect x="4" y="9" width="3" height="3" rx="1" />
          <rect x="9" y="9" width="3" height="3" rx="1" />
        </svg>
      </div>
      <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
        {habit.name}
      </span>
      <button
        onClick={onDelete}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
