import { useEffect, useCallback } from 'react'

export function useElectron() {
  const sendMessage = useCallback(async (channel: string, ...args: any[]) => {
    if (window.electronAPI) {
      return await window.electronAPI.sendMessage(channel, ...args)
    }
    return null
  }, [])

  const onMessage = useCallback((channel: string, callback: (...args: any[]) => void) => {
    if (window.electronAPI) {
      return window.electronAPI.onMessage(channel, callback)
    }
    return () => {}
  }, [])

  const closeWindow = useCallback(() => sendMessage('window-close'), [sendMessage])
  const minimizeWindow = useCallback(() => sendMessage('window-minimize'), [sendMessage])
  const maximizeWindow = useCallback(() => sendMessage('window-maximize'), [sendMessage])
  const isMaximized = useCallback(async () => sendMessage('window-is-maximized'), [sendMessage])

  const getHotkeys = useCallback(async () => sendMessage('get-hotkeys'), [sendMessage])
  const saveHotkey = useCallback(async (type: 'start' | 'stop', key: string) => sendMessage('save-hotkey', type, key), [sendMessage])
  const reloadHotkeys = useCallback(async () => sendMessage('reload-hotkeys'), [sendMessage])

  const getSettings = useCallback(async () => sendMessage('get-settings'), [sendMessage])
  const setSetting = useCallback(async (key: string, value: any) => sendMessage('set-setting', key, value), [sendMessage])
  const resetSettings = useCallback(async () => sendMessage('reset-settings'), [sendMessage])

  const getDuration = useCallback(async () => sendMessage('get-duration'), [sendMessage])
  const setDuration = useCallback(async (seconds: number) => sendMessage('set-duration', seconds), [sendMessage])

  const getAutoStart = useCallback(async () => sendMessage('get-auto-start'), [sendMessage])
  const setAutoStart = useCallback(async (enable: boolean) => sendMessage('set-auto-start', enable), [sendMessage])

  const showNotification = useCallback(async (title: string, body: string) => sendMessage('show-notification', { title, body }), [sendMessage])

  const setProgressBar = useCallback(async (progress: number) => sendMessage('set-progress-bar', progress), [sendMessage])

  const getDotaMode = useCallback(async () => sendMessage('get-dota-mode'), [sendMessage])
  const setDotaMode = useCallback(async (enabled: boolean) => sendMessage('set-dota-mode', enabled), [sendMessage])
  const getDotaDelays = useCallback(async () => sendMessage('get-dota-delays'), [sendMessage])
  const setDotaDelays = useCallback(async (enterDelay: number, sendDelay: number) => sendMessage('set-dota-delays', enterDelay, sendDelay), [sendMessage])

  const startSending = useCallback(() => sendMessage('start-sending'), [sendMessage])
  const stopSending = useCallback(() => sendMessage('stop-sending'), [sendMessage])

  return {
    sendMessage,
    onMessage,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    isMaximized,
    getHotkeys,
    saveHotkey,
    reloadHotkeys,
    getSettings,
    setSetting,
    resetSettings,
    getDuration,
    setDuration,
    getAutoStart,
    setAutoStart,
    showNotification,
    setProgressBar,
    getDotaMode,
    setDotaMode,
    getDotaDelays,
    setDotaDelays,
    startSending,
    stopSending
  }
}
