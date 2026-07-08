export type AppStatus = 'idle' | 'running' | 'stopped' | 'done'

export interface HotkeyConfig {
  start: string
  stop: string
}

export interface ElectronAPI {
  sendMessage: (channel: string, ...args: any[]) => Promise<any>
  onMessage: (channel: string, callback: (...args: any[]) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
