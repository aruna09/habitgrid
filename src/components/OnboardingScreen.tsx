import type { ReactNode } from 'react'

interface Props {
  onDone: () => void
  accentColor: string
}

export default function OnboardingScreen({ onDone, accentColor }: Props) {
  return (
    <div
      className="flex flex-col min-h-dvh px-5"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Logo + tagline */}
      <div className="flex flex-col items-center pt-14 pb-8">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 11px)',
            gridTemplateRows: 'repeat(4, 11px)',
            gap: '3px',
            marginBottom: '20px',
          }}
        >
          {[0.1,0.3,1,0.5,0.2,0.7,0.4, 0.5,1,0.4,1,0.6,0.3,1, 1,0.5,0.2,0.7,1,0.5,0.3, 0.3,1,0.6,0.4,0.8,1,0.6].map((op, i) => (
            <div key={i} style={{ width:11, height:11, borderRadius:2, backgroundColor: accentColor, opacity: op }} />
          ))}
        </div>
        <h1
          className="text-2xl font-semibold tracking-tight mb-2"
          style={{ color: 'var(--text-primary)', fontFamily: '"DM Mono", monospace' }}
        >
          HabitGrid
        </h1>
        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          GitHub-style grids for your daily habits
        </p>
      </div>

      {/* Feature grid — 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>

        {/* 1 */}
        <FeatureCard accentColor={accentColor}
          icon={
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="6" width="4" height="4" rx="1" fill="currentColor" opacity="0.2"/>
              <rect x="8" y="6" width="4" height="4" rx="1" fill="currentColor" opacity="0.5"/>
              <rect x="14" y="6" width="4" height="4" rx="1" fill="currentColor"/>
              <rect x="20" y="6" width="4" height="4" rx="1" fill="currentColor" opacity="0.7"/>
              <rect x="2" y="12" width="4" height="4" rx="1" fill="currentColor" opacity="0.7"/>
              <rect x="8" y="12" width="4" height="4" rx="1" fill="currentColor"/>
              <rect x="14" y="12" width="4" height="4" rx="1" fill="currentColor" opacity="0.3"/>
              <rect x="20" y="12" width="4" height="4" rx="1" fill="currentColor"/>
              <rect x="2" y="18" width="4" height="4" rx="1" fill="currentColor"/>
              <rect x="8" y="18" width="4" height="4" rx="1" fill="currentColor" opacity="0.5"/>
              <rect x="14" y="18" width="4" height="4" rx="1" fill="currentColor" opacity="0.7"/>
              <rect x="20" y="18" width="4" height="4" rx="1" fill="currentColor" opacity="0.4"/>
            </svg>
          }
          label="Grid fills as you show up"
        />

        {/* 2 */}
        <FeatureCard accentColor={accentColor}
          icon={
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="4" y="4" width="10" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              <path d="M6.5 9L9 11.5L13 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="18" y1="8" x2="24" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
              <line x1="18" y1="14" x2="24" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.3"/>
              <line x1="4" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.2"/>
            </svg>
          }
          label="One tap to log today"
        />

        {/* 3 */}
        <FeatureCard accentColor={accentColor}
          icon={
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 4v12M10 8l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 18v4a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0023 22v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
            </svg>
          }
          label="Share as a PNG"
        />

        {/* 4 */}
        <FeatureCard accentColor={accentColor}
          icon={
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 14l-.01 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M14 4C8.477 4 4 8.477 4 14s4.477 10 10 10 10-4.477 10-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.4"/>
              <path d="M14 4c2 0 6 4.5 6 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="14" y1="9" x2="14" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="14" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          }
          label="Track streaks & active days"
        />

        {/* 5 — spans full width */}
        <div
          className="col-span-2 flex items-center gap-4 px-4 py-4 rounded-xl"
          style={{ backgroundColor: 'var(--surface)', border: `1px solid ${accentColor}33` }}
        >
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-xl"
            style={{ width: 48, height: 48, backgroundColor: 'var(--bg)', color: accentColor }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="8" y="13" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              <path d="M11 13V9.5a3 3 0 016 0V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
              <circle cx="14" cy="19" r="2" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
              3 habits free · Pro unlocks more
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Unlimited habits, custom colours, combined grid — one-time $4.99
            </p>
          </div>
        </div>

      </div>

      {/* CTA */}
      <div className="py-6">
        <button
          onClick={onDone}
          className="w-full py-4 rounded-xl text-base font-semibold"
          style={{ backgroundColor: accentColor, color: '#000', border: 'none', cursor: 'pointer' }}
        >
          Get started
        </button>
      </div>
    </div>
  )
}

function FeatureCard({ icon, label, accentColor }: { icon: ReactNode; label: string; accentColor: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 px-3 py-5 rounded-xl text-center"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div style={{ color: accentColor }}>{icon}</div>
      <p className="text-xs font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
        {label}
      </p>
    </div>
  )
}
