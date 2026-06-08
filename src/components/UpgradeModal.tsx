interface Props {
  onClose: () => void
  onUpgrade: () => void
}

const FEATURES = [
  { label: 'Unlimited habits', free: 'Up to 3', pro: 'Unlimited' },
  { label: 'Colour themes', free: 'Default green', pro: 'Full palette + custom' },
  { label: 'Combined grid', free: false, pro: true },
]

export default function UpgradeModal({ onClose, onUpgrade }: Props) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          width: '100%',
          maxWidth: '480px',
          padding: '28px 24px 40px',
          border: '1px solid var(--border)',
        }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--border)', margin: '0 auto 24px' }} />

        {/* Title */}
        <div className="text-center mb-6">
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--accent)', letterSpacing: '0.1em' }}>HABITGRID PRO</p>
          <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Unlock the full grid</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>One-time purchase. Yours forever.</p>
        </div>

        {/* Feature comparison */}
        <div
          className="rounded-xl mb-6 overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {/* Header row */}
          <div
            className="grid grid-cols-3 px-4 py-2 text-xs font-medium"
            style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}
          >
            <span>FEATURE</span>
            <span className="text-center">FREE</span>
            <span className="text-center" style={{ color: 'var(--accent)' }}>PRO</span>
          </div>

          {FEATURES.map(({ label, free, pro }, i) => (
            <div
              key={label}
              className="grid grid-cols-3 items-center px-4 py-3 text-sm"
              style={{
                borderTop: '1px solid var(--border)',
                backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
              }}
            >
              <span style={{ color: 'var(--text-primary)' }}>{label}</span>
              <span className="text-center" style={{ color: 'var(--text-secondary)' }}>
                {free === false ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                    <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : free}
              </span>
              <span className="text-center" style={{ color: 'var(--accent)' }}>
                {pro === true ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                    <path d="M2 7L5.5 10.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : pro}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            const url = import.meta.env.VITE_DODO_CHECKOUT_URL
            if (url) window.open(url, '_blank')
            onUpgrade()
          }}
          className="w-full py-4 rounded-xl text-base font-semibold"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.01em',
          }}
        >
          Unlock Pro — $4.99
        </button>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
          After payment, save your order ID from the receipt — you'll need it to restore Pro on a new device.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 mt-2 text-sm"
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
