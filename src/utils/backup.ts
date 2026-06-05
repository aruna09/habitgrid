import { formatDate } from '../store'

const STORAGE_KEY = 'habitgrid-storage'

export function exportBackup(): void {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return
  const blob = new Blob([raw], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `habitgrid-backup-${formatDate(new Date())}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importBackup(file: File): Promise<{ ok: boolean; error?: string }> {
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)

    // Basic shape validation
    if (!parsed?.state?.habits || !Array.isArray(parsed.state.habits)) {
      return { ok: false, error: 'This file doesn\'t look like a HabitGrid backup.' }
    }

    // Strip isPro — never trust the file for payment status
    parsed.state.isPro = false

    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not read the file. Make sure it\'s a valid backup.' }
  }
}

export function daysSinceBackup(lastBackedUp: string | null): number | null {
  if (!lastBackedUp) return null
  const diff = Date.now() - new Date(lastBackedUp).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
