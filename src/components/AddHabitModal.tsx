import { useState } from 'react'
import { useStore } from '../store'

interface Props {
  onClose: () => void
  onAdded?: () => void
}

export default function AddHabitModal({ onClose, onAdded }: Props) {
  const { habits, addHabit } = useStore()
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const activeCount = habits.filter((h) => h.active).length

  function handleAdd() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter a habit name.'); return }
    if (activeCount >= 10) { setError('Max 10 habits reached.'); return }
    addHabit(trimmed, notes.trim() || undefined)
    onClose()
    onAdded?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl px-5 pt-6 pb-8"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            New Habit
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          NAME
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="e.g. No sugar, Gym, Read"
          maxLength={40}
          autoFocus
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mb-4"
          style={{
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border-muted)',
            color: 'var(--text-primary)',
          }}
        />

        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          NOTES <span style={{ fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Why this habit matters to you…"
          maxLength={200}
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none mb-1"
          style={{
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border-muted)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
          }}
        />

        {error && (
          <p className="text-xs mb-3" style={{ color: '#F85149' }}>{error}</p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--border-muted)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Add Habit
          </button>
        </div>
      </div>
    </div>
  )
}
