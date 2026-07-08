import { Keyboard } from 'lucide-react'

interface HotkeySettingsProps {
  startKey: string
  stopKey: string
  listeningFor: 'start' | 'stop' | null
  onStartListening: () => void
  onStopListening: () => void
}

export function HotkeySettings({
  startKey, stopKey, listeningFor, onStartListening, onStopListening
}: HotkeySettingsProps) {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Keyboard size={11} style={{ color: 'var(--text-muted)' }} />
        <span className="card-label" style={{ marginBottom: 0 }}>Клавиши</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onStartListening}
          className={`hotkey-pill ${listeningFor === 'start' ? 'listening' : ''}`}
        >
          {listeningFor === 'start' ? '...' : startKey}
        </button>
        <button
          onClick={onStopListening}
          className={`hotkey-pill ${listeningFor === 'stop' ? 'listening' : ''}`}
        >
          {listeningFor === 'stop' ? '...' : stopKey}
        </button>
      </div>
    </div>
  )
}
