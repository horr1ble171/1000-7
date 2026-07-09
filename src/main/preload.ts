import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel: string, ...args: any[]) => {
    const validChannels = [
      'start-sending',
      'stop-sending',
      'window-close',
      'window-minimize',
      'window-maximize',
      'window-is-maximized',
      'get-hotkeys',
      'save-hotkey',
      'reload-hotkeys',
      'get-settings',
      'set-setting',
      'reset-settings',
      'get-duration',
      'set-duration',
      'get-auto-start',
      'set-auto-start',
      'show-notification',
      'set-progress-bar',
      'get-dota-mode',
      'set-dota-mode',
      'get-dota1000-mode',
      'set-dota1000-mode'
    ]
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args)
    }
  },
  onMessage: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = [
      'status-update',
      'number-update',
      'counter-update',
      'global-hotkey',
      'window-maximized-changed',
      'theme-changed',
      'deep-link'
    ]
    if (validChannels.includes(channel)) {
      const subscription = (_event: any, ...args: any[]) => callback(...args)
      ipcRenderer.on(channel, subscription)
      return () => {
        ipcRenderer.removeListener(channel, subscription)
      }
    }
  }
})
