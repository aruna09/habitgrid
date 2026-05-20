import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

interface Props {
  open: boolean
  date: string
  readOnly?: boolean
  onClose: () => void
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function CheckInSheet({ open, date, readOnly = false, onClose }: Props) {
  const { habits, logs, toggleLog } = useStore()
  const activeHabits = habits.filter((h) => h.active)
  const dayLogs = logs[date] ?? {}

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl"
            style={{ backgroundColor: '#161B22', maxHeight: '80dvh' }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose()
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#30363D' }} />
            </div>

            <div className="px-5 pb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono" style={{ color: '#8B949E' }}>
                  {formatDisplayDate(date)}
                </p>
                {readOnly && (
                  <p className="text-xs mt-0.5" style={{ color: '#8B949E' }}>
                    Read only
                  </p>
                )}
              </div>
            </div>

            <div
              className="overflow-y-auto px-5 pb-8"
              style={{ maxHeight: 'calc(80dvh - 80px)' }}
            >
              {activeHabits.length === 0 ? (
                <p className="text-center py-8" style={{ color: '#8B949E' }}>
                  No habits yet. Add some in Settings.
                </p>
              ) : (
                <div className="flex flex-col divide-y" style={{ borderColor: '#21262D' }}>
                  {activeHabits.map((habit) => {
                    const checked = !!dayLogs[habit.id]
                    return (
                      <button
                        key={habit.id}
                        disabled={readOnly}
                        onClick={() => !readOnly && toggleLog(date, habit.id)}
                        className="flex items-center justify-between py-4 w-full text-left"
                        style={{ background: 'none', border: 'none', padding: '16px 0', cursor: readOnly ? 'default' : 'pointer' }}
                      >
                        <span className="text-base font-medium" style={{ color: '#E6EDF3' }}>
                          {habit.name}
                        </span>
                        <div
                          className="flex-shrink-0 ml-4 rounded-md flex items-center justify-center transition-colors"
                          style={{
                            width: '28px',
                            height: '28px',
                            backgroundColor: checked ? '#238636' : 'transparent',
                            border: checked ? '2px solid #238636' : '2px solid #30363D',
                          }}
                        >
                          {checked && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
