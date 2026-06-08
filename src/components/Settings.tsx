import { useRef, useState, useCallback } from 'react'
import { useStore, Habit, FREE_HABIT_LIMIT, formatDate } from '../store'
import UpgradeModal from './UpgradeModal'
import { exportBackup, importBackup, daysSinceBackup } from '../utils/backup'

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

const DEFAULT_COLOR = '#39d353'

export default function Settings({ onBack }: Props) {
  const { habits, accentColor, deleteHabit, reorderHabits, setAccentColor, isPro, licenseKey, setIsPro, setLicenseKey, lastBackedUp, setLastBackedUp } = useStore()
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [keyInput, setKeyInput] = useState('')
  const [keyStatus, setKeyStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [keyError, setKeyError] = useState<string | null>(null)

  const handleActivateKey = useCallback(async () => {
    const trimmed = keyInput.trim()
    if (!trimmed) return
    setKeyStatus('loading')
    setKeyError(null)
    try {
      const res = await fetch(`/api/verify-license?key=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      if (data.valid) {
        setIsPro(true)
        setLicenseKey(trimmed)
        setKeyInput('')
        setKeyStatus('idle')
      } else {
        setKeyError(data.error ?? 'Invalid license key. Double-check and try again.')
        setKeyStatus('error')
      }
    } catch {
      setKeyError('Could not reach the server. Check your connection.')
      setKeyStatus('error')
    }
  }, [keyInput, setIsPro, setLicenseKey])

  const handleExport = useCallback(() => {
    exportBackup()
    setLastBackedUp(formatDate(new Date()))
  }, [setLastBackedUp])

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportError(null)
    const result = await importBackup(file)
    if (result.ok) {
      window.location.reload()
    } else {
      setImportError(result.error ?? 'Something went wrong.')
      setImporting(false)
    }
    e.target.value = ''
  }, [])

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

        {/* Pro status */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          HABITGRID PRO
        </p>
        <div
          className="rounded-xl px-4 py-4 mb-6"
          style={{ backgroundColor: 'var(--surface)', border: `1px solid ${isPro ? 'var(--accent)' : 'var(--border)'}` }}
        >
          {isPro ? (
            <div className="flex items-center gap-3">
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 4" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Pro active</p>
                {licenseKey && (
                  <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {licenseKey.slice(0, 8)}••••••••
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Already purchased?</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                Enter the order ID from your purchase receipt (starts with <span style={{ fontFamily: '"DM Mono", monospace' }}>pay_</span>).
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => { setKeyInput(e.target.value); setKeyStatus('idle'); setKeyError(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleActivateKey()}
                  placeholder="pay_..."
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
                    backgroundColor: 'var(--bg)', border: `1px solid ${keyStatus === 'error' ? '#ff7b72' : 'var(--border)'}`,
                    color: 'var(--text-primary)', outline: 'none', fontFamily: '"DM Mono", monospace',
                  }}
                />
                <button
                  onClick={handleActivateKey}
                  disabled={keyStatus === 'loading' || !keyInput.trim()}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    backgroundColor: 'var(--accent)', color: '#000', border: 'none',
                    cursor: keyStatus === 'loading' || !keyInput.trim() ? 'default' : 'pointer',
                    opacity: keyStatus === 'loading' || !keyInput.trim() ? 0.6 : 1,
                    flexShrink: 0,
                  }}
                >
                  {keyStatus === 'loading' ? '…' : 'Activate'}
                </button>
              </div>
              {keyError && (
                <p className="text-xs mt-2" style={{ color: '#ff7b72' }}>{keyError}</p>
              )}
              <button
                onClick={() => setShowUpgrade(true)}
                className="text-xs mt-3 block"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 0 }}
              >
                Don't have a key? Unlock Pro →
              </button>
            </div>
          )}
        </div>

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
            {PRESETS.map((color) => {
              const locked = !isPro && color !== DEFAULT_COLOR
              return (
                <button
                  key={color}
                  onClick={() => locked ? setShowUpgrade(true) : setAccentColor(color)}
                  aria-label={color}
                  style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    backgroundColor: color, border: 'none', cursor: 'pointer',
                    outline: accentColor === color ? `3px solid ${color}` : '3px solid transparent',
                    outlineOffset: '2px', flexShrink: 0,
                    position: 'relative', opacity: locked ? 0.4 : 1,
                  }}
                >
                  {locked && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                      style={{ position: 'absolute', bottom: -1, right: -1, background: 'var(--bg)', borderRadius: '50%', padding: 1 }}>
                      <rect x="1.5" y="4" width="7" height="5" rx="1" fill="currentColor" />
                      <path d="M3 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              )
            })}
            {/* Custom colour picker */}
            {isPro ? (
              <label style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
                />
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'conic-gradient(hsl(0,100%,60%),hsl(45,100%,60%),hsl(90,100%,60%),hsl(135,100%,60%),hsl(180,100%,60%),hsl(225,100%,60%),hsl(270,100%,60%),hsl(315,100%,60%),hsl(360,100%,60%))',
                  outline: isCustom ? '3px solid white' : '3px solid transparent',
                  outlineOffset: '2px',
                }} />
              </label>
            ) : (
              <button
                onClick={() => setShowUpgrade(true)}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%', border: 'none',
                  cursor: 'pointer', flexShrink: 0, position: 'relative', opacity: 0.4,
                  background: 'conic-gradient(hsl(0,100%,60%),hsl(45,100%,60%),hsl(90,100%,60%),hsl(135,100%,60%),hsl(180,100%,60%),hsl(225,100%,60%),hsl(270,100%,60%),hsl(315,100%,60%),hsl(360,100%,60%))',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                  style={{ position: 'absolute', bottom: -1, right: -1, background: 'var(--bg)', borderRadius: '50%', padding: 1, color: 'white' }}>
                  <rect x="1.5" y="4" width="7" height="5" rx="1" fill="currentColor" />
                  <path d="M3 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          {!isPro && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Unlock Pro to access all colours
            </p>
          )}
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

        <p className="text-xs mt-4 mb-8" style={{ color: 'var(--text-secondary)' }}>
          {isPro ? `${activeHabits.length} habits` : `${activeHabits.length}/${FREE_HABIT_LIMIT} habits — upgrade for unlimited`}
        </p>

        {/* Backup & Restore */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          BACKUP & RESTORE
        </p>
        <div
          className="rounded-xl px-4 py-4 mb-2"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Your data</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            {lastBackedUp
              ? `Last backup: ${daysSinceBackup(lastBackedUp) === 0 ? 'today' : `${daysSinceBackup(lastBackedUp)} days ago`}`
              : 'No backup yet — save one to protect your data'}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Create backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                cursor: importing ? 'default' : 'pointer',
                opacity: importing ? 0.6 : 1,
              }}
            >
              {importing ? 'Restoring…' : 'Restore backup'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </div>

          {importError && (
            <p className="text-xs mt-3" style={{ color: '#ff7b72' }}>{importError}</p>
          )}
        </div>

        <p className="text-xs pb-8" style={{ color: 'var(--text-secondary)' }}>
          Save the file to iCloud Drive or Google Drive. Restoring will replace all current data.
        </p>
      </div>

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onUpgrade={() => setShowUpgrade(false)}
        />
      )}
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
