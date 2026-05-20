import { useState, useEffect, useRef } from 'react'
import { useStore, getHabitStats, formatDate } from './store'
import HabitGrid from './components/HabitGrid'
import Settings from './components/Settings'
import Profile from './components/Profile'
import AddHabitModal from './components/AddHabitModal'
import SplashScreen from './components/SplashScreen'
import ConsolidatedView from './components/ConsolidatedView'

type Screen = 'grid' | 'settings' | 'profile' | 'consolidated'
type Period = 'current' | number

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="3" y1="6" x2="19" y2="6" />
      <line x1="3" y1="11" x2="19" y2="11" />
      <line x1="3" y1="16" x2="19" y2="16" />
    </svg>
  )
}

function HabitCard({
  habitId,
  name,
  period,
  accentColor,
}: {
  habitId: string
  name: string
  period: Period
  accentColor: string
}) {
  const { logs, toggleLog } = useStore()
  const { activeDays, currentStreak, maxStreak } = getHabitStats(logs, habitId, period)
  const today = formatDate(new Date())
  const checked = !!logs[today]?.[habitId]

  return (
    <div
      className="rounded-xl px-4 pt-4 pb-3"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {period === 'current' && (
            <button
              onClick={() => toggleLog(today, habitId)}
              aria-label={`Toggle ${name} for today`}
              style={{
                flexShrink: 0,
                width: '22px',
                height: '22px',
                borderRadius: '5px',
                backgroundColor: checked ? 'var(--accent)' : 'transparent',
                border: checked ? '2px solid var(--accent)' : '2px solid var(--border-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.1s, border-color 0.1s',
              }}
            >
              {checked && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L4.5 8.5L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )}
          <span
            className="text-sm font-semibold truncate"
            style={{ color: checked ? 'var(--accent)' : 'var(--text-primary)' }}
          >
            {name}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Active days</p>
            <p className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{activeDays}</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Cur streak</p>
            <p className="text-sm font-semibold font-mono" style={{ color: 'var(--accent)' }}>{currentStreak}</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Max streak</p>
            <p className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{maxStreak}</p>
          </div>
        </div>
      </div>

      <HabitGrid habitId={habitId} period={period} accentColor={accentColor} />
    </div>
  )
}

export default function App() {
  const { habits, accentColor, userName } = useStore()
  const [screen, setScreen] = useState<Screen>('grid')
  const [period, setPeriod] = useState<Period>('current')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)

  const activeHabits = habits.filter((h) => h.active)
  const currentYear = new Date().getFullYear()
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3]

  // Sync accent color to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor)
    document.documentElement.style.setProperty('--accent-bright', accentColor)
  }, [accentColor])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} accentColor={accentColor} />
  }

  if (screen === 'settings') {
    return (
      <>
        <Settings onBack={() => setScreen('grid')} />
        <FAB onPress={() => setShowAddModal(true)} />
        {showAddModal && (
          <AddHabitModal
            onClose={() => setShowAddModal(false)}
            onAdded={() => { setShowAddModal(false); setScreen('grid') }}
          />
        )}
      </>
    )
  }

  if (screen === 'profile') {
    return <Profile onBack={() => setScreen('grid')} />
  }

  if (screen === 'consolidated') {
    return <ConsolidatedView period={period} onBack={() => setScreen('grid')} />
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-safe-top py-4">
        <h1
          className="text-xl font-semibold tracking-tight"
          style={{ color: 'var(--text-primary)', fontFamily: '"DM Mono", monospace' }}
        >
          {userName ? `Hola ${userName}` : 'HabitGrid'}
        </h1>
        <div className="flex items-center gap-3">
          {activeHabits.length > 0 && (
            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value === 'current' ? 'current' : Number(e.target.value))
              }
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-muted)',
                color: 'var(--text-primary)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                fontFamily: '"DM Mono", monospace',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="current">Current</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}

          {/* Hamburger + dropdown */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }}
              aria-label="Menu"
            >
              <HamburgerIcon />
            </button>
            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 6px)',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  minWidth: '140px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                {[
                  { label: 'Profile', s: 'profile' as Screen },
                  { label: 'Settings', s: 'settings' as Screen },
                ].map(({ label, s }) => (
                  <button
                    key={s}
                    onClick={() => { setScreen(s); setMenuOpen(false) }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '11px 16px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {activeHabits.length > 0 ? (
        <div className="flex flex-col gap-5 px-4 pb-24">
          {activeHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habitId={habit.id}
              name={habit.name}
              period={period}
              accentColor={accentColor}
            />
          ))}
          {activeHabits.length >= 2 && (
            <button
              onClick={() => setScreen('consolidated')}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
                <rect x="6" y="1" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.7" />
                <rect x="11" y="1" width="3" height="3" rx="0.5" fill="currentColor" />
                <rect x="1" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.7" />
                <rect x="6" y="6" width="3" height="3" rx="0.5" fill="currentColor" />
                <rect x="11" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
                <rect x="1" y="11" width="3" height="3" rx="0.5" fill="currentColor" />
                <rect x="6" y="11" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
                <rect x="11" y="11" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.7" />
              </svg>
              View combined grid
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="3" width="5" height="5" rx="1" fill="#1a2318" />
              <rect x="11" y="3" width="5" height="5" rx="1" fill="#1a2318" />
              <rect x="19" y="3" width="5" height="5" rx="1" fill="#1a2318" />
              <rect x="3" y="11" width="5" height="5" rx="1" fill="#1a2318" />
              <rect x="11" y="11" width="5" height="5" rx="1" fill="#2ea043" />
              <rect x="19" y="11" width="5" height="5" rx="1" fill="#2ea043" />
              <rect x="3" y="19" width="5" height="5" rx="1" fill="#1a2318" />
              <rect x="11" y="19" width="5" height="5" rx="1" fill="#39d353" />
              <rect x="19" y="19" width="5" height="5" rx="1" fill="#39d353" />
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>No habits yet</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Add habits to start filling your grid. The more you do, the greener it gets.
            </p>
          </div>
        </div>
      )}

      <FAB onPress={() => setShowAddModal(true)} />
      {showAddModal && <AddHabitModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}

function FAB({ onPress }: { onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      aria-label="Add habit"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '20px',
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        zIndex: 40,
        color: '#fff',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="11" y1="4" x2="11" y2="18" />
        <line x1="4" y1="11" x2="18" y2="11" />
      </svg>
    </button>
  )
}
