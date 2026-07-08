'use client'

import { useState, useEffect } from 'react'
import { useElectron } from '@/hooks/useElectron'
import { useHotkeys } from '@/hooks/useHotkeys'
import { Header } from '@/components/Header'
import { Status } from '@/components/Status'
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
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    getHotkeys,
    saveHotkey,
    getSettings,
    getDuration,
    setDuration,
    startSending,
    stopSending,
    onMessage
  } = useElectron()

  const [status, setStatus] = useState<AppStatus>('idle')
  const [statusText, setStatusText] = useState('ОЖИДАНИЕ')
  const [currentNumber, setCurrentNumber] = useState('1000-7')
  const [current, setCurrent] = useState(0)
  const [total, setTotal] = useState(TOTAL_COUNT)
  const [totalSec, setTotalSec] = useState(25)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [animations, setAnimations] = useState(true)
  const [uiScale, setUiScale] = useState(100)
  const [online, setOnline] = useState(true)

  const handleSaveHotkey = async (type: 'start' | 'stop', key: string) => {
    await saveHotkey(type, key)
  }

  const {
    startKey,
    stopKey,
    setStartKey,
    setStopKey,
    listeningFor,
    startListening,
    stopListening
  } = useHotkeys('F1', 'F2', handleSaveHotkey)

  useEffect(() => {
    const init = async () => {
      const keys = await getHotkeys()
      if (keys) {
        setStartKey(keys.start)
        setStopKey(keys.stop)
      }
      const dur = await getDuration()
      if (dur != null) setTotalSec(dur)
      const settings = await getSettings()
      if (settings) {
        setAnimations(settings.animations)
        setUiScale(settings.uiScale)
        const theme = settings.syncThemeWithOS ? null : settings.theme
        if (theme) document.documentElement.classList.toggle('light', theme === 'light')
        document.documentElement.style.fontSize = `${settings.uiScale / 100}rem`
      }
    }
    init()
  }, [])

  useEffect(() => {
    const unsub1 = onMessage('status-update', (statusType: AppStatus, text: string) => {
      setStatus(statusType)
      setStatusText(text)
    })

    const unsub2 = onMessage('number-update', (number: string) => {
      setCurrentNumber(number)
    })

    const unsub3 = onMessage('counter-update', (cur: number, tot: number) => {
      setCurrent(cur)
      setTotal(tot)
    })

    const unsub4 = onMessage('global-hotkey', (action: string) => {
      if (action === 'start') {
        setStatus('running')
        startSending()
      } else if (action === 'stop') {
        stopSending()
      }
    })

    const unsub5 = onMessage('theme-changed', (theme: string) => {
      document.documentElement.classList.toggle('light', theme === 'light')
    })

    return () => {
      unsub1?.()
      unsub2?.()
      unsub3?.()
      unsub4?.()
      unsub5?.()
    }
  }, [])

  // Network monitoring
  useEffect(() => {
    setOnline(navigator.onLine)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const handleStart = () => {
    setStatus('running')
    startSending()
  }

  const handleStop = () => {
    stopSending()
  }

  const handleDurationChange = (value: number) => {
    setTotalSec(value)
    setDuration(value)
  }

  return (
    <div className="glass-panel">
      <div className="orb w-80 h-80 orb-red -top-40 -right-40" />
      <div className="orb w-64 h-64 orb-white -bottom-32 -left-32" />

      <Header onOpenSettings={() => setSettingsOpen(true)} />

      <div className="safe-zone">
        <div className="flex items-center justify-between flex-shrink-0">
          <Status status={status} text={statusText} />
          <div className="flex items-center gap-3">
            <span className={`network-badge ${online ? 'online' : 'offline'}`}>
              {online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <NumberDisplay number={currentNumber} />

        <Counter current={current} total={total} />

        <div className="content-row">
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

        <Controls onStart={handleStart} onStop={handleStop} status={status} />
      </div>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
