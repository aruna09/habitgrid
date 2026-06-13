import { useEffect, useState, type CSSProperties } from 'react'

export interface TourStep {
  selector: string
  title: string
  body: string
  index: number
  total: number
}

/**
 * A coachmark that spotlights a live DOM element (matched by `step.selector`)
 * and floats a tooltip beside it. The overlay lets taps pass through so the
 * user can actually perform the highlighted action — the tour advances when
 * they do (driven by the parent).
 */
export function Coachmark({
  step,
  onSkip,
  onNext,
  nextLabel = 'Next',
}: {
  step: TourStep
  onSkip: () => void
  onNext?: () => void
  nextLabel?: string
}) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    let raf = 0
    const measure = () => {
      const el = document.querySelector(step.selector)
      setRect(el ? el.getBoundingClientRect() : null)
    }
    measure()
    const onChange = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    window.addEventListener('resize', onChange)
    window.addEventListener('scroll', onChange, true)
    // Re-measure periodically while layout settles (fonts, banners, modals closing)
    const id = window.setInterval(measure, 350)
    return () => {
      window.removeEventListener('resize', onChange)
      window.removeEventListener('scroll', onChange, true)
      window.clearInterval(id)
      cancelAnimationFrame(raf)
    }
  }, [step.selector])

  if (!rect) return null

  const pad = 8
  const vw = window.innerWidth
  const vh = window.innerHeight
  const tipWidth = Math.min(280, vw - 24)
  const placeAbove = rect.top > vh / 2
  const left = Math.max(12, Math.min(rect.left + rect.width / 2 - tipWidth / 2, vw - tipWidth - 12))

  const tooltipStyle: CSSProperties = placeAbove
    ? { position: 'absolute', bottom: vh - rect.top + 16, left, width: tipWidth }
    : { position: 'absolute', top: rect.bottom + 16, left, width: tipWidth }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, pointerEvents: 'none' }}>
      {/* Spotlight ring around the target */}
      <div
        style={{
          position: 'absolute',
          left: rect.left - pad,
          top: rect.top - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          borderRadius: 14,
          border: '2px solid var(--accent)',
          animation: 'tour-pulse 1.6s ease-in-out infinite',
        }}
      />

      {/* Tooltip */}
      <div
        style={{
          ...tooltipStyle,
          pointerEvents: 'auto',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '14px 16px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 4 }}>
          {step.title}
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.4, color: 'var(--text-secondary)', margin: 0 }}>
          {step.body}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: '"DM Mono", monospace' }}>
            {step.index} of {step.total}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={onSkip}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              Skip tour
            </button>
            {onNext && (
              <button
                onClick={onNext}
                style={{
                  backgroundColor: 'var(--accent)',
                  border: 'none',
                  color: '#000',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '5px 12px',
                  borderRadius: 7,
                }}
              >
                {nextLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
