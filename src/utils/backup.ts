import { formatDate } from '../store'

const STORAGE_KEY = 'habitgrid-storage'
const MAX_BACKUP_BYTES = 5 * 1024 * 1024  // 5 MB — no legitimate backup is larger
const MAX_HABITS = 500
const MAX_LOG_DAYS = 3650                  // 10 years of logs
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/

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
    // Reject oversized files before parsing
    if (file.size > MAX_BACKUP_BYTES) {
      return { ok: false, error: 'Backup file is too large to be a valid HabitGrid backup.' }
    }

    const text = await file.text()
    const parsed = JSON.parse(text)

    // Basic shape validation
    if (!parsed?.state?.habits || !Array.isArray(parsed.state.habits)) {
      return { ok: false, error: "This file doesn't look like a HabitGrid backup." }
    }

    // Limit array sizes to prevent memory DoS
    if (parsed.state.habits.length > MAX_HABITS) {
      return { ok: false, error: 'Backup contains too many habits.' }
    }
    if (parsed.state.logs && Object.keys(parsed.state.logs).length > MAX_LOG_DAYS) {
      return { ok: false, error: 'Backup contains too many log entries.' }
    }

    // Sanitize accentColor — must be a valid hex or fall back to default
    if (parsed.state.accentColor && !HEX_COLOR_RE.test(parsed.state.accentColor)) {
      parsed.state.accentColor = '#39d353'
    }

    // Sanitize userName — strip to plain text, max 50 chars
    if (typeof parsed.state.userName === 'string') {
      parsed.state.userName = parsed.state.userName.replace(/[<>]/g, '').slice(0, 50)
    }

    // Strip payment-related fields — never trust the file for Pro status
    parsed.state.isPro = false
    parsed.state.licenseKey = null

    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    return { ok: true }
  } catch {
    return { ok: false, error: "Could not read the file. Make sure it's a valid backup." }
  }
}

export function daysSinceBackup(lastBackedUp: string | null): number | null {
  if (!lastBackedUp) return null
  const diff = Date.now() - new Date(lastBackedUp).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
