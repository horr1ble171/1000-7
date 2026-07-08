import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Sparkles, Monitor, RotateCcw, ArrowLeft, Keyboard, Power, MonitorCheck } from 'lucide-react'
import { useElectron } from '../hooks/useElectron'

interface HotkeyData {
  start: string
  stop: string
}

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const electron = useElectron()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [syncThemeWithOS, setSyncThemeWithOS] = useState(true)
  const [animations, setAnimations] = useState(true)
  const [uiScale, setUiScale] = useState(100)
  const [autoStart, setAutoStart] = useState(false)
  const [minimizeToTray, setMinimizeToTray] = useState(true)
  const [hotkeys, setHotkeys] = useState<HotkeyData>({ start: 'F1', stop: 'F2' })
  const [listening, setListening] = useState<'start' | 'stop' | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    loadSettings()
  }, [isOpen])

  async function loadSettings() {
    const settings = await electron.getSettings()
    if (settings) {
      setTheme(settings.theme)
      setSyncThemeWithOS(settings.syncThemeWithOS)
      setAnimations(settings.animations)
      setUiScale(settings.uiScale)
      setAutoStart(settings.autoStart)
      setMinimizeToTray(settings.minimizeToTray)
    }
    const keys = await electron.getHotkeys()
    if (keys) setHotkeys(keys)
  }

  function handleThemeChange(newTheme: 'dark' | 'light') {
    setTheme(newTheme)
    setSyncThemeWithOS(false)
    electron.setSetting('theme', newTheme)
    electron.setSetting('syncThemeWithOS', false)
    document.documentElement.classList.toggle('light', newTheme === 'light')
  }

  function handleSyncThemeToggle() {
    const next = !syncThemeWithOS
    setSyncThemeWithOS(next)
    electron.setSetting('syncThemeWithOS', next)
    if (next) {
      electron.setSetting('theme', theme)
    }
  }

  function handleAnimationsToggle() {
    const next = !animations
    setAnimations(next)
    electron.setSetting('animations', next)
  }

  function handleScaleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value)
    setUiScale(val)
    electron.setSetting('uiScale', val)
    document.documentElement.style.fontSize = `${val / 100}rem`
  }

  function handleMinimizeToTrayToggle() {
    const next = !minimizeToTray
    setMinimizeToTray(next)
    electron.setSetting('minimizeToTray', next)
  }

  function handleAutoStartToggle() {
    const next = !autoStart
    setAutoStart(next)
    electron.setAutoStart(next)
    electron.setSetting('autoStart', next)
  }

  function handleHotkeyClick(type: 'start' | 'stop') {
    if (listening === type) { setListening(null); return }
    setListening(type)
  }

  useEffect(() => {
    if (!listening) return
    function onKeyDown(e: KeyboardEvent) {
      e.preventDefault()
      e.stopPropagation()
      const key = e.key.toUpperCase()
      if (key === 'ESCAPE') { setListening(null); return }
      if (key.startsWith('F') && key.length <= 3) {
        const updated = { ...hotkeys, [listening]: key }
        setHotkeys(updated)
        electron.saveHotkey(listening, key)
        setListening(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [listening, hotkeys])

  async function handleReset() {
    if (!confirmReset) { setConfirmReset(true); return }
    await electron.resetSettings()
    setConfirmReset(false)
    loadSettings()
    document.documentElement.classList.remove('light')
    document.documentElement.style.fontSize = ''
    window.location.reload()
  }

  const content = (
    <div style={{ fontSize: '14px', height: '100%' }}>
      <div className="settings-panel" style={{ fontSize: 'inherit' }}>
        <div className="flex items-center justify-between p-5 pb-0">
          <button className="theme-btn" onClick={onClose} title="Закрыть">
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Настройки
          </span>
          <div style={{ width: 36 }} />
        </div>

        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 20 }}>
          <div className="settings-section" style={{ paddingTop: 24 }}>
            <div className="settings-label">Тема</div>
            <div className="flex gap-2 mb-3">
              <button
                className={`theme-btn ${!syncThemeWithOS && theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
                title="Тёмная тема"
              >
                <Moon size={16} />
              </button>
              <button
                className={`theme-btn ${!syncThemeWithOS && theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
                title="Светлая тема"
              >
                <Sun size={16} />
              </button>
            </div>
            <div className="settings-row">
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MonitorCheck size={14} />
                Синхронизация с Windows
              </span>
              <div
                className={`toggle-switch ${syncThemeWithOS ? 'active' : ''}`}
                onClick={handleSyncThemeToggle}
              />
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-label">Горячие клавиши</div>
            <div className="settings-row">
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Старт</span>
              <button
                className={`hotkey-pill ${listening === 'start' ? 'listening' : ''}`}
                onClick={() => handleHotkeyClick('start')}
              >
                <Keyboard size={12} />
                {listening === 'start' ? '...' : hotkeys.start}
              </button>
            </div>
            <div className="settings-row">
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Стоп</span>
              <button
                className={`hotkey-pill ${listening === 'stop' ? 'listening' : ''}`}
                onClick={() => handleHotkeyClick('stop')}
              >
                <Keyboard size={12} />
                {listening === 'stop' ? '...' : hotkeys.stop}
              </button>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-label">Анимации</div>
            <div className="settings-row">
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} />
                Анимации интерфейса
              </span>
              <div className={`toggle-switch ${animations ? 'active' : ''}`} onClick={handleAnimationsToggle} />
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-label">Масштаб UI</div>
            <div className="settings-row">
              <Monitor size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input type="range" className="scale-slider" min={80} max={150} step={5} value={uiScale} onChange={handleScaleChange} />
              <span className="scale-value">{uiScale}%</span>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-label">Поведение</div>
            <div className="settings-row">
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Power size={14} />
                Автозапуск при старте Windows
              </span>
              <div className={`toggle-switch ${autoStart ? 'active' : ''}`} onClick={handleAutoStartToggle} />
            </div>
            <div className="settings-row" style={{ marginTop: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Сворачивать в трей при закрытии
              </span>
              <div className={`toggle-switch ${minimizeToTray ? 'active' : ''}`} onClick={handleMinimizeToTrayToggle} />
            </div>
          </div>

          <div className="settings-section" style={{ paddingTop: 8 }}>
            <button className="btn-danger" onClick={handleReset}>
              <RotateCcw size={14} />
              {confirmReset ? 'Подтвердите сброс' : 'Сбросить настройки'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 340 }}
            animate={{ x: 0 }}
            exit={{ x: 340 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none' }}
          >
            <div style={{ pointerEvents: 'auto', height: '100%' }}>
              {content}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
