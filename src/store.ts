import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Habit {
  id: string
  name: string
  notes?: string
  createdAt: string
  active: boolean
}

export type Logs = Record<string, Record<string, boolean>>

export interface StreakInfo {
  current: number
  longest: number
}

export const FREE_HABIT_LIMIT = 3

interface HabitStore {
  habits: Habit[]
  logs: Logs
  streak: StreakInfo
  accentColor: string
  userName: string
  isPro: boolean
  lastBackedUp: string | null
  setIsPro: (value: boolean) => void
  setLastBackedUp: (date: string) => void
  addHabit: (name: string, notes?: string) => void
  deleteHabit: (id: string) => void
  reorderHabits: (habits: Habit[]) => void
  toggleLog: (date: string, habitId: string) => void
  recalculateStreak: () => void
  setAccentColor: (color: string) => void
  setUserName: (name: string) => void
}

export function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function calcStreak(logs: Logs): StreakInfo {
  const today = new Date()
  let current = 0
  let longest = 0
  let running = 0

  const allDates: string[] = []
  const d = new Date(today)
  for (let i = 0; i < 365; i++) {
    allDates.push(formatDate(d))
    d.setDate(d.getDate() - 1)
  }

  for (let i = 0; i < allDates.length; i++) {
    const date = allDates[i]
    const dayLogs = logs[date]
    const done = dayLogs ? Object.values(dayLogs).some(Boolean) : false
    if (done) {
      current++
    } else {
      if (i === 0) continue
      break
    }
  }

  for (let i = allDates.length - 1; i >= 0; i--) {
    const dayLogs = logs[allDates[i]]
    const done = dayLogs ? Object.values(dayLogs).some(Boolean) : false
    if (done) {
      running++
      longest = Math.max(longest, running)
    } else {
      running = 0
    }
  }

  return { current, longest }
}

export const useStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: {},
      streak: { current: 0, longest: 0 },
      accentColor: '#39d353',
      userName: '',
      isPro: false,
      lastBackedUp: null,
      setIsPro: (value) => set({ isPro: value }),
      setLastBackedUp: (date) => set({ lastBackedUp: date }),

      addHabit: (name, notes) => {
        const habit: Habit = {
          id: `h${Date.now()}`,
          name: name.trim(),
          notes,
          createdAt: new Date().toISOString(),
          active: true,
        }
        set((s) => ({ habits: [...s.habits, habit] }))
      },

      deleteHabit: (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }))
      },

      reorderHabits: (habits) => set({ habits }),

      toggleLog: (date, habitId) => {
        set((s) => {
          const dayLogs = s.logs[date] ?? {}
          const updated = { ...dayLogs, [habitId]: !dayLogs[habitId] }
          const hasAny = Object.values(updated).some(Boolean)
          const newLogs = { ...s.logs }
          if (hasAny) {
            newLogs[date] = updated
          } else {
            delete newLogs[date]
          }
          const streak = calcStreak(newLogs)
          return { logs: newLogs, streak }
        })
      },

      recalculateStreak: () => {
        const streak = calcStreak(get().logs)
        set({ streak })
      },

      setAccentColor: (color) => set({ accentColor: color }),
      setUserName: (name) => set({ userName: name.trim() }),
    }),
    { name: 'habitgrid-storage' }
  )
)

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').padEnd(6, '0')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

export function getHabitDayColor(
  logs: Logs,
  habitId: string,
  date: string,
  accentColor = '#39d353'
): string {
  const done = logs[date]?.[habitId]
  if (done) return accentColor
  const [r, g, b] = hexToRgb(accentColor)
  return `rgba(${r}, ${g}, ${b}, 0.12)`
}

export function getConsolidatedDayColor(
  logs: Logs,
  habits: Habit[],
  date: string,
  accentColor: string
): string {
  const active = habits.filter((h) => h.active)
  const total = active.length
  if (total === 0) return 'transparent'
  const done = active.filter((h) => logs[date]?.[h.id]).length
  const [r, g, b] = hexToRgb(accentColor)
  if (done === 0) return `rgba(${r}, ${g}, ${b}, 0.12)`
  if (done === total) return accentColor
  // 3 intermediate levels
  const levels = [0.35, 0.58, 0.78]
  const idx = Math.min(Math.ceil((done / total) * levels.length) - 1, levels.length - 1)
  return `rgba(${r}, ${g}, ${b}, ${levels[idx]})`
}

export function getHabitStats(
  logs: Logs,
  habitId: string,
  period: 'current' | number
): { activeDays: number; currentStreak: number; maxStreak: number } {
  const today = new Date()
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - 365)
  const cutoffStr = formatDate(cutoff)

  const doneDates = new Set(
    Object.entries(logs)
      .filter(([date, dayLogs]) => {
        const inPeriod =
          period === 'current' ? date >= cutoffStr : date.startsWith(String(period))
        return inPeriod && !!dayLogs[habitId]
      })
      .map(([date]) => date)
  )

  let current = 0
  const d = new Date(today)
  for (let i = 0; i < 400; i++) {
    const ds = formatDate(d)
    if (doneDates.has(ds)) {
      current++
    } else if (i > 0) {
      break
    }
    d.setDate(d.getDate() - 1)
  }

  let max = 0, run = 0
  const d2 = new Date(today)
  for (let i = 0; i < 400; i++) {
    const ds = formatDate(d2)
    if (doneDates.has(ds)) { run++; max = Math.max(max, run) } else { run = 0 }
    d2.setDate(d2.getDate() - 1)
  }

  return { activeDays: doneDates.size, currentStreak: current, maxStreak: max }
}
