import { useState } from 'react'
import { useStore } from '../store'

interface Props {
  onBack: () => void
}

export default function Profile({ onBack }: Props) {
  const { userName, setUserName } = useStore()
  const [name, setName] = useState(userName)

  function handleSave() {
    setUserName(name)
    onBack()
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: 'var(--bg)' }}>
      <header
        className="flex items-center px-4 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm"
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <h1 className="text-base font-semibold mx-auto" style={{ color: 'var(--text-primary)' }}>
          Profile
        </h1>
        <div style={{ width: '52px' }} />
      </header>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          NAME
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Your name"
          maxLength={40}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mb-6"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-muted)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Save
        </button>
      </div>
    </div>
  )
}
