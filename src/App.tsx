import { useState, useEffect, useRef } from 'react'
import { useStore, getHabitStats, formatDate, FREE_HABIT_LIMIT } from './store'
import HabitGrid from './components/HabitGrid'
import Settings from './components/Settings'
import Profile from './components/Profile'
import AddHabitModal from './components/AddHabitModal'
import SplashScreen from './components/SplashScreen'
import ConsolidatedView from './components/ConsolidatedView'
import UpgradeModal from './components/UpgradeModal'
import OnboardingScreen from './components/OnboardingScreen'
import { Coachmark, type TourStep } from './components/GuidedTour'
import { exportBackup, daysSinceBackup } from './utils/backup'

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
  createdAt,
  period,
  accentColor,
  isFirst,
}: {
  habitId: string
  name: string
  createdAt: string
  period: Period
  accentColor: string
  isFirst?: boolean
}) {
  const { logs, toggleLog } = useStore()
  const { activeDays, currentStreak, maxStreak } = getHabitStats(logs, habitId, period)
  const today = formatDate(new Date())
  const checked = !!logs[today]?.[habitId]

  return (
    <div
      className="rounded-xl px-4 pt-4 pb-3 min-w-0 max-w-full overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Name + checkbox on its own row so long titles never truncate early */}
      <div className="flex items-center gap-2 mb-3 min-w-0">
        {period === 'current' && (
          <button
            onClick={() => toggleLog(today, habitId)}
            aria-label={`Toggle ${name} for today`}
            data-tour={isFirst ? 'log-checkbox' : undefined}
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

      {/* Stats row */}
      <div className="flex items-center gap-6 mb-3">
        <div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Active days</p>
          <p className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{activeDays}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Cur streak</p>
          <p className="text-sm font-semibold font-mono" style={{ color: 'var(--accent)' }}>{currentStreak}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Max streak</p>
          <p className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{maxStreak}</p>
        </div>
      </div>

      <HabitGrid
        habitId={habitId}
        period={period}
        accentColor={accentColor}
        onToggle={(() => {
          if (period !== 'current') return undefined
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = formatDate(yesterday)
          const habitCreatedDate = createdAt.slice(0, 10)
          return habitCreatedDate <= yesterdayStr ? (date: string) => toggleLog(date, habitId) : undefined
        })()}
      />
    </div>
  )
}

export default function App() {
  const { habits, logs, accentColor, userName, isPro, lastBackedUp, setLastBackedUp, hasSeenOnboarding, setHasSeenOnboarding } = useStore()
  const [screen, setScreen] = useState<Screen>('grid')
  const [period, setPeriod] = useState<Period>('current')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [dismissedBackupBanner, setDismissedBackupBanner] = useState(false)
  // Guided tour: 0 = inactive, 1 = create a habit, 2 = log progress
  const [tourStep, setTourStep] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const backupDays = daysSinceBackup(lastBackedUp)
  const showBackupBanner = !dismissedBackupBanner && habits.length > 0 && (lastBackedUp === null || (backupDays !== null && backupDays >= 90))

  const activeHabits = habits.filter((h) => h.active)
  const currentYear = new Date().getFullYear()
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3]

  // Sync accent color to CSS variables — validate hex first to prevent CSS injection
  const safeAccent = /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : '#39d353'
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', safeAccent)
    document.documentElement.style.setProperty('--accent-bright', safeAccent)
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

  // Guided tour. Capture a baseline when each step begins so a *replay* (when
  // habits already exist / today is already logged) doesn't auto-skip the step;
  // auto-advance only on a genuine new action after the step started.
  const todayStr = formatDate(new Date())
  const tourBaseline = useRef<{ habits: number; logged: boolean }>({ habits: 0, logged: false })
  useEffect(() => {
    if (tourStep === 1) {
      tourBaseline.current = { habits: activeHabits.length, logged: false }
    } else if (tourStep === 2) {
      tourBaseline.current = {
        habits: activeHabits.length,
        logged: activeHabits.some((h) => logs[todayStr]?.[h.id]),
      }
    }
  }, [tourStep]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tourStep === 1 && activeHabits.length > tourBaseline.current.habits) setTourStep(2)
  }, [tourStep, activeHabits.length])

  useEffect(() => {
    if (
      tourStep === 2 &&
      !tourBaseline.current.logged &&
      activeHabits.some((h) => logs[todayStr]?.[h.id])
    ) {
      setTourStep(0)
    }
  }, [tourStep, logs, todayStr])

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} accentColor={accentColor} />
  }

  if (!hasSeenOnboarding) {
    return (
      <OnboardingScreen
        onDone={() => { setHasSeenOnboarding(); setTourStep(1) }}
        accentColor={safeAccent}
      />
    )
  }

  if (screen === 'settings') {
    return (
      <>
        <Settings
          onBack={() => setScreen('grid')}
          onReplayTour={() => { setScreen('grid'); setPeriod('current'); setTourStep(1) }}
        />
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

      {/* Backup reminder banner */}
      {showBackupBanner && (
        <div
          className="flex items-center gap-3 px-4 py-3 mx-4 mt-3 rounded-xl text-sm"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: 'var(--accent)' }}>
            <path d="M8 2v7M5 6l3-3 3 3M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ flex: 1, color: 'var(--text-secondary)' }}>
            {lastBackedUp === null ? 'No backup yet — protect your data' : `Last backup ${backupDays} days ago`}
          </span>
          <button
            onClick={() => { exportBackup(); setLastBackedUp(formatDate(new Date())); setDismissedBackupBanner(true) }}
            className="text-xs font-medium px-2 py-1 rounded-md"
            style={{ backgroundColor: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            Back up
          </button>
          <button
            onClick={() => setDismissedBackupBanner(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {activeHabits.length > 0 ? (
        <div className="flex flex-col gap-5 px-4 pb-24 min-w-0">
          {activeHabits.map((habit, i) => (
            <HabitCard
              key={habit.id}
              habitId={habit.id}
              name={habit.name}
              createdAt={habit.createdAt}
              period={period}
              accentColor={accentColor}
              isFirst={i === 0}
            />
          ))}
          {activeHabits.length >= 2 && (
            <button
              onClick={() => isPro ? setScreen('consolidated') : setShowUpgrade(true)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: isPro ? 'var(--text-secondary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                opacity: isPro ? 1 : 0.6,
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
              {!isPro && (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ marginLeft: 2 }}>
                  <rect x="2.5" y="5.5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M4.5 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )}
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
              Your grid is looking a little empty. Add a habit and give it something to brag about.
            </p>
          </div>
        </div>
      )}

      <FAB onPress={() => {
        if (!isPro && activeHabits.length >= FREE_HABIT_LIMIT) {
          setShowUpgrade(true)
        } else {
          setShowAddModal(true)
        }
      }} />
      {showAddModal && <AddHabitModal onClose={() => setShowAddModal(false)} />}
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onUpgrade={() => setShowUpgrade(false)}
        />
      )}

      {tourStep > 0 && !showAddModal && !showUpgrade && !menuOpen && (
        <Coachmark
          step={tourStep === 1 ? TOUR_STEP_CREATE : TOUR_STEP_LOG}
          onSkip={() => setTourStep(0)}
          onNext={
            tourStep === 1
              ? (activeHabits.length > 0 ? () => setTourStep(2) : undefined)
              : () => setTourStep(0)
          }
          nextLabel={tourStep === 2 ? 'Done' : 'Next'}
        />
      )}
    </div>
  )
}

const TOUR_STEP_CREATE: TourStep = {
  selector: '[data-tour="add-fab"]',
  title: 'Create your first habit',
  body: 'Tap the + button and name something you want to do every day.',
  index: 1,
  total: 2,
}

const TOUR_STEP_LOG: TourStep = {
  selector: '[data-tour="log-checkbox"]',
  title: 'Log today',
  body: 'Tap the box to mark it done — watch the square light up.',
  index: 2,
  total: 2,
}

function FAB({ onPress }: { onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      aria-label="Add habit"
      data-tour="add-fab"
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
