import { Settings } from 'lucide-react'

interface HeaderProps {
  onMaximize: () => void
  onOpenSettings: () => void
}

export function Header({ onMaximize, onOpenSettings }: HeaderProps) {
  return (
    <div
      className="titlebar"
      onDoubleClick={onMaximize}
      style={{
        height: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        paddingRight: 138,
        WebkitAppRegion: 'drag' as any,
        flexShrink: 0
      }}
    >
      <span className="titlebar-title" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        AUTO SENDER
      </span>
      <button
        className="titlebar-button"
        onClick={onOpenSettings}
        title="Настройки"
        style={{ WebkitAppRegion: 'no-drag' as any, width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', color: 'var(--text-secondary)', transition: 'all 0.15s ease' }}
      >
        <Settings size={15} />
      </button>
    </div>
  )
}
