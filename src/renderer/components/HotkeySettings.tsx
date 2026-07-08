import { Keyboard } from 'lucide-react'

interface HotkeySettingsProps {
  startKey: string
  stopKey: string
  listeningFor: 'start' | 'stop' | null
  onStartListening: () => void
  onStopListening: () => void
}

export function HotkeySettings({
  startKey,
  stopKey,
  listeningFor,
  onStartListening,
  onStopListening
}: HotkeySettingsProps) {
  return (
    <div className="glass-card">
      <div className="flex items-center gap-2 mb-3">
        <Keyboard size={12} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Горячие клавиши
        </span>
      </div>
      <div className="flex items-center justify-center gap-5">
        <div className="flex flex-col items-center gap-1.5">
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Старт
          </span>
          <button
            onClick={onStartListening}
            className={`hotkey-pill ${listeningFor === 'start' ? 'listening' : ''}`}
          >
            {listeningFor === 'start' ? '···' : startKey}
          </button>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Стоп
          </span>
          <button
            onClick={onStopListening}
            className={`hotkey-pill ${listeningFor === 'stop' ? 'listening' : ''}`}
          >
            {listeningFor === 'stop' ? '···' : stopKey}
          </button>
        </div>
      </div>
    </div>
  )
}
