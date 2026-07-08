import { useState, useEffect } from 'react'
import { Minus, X, Square } from 'lucide-react'
import { Settings } from 'lucide-react'
import { useElectron } from '../hooks/useElectron'

interface HeaderProps {
  onOpenSettings: () => void
}

export function Header({ onOpenSettings }: HeaderProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, isMaximized, onMessage } = useElectron()
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    isMaximized().then(setMaximized)
    const unsub = onMessage('window-maximized-changed', (v: boolean) => setMaximized(v))
    return unsub as () => void
  }, [])

  return (
    <div
      style={{
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        WebkitAppRegion: 'drag' as any,
        flexShrink: 0,
        gap: 8
      }}
      onDoubleClick={maximizeWindow}
    >
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        AUTO SENDER
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          className="win-btn"
          onClick={onOpenSettings}
          title="Настройки"
        >
          <Settings size={13} />
        </button>

        <button
          className="win-btn"
          onClick={minimizeWindow}
          title="Свернуть"
        >
          <Minus size={13} />
        </button>

        <button
          className="win-btn"
          onClick={maximizeWindow}
          title={maximized ? 'Восстановить' : 'Развернуть'}
        >
          {maximized ? <Square size={11} /> : <Square size={11} />}
        </button>

        <button
          className="win-btn win-btn-close"
          onClick={closeWindow}
          title="Закрыть"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
