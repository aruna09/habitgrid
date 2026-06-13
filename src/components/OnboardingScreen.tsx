interface Props {
  onDone: () => void
  accentColor: string
}

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="1" y="5" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.25" />
        <rect x="6" y="5" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.5" />
        <rect x="11" y="5" width="3" height="3" rx="0.8" fill="currentColor" />
        <rect x="16" y="5" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.7" />
        <rect x="1" y="10" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.7" />
        <rect x="6" y="10" width="3" height="3" rx="0.8" fill="currentColor" />
        <rect x="11" y="10" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.25" />
        <rect x="16" y="10" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.5" />
        <rect x="1" y="15" width="3" height="3" rx="0.8" fill="currentColor" />
        <rect x="6" y="15" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.5" />
        <rect x="11" y="15" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.7" />
        <rect x="16" y="15" width="3" height="3" rx="0.8" fill="currentColor" />
      </svg>
    ),
    headline: 'A grid that fills as you show up',
    body: 'Each habit gets its own contribution grid — like GitHub but for your daily life. The more you do, the fuller it gets.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M4.5 6L6.5 8L9.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="13" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="13" y1="11" x2="20" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <line x1="2" y1="16" x2="20" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      </svg>
    ),
    headline: 'Check in every day',
    body: 'Tap the checkbox next to a habit name to log today. The cell fills instantly. Forgot last night? Tap yesterday\'s cell in the grid.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
        <path d="M7 2v4M15 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <rect x="6" y="13" width="4" height="3" rx="0.8" fill="currentColor" opacity="0.7" />
        <rect x="12" y="13" width="4" height="3" rx="0.8" fill="currentColor" />
      </svg>
    ),
    headline: 'See your streaks & active days',
    body: 'Each habit shows your current streak and max streak at a glance. Switch to past years to see how far you\'ve come.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3v10M8 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 14v4a1 1 0 001 1h12a1 1 0 001-1v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    headline: 'Share your progress',
    body: 'Export any habit grid — or all of them combined — as a clean image to share with friends.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="6" y="10" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M8.5 10V7a3.5 3.5 0 017 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <circle cx="11" cy="15" r="1.5" fill="currentColor" />
      </svg>
    ),
    headline: 'Free to start, Pro to go further',
    body: 'Track up to 3 habits for free, forever. Upgrade once for unlimited habits, custom colours, and the combined grid view.',
  },
]

export default function OnboardingScreen({ onDone, accentColor }: Props) {
  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        {/* Mini grid logo */}
        <div
          className="mb-5"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 10px)',
            gridTemplateRows: 'repeat(4, 10px)',
            gap: '3px',
          }}
        >
          {[0.15, 0.4, 1, 0.6, 0.25, 0.6, 1, 0.4, 1, 0.7, 1, 0.6, 0.25, 0.8, 1, 0.3, 1, 0.6, 1, 0.4].map((op, i) => (
            <div
              key={i}
              style={{
                width: 10, height: 10,
                borderRadius: 2,
                backgroundColor: accentColor,
                opacity: op,
              }}
            />
          ))}
        </div>
        <h1
          className="text-2xl font-semibold tracking-tight mb-2"
          style={{ color: 'var(--text-primary)', fontFamily: '"DM Mono", monospace' }}
        >
          HabitGrid
        </h1>
        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)', maxWidth: 260 }}>
          Build habits you can see. One tap a day, one cell at a time.
        </p>
      </div>

      {/* Feature list */}
      <div className="flex-1 px-5 pb-4 flex flex-col gap-3">
        {FEATURES.map(({ icon, headline, body }, i) => (
          <div
            key={i}
            className="flex gap-4 px-4 py-4 rounded-xl"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-lg"
              style={{
                width: 40, height: 40,
                backgroundColor: 'var(--bg)',
                color: accentColor,
              }}
            >
              {icon}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {headline}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-5 pb-10 pt-3">
        <button
          onClick={onDone}
          className="w-full py-4 rounded-xl text-base font-semibold"
          style={{
            backgroundColor: accentColor,
            color: '#000',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Get started
        </button>
      </div>
    </div>
  )
}
