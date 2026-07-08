import { useState, useEffect } from 'react'
import { Minus, X, Square, Settings as SettingsIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useElectron } from '../hooks/useElectron'
import type { AppStatus } from '@/types'

interface HeaderProps {
  onOpenSettings: () => void
  status: AppStatus
  statusText: string
}

export function Header({ onOpenSettings, status, statusText }: HeaderProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, isMaximized, onMessage } = useElectron()
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    isMaximized().then(setMaximized)
    const unsub = onMessage('window-maximized-changed', (v: boolean) => setMaximized(v))
    return unsub as () => void
  }, [])

  const isRunning = status === 'running'

  return (
    <div className="titlebar" onDoubleClick={maximizeWindow}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <span className="titlebar-title">1000-7</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <motion.div
            className={`glow-dot ${isRunning ? '' : 'inactive'}`}
            animate={isRunning ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={isRunning ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
          />
          {isRunning && (
            <motion.div
              style={{
                position: 'absolute', width: 6, height: 6, borderRadius: '50%',
                background: 'var(--accent)'
              }}
              animate={{ scale: [1, 3], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          <AnimatePresence mode="wait">
            <motion.span
              key={statusText}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}
            >
              {statusText}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="titlebar-right">
        <button className="win-btn" onClick={onOpenSettings} title="Настройки">
          <SettingsIcon size={13} />
        </button>
        <button className="win-btn" onClick={minimizeWindow} title="Свернуть">
          <Minus size={12} />
        </button>
        <button className="win-btn" onClick={maximizeWindow} title={maximized ? 'Восстановить' : 'Развернуть'}>
          <Square size={10} />
        </button>
        <button className="win-btn win-btn-close" onClick={closeWindow} title="Закрыть">
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
