'use client'

import { useState, useEffect } from 'react'
import { Gamepad2 } from 'lucide-react'
import { useElectron } from '@/hooks/useElectron'
import { useHotkeys } from '@/hooks/useHotkeys'
import { Header } from '@/components/Header'
import { NumberDisplay } from '@/components/NumberDisplay'
import { Counter } from '@/components/Counter'
import { HotkeySettings } from '@/components/HotkeySettings'
import { SpeedControl } from '@/components/SpeedControl'
import { Controls } from '@/components/Controls'
import { Settings as SettingsPanel } from '@/components/Settings'
import type { AppStatus } from '@/types'
import { TOTAL_COUNT } from '@shared/constants'

export default function App() {
  const {
    getHotkeys, saveHotkey, getSettings, getDuration, setDuration,
    getDotaMode, setDotaMode, getDotaDelays, setDotaDelays,
    startSending, stopSending, onMessage
  } = useElectron()

  const [status, setStatus] = useState<AppStatus>('idle')
  const [statusText, setStatusText] = useState('ОЖИДАНИЕ')
  const [currentNumber, setCurrentNumber] = useState('1000-7')
  const [current, setCurrent] = useState(0)
  const [total, setTotal] = useState(TOTAL_COUNT)
  const [totalSec, setTotalSec] = useState(25)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [online, setOnline] = useState(true)
  const [uiScale, setUiScale] = useState(100)
  const [dotaMode, setDotaModeLocal] = useState(false)
  const [enterDelay, setEnterDelay] = useState(120)
  const [sendDelay, setSendDelay] = useState(60)

  const handleSaveHotkey = async (type: 'start' | 'stop', key: string) => {
    await saveHotkey(type, key)
  }

  const { startKey, stopKey, setStartKey, setStopKey, listeningFor, startListening, stopListening } =
    useHotkeys('F1', 'F2', handleSaveHotkey)

  useEffect(() => {
    const init = async () => {
      const keys = await getHotkeys()
      if (keys) { setStartKey(keys.start); setStopKey(keys.stop) }
      const dur = await getDuration()
      if (dur != null) setTotalSec(dur)
      const settings = await getSettings()
      if (settings) {
        setUiScale(settings.uiScale)
        setDotaModeLocal(settings.dotaMode)
        setEnterDelay(settings.dotaEnterDelay ?? 120)
        setSendDelay(settings.dotaSendDelay ?? 60)
        const theme = settings.syncThemeWithOS ? null : settings.theme
        if (theme) document.documentElement.classList.toggle('light', theme === 'light')
        document.documentElement.style.fontSize = `${settings.uiScale / 100}rem`
      }
    }
    init()
  }, [])

  useEffect(() => {
    const unsub1 = onMessage('status-update', (statusType: AppStatus, text: string) => {
      setStatus(statusType); setStatusText(text)
    })
    const unsub2 = onMessage('number-update', (number: string) => setCurrentNumber(number))
    const unsub3 = onMessage('counter-update', (cur: number, tot: number) => { setCurrent(cur); setTotal(tot) })
    const unsub4 = onMessage('global-hotkey', (action: string) => {
      if (action === 'start') { setStatus('running'); startSending() }
      else if (action === 'stop') { stopSending() }
    })
    const unsub5 = onMessage('theme-changed', (theme: string) => {
      document.documentElement.classList.toggle('light', theme === 'light')
    })
    return () => { unsub1?.(); unsub2?.(); unsub3?.(); unsub4?.(); unsub5?.() }
  }, [])

  useEffect(() => {
    setOnline(navigator.onLine)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const handleStart = () => { setStatus('running'); startSending() }
  const handleStop = () => { stopSending() }
  const handleDurationChange = (value: number) => { setTotalSec(value); setDuration(value) }

  const handleDotaToggle = () => {
    const next = !dotaMode
    setDotaModeLocal(next)
    setDotaMode(next)
  }

  const inputBase: React.CSSProperties = {
    width: 56, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 8, padding: '4px 8px', fontSize: 11, color: 'var(--text-secondary)',
    textAlign: 'center', fontWeight: 600, outline: 'none'
  }

  return (
    <div className="glass-panel">
      <div className="orb w-80 h-80 orb-red -top-40 -right-40" />
      <div className="orb w-64 h-64 orb-white -bottom-32 -left-32" />

      <Header
        onOpenSettings={() => setSettingsOpen(true)}
        status={status}
        statusText={statusText}
      />

      <div className="content">
        <NumberDisplay number={currentNumber} />

        <Counter current={current} total={total} />

        <div className="split-row">
          <HotkeySettings
            startKey={startKey}
            stopKey={stopKey}
            listeningFor={listeningFor}
            onStartListening={() => { stopListening(); startListening('start') }}
            onStopListening={() => { stopListening(); startListening('stop') }}
          />
          <SpeedControl
            duration={totalSec}
            onChange={handleDurationChange}
            disabled={status === 'running'}
          />
        </div>

        <div>
          <div
            onClick={handleDotaToggle}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 14, padding: '10px 14px', cursor: 'pointer',
              transition: 'background 0.15s', WebkitAppRegion: 'no-drag' as any
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Gamepad2 size={14} style={{ color: dotaMode ? 'var(--accent)' : 'var(--text-muted)' }} />
              <span>Режим Dota 2</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                {dotaMode ? 'ENTER + число + ENTER' : 'число + ENTER'}
              </span>
            </span>
            <div className={`toggle-switch ${dotaMode ? 'active' : ''}`} />
          </div>

          {dotaMode && (
            <div style={{
              display: 'flex', gap: 12, marginTop: 8,
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 14, padding: '10px 14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Открытие</span>
                <input
                  type="number"
                  min={10}
                  max={1000}
                  value={enterDelay}
                  onChange={(e) => {
                    const v = parseInt(e.target.value)
                    if (!isNaN(v) && v >= 10 && v <= 1000) {
                      setEnterDelay(v)
                      setDotaDelays(v, sendDelay)
                    }
                  }}
                  style={inputBase}
                />
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>мс</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Отправка</span>
                <input
                  type="number"
                  min={10}
                  max={1000}
                  value={sendDelay}
                  onChange={(e) => {
                    const v = parseInt(e.target.value)
                    if (!isNaN(v) && v >= 10 && v <= 1000) {
                      setSendDelay(v)
                      setDotaDelays(enterDelay, v)
                    }
                  }}
                  style={inputBase}
                />
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>мс</span>
              </div>
            </div>
          )}
        </div>

        <Controls onStart={handleStart} onStop={handleStop} status={status} />

        <div className="footer-row" style={{ justifyContent: 'flex-end' }}>
          <span className="footer-item">v1.0.0</span>
        </div>
      </div>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
