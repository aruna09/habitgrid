import { useStore, formatDate } from '../store'

export default function TodayCheckIn() {
  const { habits, logs, toggleLog } = useStore()
  const today = formatDate(new Date())
  const activeHabits = habits.filter((h) => h.active)
  const dayLogs = logs[today] ?? {}

  return (
    <div className="px-4 pb-4">
      <p className="text-xs font-mono mb-3" style={{ color: '#8B949E', letterSpacing: '0.05em' }}>
        TODAY
      </p>
      <div className="flex flex-col gap-2">
        {activeHabits.map((habit) => {
          const checked = !!dayLogs[habit.id]
          return (
            <button
              key={habit.id}
              onClick={() => toggleLog(today, habit.id)}
              className="flex items-center justify-between px-4 py-3 rounded-xl w-full text-left transition-colors"
              style={{
                backgroundColor: checked ? 'rgba(35,134,54,0.15)' : '#161B22',
                border: `1px solid ${checked ? '#238636' : '#21262D'}`,
                cursor: 'pointer',
              }}
            >
              <span className="text-sm font-medium" style={{ color: checked ? '#3FB950' : '#E6EDF3' }}>
                {habit.name}
              </span>
              <div
                className="flex-shrink-0 rounded-md flex items-center justify-center"
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: checked ? '#238636' : 'transparent',
                  border: checked ? '2px solid #238636' : '2px solid #30363D',
                  transition: 'background-color 0.1s, border-color 0.1s',
                }}
              >
                {checked && (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5L5 9.5L11 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
