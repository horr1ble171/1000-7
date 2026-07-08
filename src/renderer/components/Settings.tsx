import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun, Moon, MonitorCheck, Sparkles, Monitor, RotateCcw,
  ArrowLeft, Keyboard, Power, Palette, Settings2, Sliders
} from 'lucide-react'
import { useElectron } from '../hooks/useElectron'

interface HotkeyData { start: string; stop: string }
interface SettingsProps { isOpen: boolean; onClose: () => void }

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

  useEffect(() => { if (isOpen) loadSettings() }, [isOpen])

  async function loadSettings() {
    const s = await electron.getSettings()
    if (s) {
      setTheme(s.theme); setSyncThemeWithOS(s.syncThemeWithOS)
      setAnimations(s.animations); setUiScale(s.uiScale)
      setAutoStart(s.autoStart); setMinimizeToTray(s.minimizeToTray)
    }
    const k = await electron.getHotkeys()
    if (k) setHotkeys(k)
  }

  function handleTheme(t: 'dark' | 'light') {
    setTheme(t); setSyncThemeWithOS(false)
    electron.setSetting('theme', t); electron.setSetting('syncThemeWithOS', false)
    document.documentElement.classList.toggle('light', t === 'light')
  }

  function toggleSync() {
    const n = !syncThemeWithOS; setSyncThemeWithOS(n)
    electron.setSetting('syncThemeWithOS', n)
  }

  function toggleAnim() {
    const n = !animations; setAnimations(n); electron.setSetting('animations', n)
  }

  function handleScale(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value); setUiScale(v)
    electron.setSetting('uiScale', v)
    document.documentElement.style.fontSize = `${v / 100}rem`
  }

  function toggleTray() {
    const n = !minimizeToTray; setMinimizeToTray(n); electron.setSetting('minimizeToTray', n)
  }

  function toggleAutoStart() {
    const n = !autoStart; setAutoStart(n); electron.setAutoStart(n); electron.setSetting('autoStart', n)
  }

  function handleHotkeyClick(type: 'start' | 'stop') {
    if (listening === type) { setListening(null); return }
    setListening(type)
  }

  useEffect(() => {
    if (!listening) return
    function onKeyDown(e: KeyboardEvent) {
      e.preventDefault(); e.stopPropagation()
      const key = e.key.toUpperCase()
      if (key === 'ESCAPE') { setListening(null); return }
      if (key.startsWith('F') && key.length <= 3) {
        setHotkeys(h => ({ ...h, [listening]: key }))
        electron.saveHotkey(listening, key); setListening(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [listening])

  async function handleReset() {
    if (!confirmReset) { setConfirmReset(true); return }
    await electron.resetSettings(); setConfirmReset(false)
    loadSettings(); document.documentElement.classList.remove('light')
    document.documentElement.style.fontSize = ''
    window.location.reload()
  }

  const Row = ({ label, icon, children }: any) => (
    <div className="settings-row">
      <span className="settings-label-text">{icon}{label}</span>
      {children}
    </div>
  )

  const content = (
    <div className="settings-panel">
      <div className="settings-header">
        <button className="theme-btn" onClick={onClose}><ArrowLeft size={16} /></button>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Настройки</span>
        <div style={{ width: 34 }} />
      </div>

      <div className="settings-body">
        {/* Внешний вид */}
        <div className="settings-group">
          <div className="settings-group-label"><Palette size={11} style={{ marginRight: 4, verticalAlign: -1 }} />Внешний вид</div>
          <div className={window.innerHeight > 700 ? 'glass-card' : ''} style={window.innerHeight <= 700 ? { padding: '8px 0' } : { padding: 12 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <button className={`theme-btn ${!syncThemeWithOS && theme === 'dark' ? 'active' : ''}`} onClick={() => handleTheme('dark')}><Moon size={14} /></button>
              <button className={`theme-btn ${!syncThemeWithOS && theme === 'light' ? 'active' : ''}`} onClick={() => handleTheme('light')}><Sun size={14} /></button>
            </div>
            <Row label="Синхронизация с Windows" icon={<MonitorCheck size={13} style={{ marginRight: 2 }} />}>
              <div className={`toggle-switch ${syncThemeWithOS ? 'active' : ''}`} onClick={toggleSync} />
            </Row>
          </div>
        </div>

        {/* Горячие клавиши */}
        <div className="settings-group">
          <div className="settings-group-label"><Keyboard size={11} style={{ marginRight: 4, verticalAlign: -1 }} />Горячие клавиши</div>
          <div className="glass-card" style={{ padding: 12 }}>
            <Row label="Старт">
              <button className={`hotkey-pill ${listening === 'start' ? 'listening' : ''}`} style={{ minWidth: 56 }} onClick={() => handleHotkeyClick('start')}>
                {listening === 'start' ? '...' : hotkeys.start}
              </button>
            </Row>
            <Row label="Стоп">
              <button className={`hotkey-pill ${listening === 'stop' ? 'listening' : ''}`} style={{ minWidth: 56 }} onClick={() => handleHotkeyClick('stop')}>
                {listening === 'stop' ? '...' : hotkeys.stop}
              </button>
            </Row>
          </div>
        </div>

        {/* Интерфейс */}
        <div className="settings-group">
          <div className="settings-group-label"><Sliders size={11} style={{ marginRight: 4, verticalAlign: -1 }} />Интерфейс</div>
          <div className="glass-card" style={{ padding: 12 }}>
            <Row label="Анимации" icon={<Sparkles size={13} />}>
              <div className={`toggle-switch ${animations ? 'active' : ''}`} onClick={toggleAnim} />
            </Row>
            <Row label="Масштаб UI" icon={<Monitor size={13} />}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 160 }}>
                <input type="range" className="scale-slider" min={80} max={150} step={5} value={uiScale} onChange={handleScale} />
                <span className="scale-value">{uiScale}%</span>
              </div>
            </Row>
          </div>
        </div>

        {/* Поведение */}
        <div className="settings-group">
          <div className="settings-group-label"><Settings2 size={11} style={{ marginRight: 4, verticalAlign: -1 }} />Поведение</div>
          <div className="glass-card" style={{ padding: 12 }}>
            <Row label="Автозапуск при старте Windows" icon={<Power size={13} />}>
              <div className={`toggle-switch ${autoStart ? 'active' : ''}`} onClick={toggleAutoStart} />
            </Row>
            <Row label="Сворачивать в трей при закрытии">
              <div className={`toggle-switch ${minimizeToTray ? 'active' : ''}`} onClick={toggleTray} />
            </Row>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button className="btn-danger" onClick={handleReset} style={{ padding: '8px 14px' }}>
          <RotateCcw size={12} />
          {confirmReset ? 'Подтвердите сброс' : 'Сбросить настройки'}
        </button>
      </div>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="settings-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} />
          <motion.div initial={{ x: 340 }} animate={{ x: 0 }} exit={{ x: 340 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'auto', height: '100%' }}>{content}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
